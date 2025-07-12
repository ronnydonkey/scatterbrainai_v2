import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { 
  GeneratedContent, 
  GeneratedContentInsert,
  GenerateContentParams,
  PublishContentParams,
  ApiError 
} from '@/types/api';

// Query keys
export const contentKeys = {
  all: ['content'] as const,
  suggestions: () => [...contentKeys.all, 'suggestions'] as const,
  suggestion: (id: string) => [...contentKeys.suggestions(), id] as const,
  byThought: (thoughtId: string) => [...contentKeys.all, 'thought', thoughtId] as const,
  scheduled: () => [...contentKeys.all, 'scheduled'] as const,
  performance: () => [...contentKeys.all, 'performance'] as const,
};

// Fetch content suggestions
export const useContentSuggestions = (thoughtId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: thoughtId ? contentKeys.byThought(thoughtId) : contentKeys.suggestions(),
    queryFn: async (): Promise<GeneratedContent[]> => {
      if (!user) throw new Error('Authentication required');

      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('User organization not found');
      }

      let query = supabase
        .from('content_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (thoughtId) {
        query = query.eq('thought_id', thoughtId);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      return (data as any[]).map(content => ({
        ...content,
        platform: inferPlatform(content.content_type),
        metadata: {
          wordCount: content.ai_generated_content?.split(' ').length || 0,
          contentPillars: content.target_keywords || [],
          ...(typeof content.content_outline === 'object' ? content.content_outline as Record<string, any> : {}),
        },
        neuralAlignment: content.voice_authenticity_score || 0,
      } as GeneratedContent));
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });
};

// Infer platform from content type
const inferPlatform = (contentType: string): GeneratedContent['platform'] => {
  const type = contentType.toLowerCase();
  if (type.includes('twitter') || type.includes('tweet')) return 'twitter';
  if (type.includes('linkedin')) return 'linkedin';
  if (type.includes('instagram')) return 'instagram';
  if (type.includes('tiktok')) return 'tiktok';
  if (type.includes('youtube')) return 'youtube';
  if (type.includes('blog')) return 'blog';
  return 'twitter'; // default
};

