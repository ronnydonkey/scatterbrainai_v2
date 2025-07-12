import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { 
  Thought, 
  ThoughtInsert, 
  ThoughtUpdate, 
  CreateThoughtParams,
  ThoughtsQueryParams,
  ApiError 
} from '@/types/api';

// Query keys
export const thoughtsKeys = {
  all: ['thoughts'] as const,
  lists: () => [...thoughtsKeys.all, 'list'] as const,
  list: (filters: ThoughtsQueryParams) => [...thoughtsKeys.lists(), filters] as const,
  details: () => [...thoughtsKeys.all, 'detail'] as const,
  detail: (id: string) => [...thoughtsKeys.details(), id] as const,
};

// Fetch thoughts with advanced filtering
export const useThoughts = (params: ThoughtsQueryParams = {}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: thoughtsKeys.list(params),
    queryFn: async (): Promise<Thought[]> => {
      if (!user) throw new Error('Authentication required');

      let query = supabase
        .from('thoughts')
        .select('*')
        .eq('user_id', user.id)
        .order(params.sortBy || 'created_at', { 
          ascending: params.sortOrder === 'asc' 
        });

      // Apply filters
      if (params.tags?.length) {
        query = query.overlaps('tags', params.tags);
      }
      
      if (params.search) {
        query = query.or(`content.ilike.%${params.search}%,title.ilike.%${params.search}%`);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Thought[];
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

// Fetch single thought
export const useThought = (thoughtId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: thoughtsKeys.detail(thoughtId),
    queryFn: async (): Promise<Thought> => {
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .eq('id', thoughtId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as Thought;
    },
    enabled: !!user && !!thoughtId,
  });
};

// Create thought with optimistic updates
export const useCreateThought = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateThoughtParams): Promise<Thought> => {
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

      const thoughtData: ThoughtInsert = {
        user_id: user.id,
        organization_id: profile.organization_id,
        content: params.content,
        title: params.title,
        tags: params.tags || [],
        context: params.context,
        mood: params.mood,
      };

      const { data, error } = await supabase
        .from('thoughts')
        .insert(thoughtData)
        .select()
        .single();

      if (error) throw error;
      return data as Thought;
    },
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: thoughtsKeys.lists() });

      // Snapshot previous value
      const previousThoughts = queryClient.getQueryData(thoughtsKeys.list({}));

      // Optimistically update
      const optimisticThought: Thought = {
        id: `temp-${Date.now()}`,
        user_id: user?.id || '',
        organization_id: '',
        content: params.content,
        title: params.title || null,
        tags: params.tags || [],
        context: params.context || null,
        mood: params.mood || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_processed: false,
        processed_at: null,
        attachments: [],
      };

      queryClient.setQueryData(
        thoughtsKeys.list({}),
        (old: Thought[] = []) => [optimisticThought, ...old]
      );

      return { previousThoughts };
    },
    onError: (error: ApiError, variables, context) => {
      // Rollback on error
      if (context?.previousThoughts) {
        queryClient.setQueryData(thoughtsKeys.list({}), context.previousThoughts);
      }
      
      toast({
        title: "Failed to create thought",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: thoughtsKeys.lists() });
      
      toast({
        title: "Thought captured! ✨",
        description: "Your neural spark has been recorded.",
      });
    },
  });
};

// Update thought
export const useUpdateThought = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ThoughtUpdate }): Promise<Thought> => {
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('thoughts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Thought;
    },
    onSuccess: (data) => {
      // Update specific thought in cache
      queryClient.setQueryData(thoughtsKeys.detail(data.id), data);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: thoughtsKeys.lists() });
      
      toast({
        title: "Thought updated ⚡",
        description: "Your neural pathways have been strengthened.",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Failed to update thought",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Delete thought
export const useDeleteThought = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (thoughtId: string): Promise<void> => {
      if (!user) throw new Error('Authentication required');

      const { error } = await supabase
        .from('thoughts')
        .delete()
        .eq('id', thoughtId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onMutate: async (thoughtId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: thoughtsKeys.lists() });

      // Remove from cache optimistically
      queryClient.setQueriesData<Thought[]>(
        { queryKey: thoughtsKeys.lists() },
        (old) => old?.filter(thought => thought.id !== thoughtId) || []
      );

      // Remove detail from cache
      queryClient.removeQueries({ queryKey: thoughtsKeys.detail(thoughtId) });
    },
    onSuccess: () => {
      toast({
        title: "Thought dissolved 💨",
        description: "The neural connection has been severed.",
      });
    },
    onError: (error: ApiError) => {
      // Refetch on error to restore state
      queryClient.invalidateQueries({ queryKey: thoughtsKeys.lists() });
      
      toast({
        title: "Failed to delete thought",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Real-time thoughts subscription
export const useThoughtsSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['thoughts-subscription'],
    queryFn: () => null,
    enabled: false,
    refetchInterval: false,
    initialData: null,
    meta: {
      subscription: supabase
        .channel('thoughts-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'thoughts',
            filter: `user_id=eq.${user?.id}`,
          },
          (payload) => {
            // Invalidate thoughts queries on any change
            queryClient.invalidateQueries({ queryKey: thoughtsKeys.all });
          }
        )
        .subscribe(),
    },
  });
};