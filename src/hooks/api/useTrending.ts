import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { TrendingTopic, TrendingQueryParams, ApiError } from '@/types/api';

// Query keys
export const trendingKeys = {
  all: ['trending'] as const,
  lists: () => [...trendingKeys.all, 'list'] as const,
  list: (filters: TrendingQueryParams) => [...trendingKeys.lists(), filters] as const,
  details: () => [...trendingKeys.all, 'detail'] as const,
  detail: (id: string) => [...trendingKeys.details(), id] as const,
  research: (topicId: string) => [...trendingKeys.all, 'research', topicId] as const,
};

// Fetch trending topics with neural scoring
export const useTrending = (params: TrendingQueryParams = {}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: trendingKeys.list(params),
    queryFn: async (): Promise<TrendingTopic[]> => {
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
        .from('trending_topics')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('score', { ascending: false });

      // Apply filters
      if (params.source) {
        query = query.eq('source', params.source);
      }

      if (params.minScore) {
        query = query.gte('score', params.minScore);
      }

      if (params.timeframe) {
        const hoursAgo = params.timeframe === '24h' ? 24 : 
                        params.timeframe === '7d' ? 168 : 720;
        const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', cutoff);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Enhance with neural scoring
      return (data as TrendingTopic[]).map(topic => ({
        ...topic,
        relevanceScore: topic.score,
        trend: calculateTrend(topic),
        relatedThoughts: [], // TODO: Calculate based on user's thoughts
      }));
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    refetchInterval: 300000, // Auto-refresh every 5 minutes
  });
};

// Calculate trend direction based on metrics
const calculateTrend = (topic: TrendingTopic): 'rising' | 'peak' | 'declining' => {
  const ageHours = (Date.now() - new Date(topic.created_at).getTime()) / (1000 * 60 * 60);
  
  // Simple heuristic based on age and score
  if (ageHours < 6 && topic.score > 70) return 'rising';
  if (ageHours < 24 && topic.score > 85) return 'peak';
  return 'declining';
};

// Fetch single trending topic with detailed research
export const useTrendingTopic = (topicId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: trendingKeys.detail(topicId),
    queryFn: async (): Promise<TrendingTopic> => {
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .eq('id', topicId)
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        relevanceScore: data.score,
        trend: calculateTrend(data as TrendingTopic),
        relatedThoughts: [], // TODO: Find related thoughts
      } as TrendingTopic;
    },
    enabled: !!user && !!topicId,
  });
};

// Research trending topic with Perplexity
export const useResearchTopic = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topicId: string): Promise<{ research: any; sources: any[] }> => {
      if (!user) throw new Error('Authentication required');

      // Get the topic details first
      const { data: topic, error: topicError } = await supabase
        .from('trending_topics')
        .select('*')
        .eq('id', topicId)
        .single();

      if (topicError) throw topicError;

      // Call the claude-research edge function
      const { data, error } = await supabase.functions.invoke('claude-research', {
        body: { 
          query: topic.topic,
          topicId: topicId,
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, topicId) => {
      // Update the topic with research data
      queryClient.setQueryData(
        trendingKeys.detail(topicId),
        (old: TrendingTopic | undefined) => 
          old ? { ...old, perplexity_research: data.research } : undefined
      );

      // Invalidate trending lists to show updated research status
      queryClient.invalidateQueries({ queryKey: trendingKeys.lists() });

      toast({
        title: "Research completed! 🔬",
        description: "Neural intelligence has analyzed the trend.",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Research failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Refresh trending topics manually
export const useRefreshTrending = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      // Just invalidate queries to force refetch
      await queryClient.invalidateQueries({ queryKey: trendingKeys.all });
    },
    onSuccess: () => {
      toast({
        title: "Trends refreshed ⚡",
        description: "Neural sensors have been recalibrated.",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Refresh failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Real-time trending subscription
export const useTrendingSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['trending-subscription'],
    queryFn: () => null,
    enabled: false,
    refetchInterval: false,
    initialData: null,
    meta: {
      subscription: supabase
        .channel('trending-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'trending_topics',
          },
          (payload) => {
            // Invalidate trending queries on new topics
            queryClient.invalidateQueries({ queryKey: trendingKeys.all });
            
            // Show notification for high-scoring new trends
            if (payload.new && (payload.new as any).score > 80) {
              toast({
                title: "🔥 Hot trend detected!",
                description: (payload.new as any).topic,
              });
            }
          }
        )
        .subscribe(),
    },
  });
};

// Get trending insights for user's niche
export const useTrendingInsights = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['trending-insights'],
    queryFn: async () => {
      if (!user) throw new Error('Authentication required');

      // Get user's organization and niche
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, organizations(niche)')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('User organization not found');
      }

      // Get trending topics for the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: trends, error } = await supabase
        .from('trending_topics')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .gte('created_at', sevenDaysAgo)
        .order('score', { ascending: false });

      if (error) throw error;

      // Calculate insights
      const totalTrends = trends.length;
      const avgScore = trends.reduce((sum, t) => sum + t.score, 0) / totalTrends || 0;
      const topSources = Object.entries(
        trends.reduce((acc, t) => {
          acc[t.source] = (acc[t.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort(([,a], [,b]) => b - a).slice(0, 5);

      return {
        totalTrends,
        avgScore,
        topSources,
        hotKeywords: extractHotKeywords(trends),
        scoreDistribution: calculateScoreDistribution(trends),
      };
    },
    enabled: !!user,
    staleTime: 300000, // 5 minutes
  });
};

// Helper functions
const extractHotKeywords = (trends: any[]): string[] => {
  const keywordCounts: Record<string, number> = {};
  
  trends.forEach(trend => {
    if (trend.keywords) {
      trend.keywords.forEach((keyword: string) => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      });
    }
  });

  return Object.entries(keywordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([keyword]) => keyword);
};

const calculateScoreDistribution = (trends: any[]) => {
  const buckets = { low: 0, medium: 0, high: 0, viral: 0 };
  
  trends.forEach(trend => {
    if (trend.score < 30) buckets.low++;
    else if (trend.score < 60) buckets.medium++;
    else if (trend.score < 85) buckets.high++;
    else buckets.viral++;
  });

  return buckets;
};