// Generate content from thought
export const useGenerateContent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: GenerateContentParams): Promise<GeneratedContent> => {
      if (!user) throw new Error('Authentication required');

      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('User organization not found');
      }

      // Call the generate-content edge function
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          thoughtId: params.thoughtId,
          platform: params.platform,
          contentType: params.contentType,
          tone: params.tone || 'professional',
          length: params.length || 'medium',
          targetAudience: params.targetAudience || 'general',
        }
      });

      if (error) throw error;

      // The edge function should create the content suggestion
      // Return the generated content
      return data as GeneratedContent;
    },
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: contentKeys.suggestions() });

      // Create optimistic content
      const optimisticContent: GeneratedContent = {
        id: `temp-${Date.now()}`,
        user_id: user?.id || '',
        organization_id: '',
        thought_id: params.thoughtId,
        title: `${params.platform} content`,
        content_type: params.contentType,
        description: 'Generating...',
        ai_generated_content: 'Neural networks are weaving your content...',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        platform: params.platform,
        metadata: {
          wordCount: 0,
          contentPillars: [],
        },
        neuralAlignment: 0,
        suggested_tone: params.tone,
        target_keywords: [],
        trending_topic_id: null,
        is_used: false,
        used_at: null,
        estimated_word_count: null,
        voice_authenticity_score: null,
        engagement_prediction: null,
        content_outline: {},
        performance_data: {},
      };

      // Add to cache optimistically
      queryClient.setQueryData(
        contentKeys.suggestions(),
        (old: GeneratedContent[] = []) => [optimisticContent, ...old]
      );

      return { optimisticContent };
    },
    onSuccess: (data, params) => {
      // Remove optimistic content and add real one
      queryClient.invalidateQueries({ queryKey: contentKeys.suggestions() });
      queryClient.invalidateQueries({ queryKey: contentKeys.byThought(params.thoughtId) });
      
      toast({
        title: "Content generated! ✨",
        description: `Your ${params.platform} content is ready to spark engagement.`,
      });
    },
    onError: (error: ApiError, params, context) => {
      // Remove optimistic content on error
      if (context?.optimisticContent) {
        queryClient.setQueryData(
          contentKeys.suggestions(),
          (old: GeneratedContent[] = []) => 
            old.filter(c => c.id !== context.optimisticContent.id)
        );
      }
      
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Regenerate content with different parameters
export const useRegenerateContent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      contentId, 
      params 
    }: { 
      contentId: string; 
      params: Partial<GenerateContentParams> 
    }): Promise<GeneratedContent> => {
      if (!user) throw new Error('Authentication required');

      // Get the original content to extract thought ID
      const { data: original, error: fetchError } = await supabase
        .from('content_suggestions')
        .select('*')
        .eq('id', contentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Call generate with updated parameters
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          thoughtId: original.thought_id,
          contentId: contentId, // Pass original ID for update
          platform: params.platform || inferPlatform(original.content_type),
          contentType: params.contentType || original.content_type,
          tone: params.tone || original.suggested_tone || 'professional',
          length: params.length || 'medium',
          targetAudience: params.targetAudience || 'general',
        }
      });

      if (error) throw error;
      return data as GeneratedContent;
    },
    onSuccess: (data) => {
      // Update specific content in cache
      queryClient.setQueryData(contentKeys.suggestion(data.id), data);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: contentKeys.suggestions() });
      if (data.thought_id) {
        queryClient.invalidateQueries({ queryKey: contentKeys.byThought(data.thought_id) });
      }
      
      toast({
        title: "Content regenerated! 🔄",
        description: "Fresh neural pathways have been forged.",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Regeneration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Publish content to platform
export const usePublishContent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: PublishContentParams): Promise<void> => {
      if (!user) throw new Error('Authentication required');

      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('User organization not found');
      }

      // Create schedule entry
      const { data: content } = await supabase
        .from('content_suggestions')
        .select('*')
        .eq('id', params.contentId)
        .eq('user_id', user.id)
        .single();

      if (!content) throw new Error('Content not found');

      const scheduleData = {
        user_id: user.id,
        organization_id: profile.organization_id,
        content_suggestion_id: params.contentId,
        platform: params.platform,
        platform_content: content.ai_generated_content,
        platform_settings: (params.platformSettings || {}) as any,
        scheduled_for: params.scheduledFor || new Date().toISOString(),
        status: params.scheduledFor ? 'scheduled' : 'publishing',
      };

      const { error } = await supabase
        .from('content_schedule')
        .insert(scheduleData);

      if (error) throw error;

      // Mark content as used
      await supabase
        .from('content_suggestions')
        .update({ 
          is_used: true, 
          used_at: new Date().toISOString() 
        })
        .eq('id', params.contentId);
    },
    onSuccess: (_, params) => {
      // Invalidate content queries
      queryClient.invalidateQueries({ queryKey: contentKeys.suggestions() });
      queryClient.invalidateQueries({ queryKey: contentKeys.scheduled() });
      
      const isScheduled = !!params.scheduledFor;
      toast({
        title: isScheduled ? "Content scheduled! 📅" : "Content publishing! 🚀",
        description: isScheduled 
          ? "Your content will go live at the scheduled time."
          : "Your content is being published to the platform.",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Publishing failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Get scheduled content
export const useScheduledContent = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: contentKeys.scheduled(),
    queryFn: async () => {
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('content_schedule')
        .select(`
          *,
          content_suggestions(*)
        `)
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });
};

// Get content performance analytics
export const useContentPerformance = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: contentKeys.performance(),
    queryFn: async () => {
      if (!user) throw new Error('Authentication required');

      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('User organization not found');
      }

      const { data, error } = await supabase
        .from('content_performance')
        .select(`
          *,
          content_suggestions(*)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Calculate aggregated metrics
      const totalViews = data.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalLikes = data.reduce((sum, p) => sum + (p.likes || 0), 0);
      const avgEngagement = data.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / data.length || 0;
      
      return {
        performance: data,
        metrics: {
          totalViews,
          totalLikes,
          avgEngagement,
          totalPosts: data.length,
        }
      };
    },
    enabled: !!user,
    staleTime: 300000, // 5 minutes
  });
};