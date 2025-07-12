// API Integration Layer for ScatterbrainAI
// Export all custom hooks and utilities

// Thoughts API
export {
  useThoughts,
  useThought,
  useCreateThought,
  useUpdateThought,
  useDeleteThought,
  useThoughtsSubscription,
  thoughtsKeys,
} from './useThoughts';

// Trending Topics API
export {
  useTrending,
  useTrendingTopic,
  useResearchTopic,
  useRefreshTrending,
  useTrendingSubscription,
  useTrendingInsights,
  trendingKeys,
} from './useTrending';

// Content Generation API
export {
  useContentSuggestions,
  useGenerateContent,
  useRegenerateContent,
  usePublishContent,
  useScheduledContent,
  useContentPerformance,
  contentKeys,
} from './useContentGeneration';

// Voice Capture API
export {
  useVoiceCapture,
} from './useVoiceCapture';

// Re-export types
export type {
  Thought,
  ThoughtInsert,
  ThoughtUpdate,
  TrendingTopic,
  GeneratedContent,
  GeneratedContentInsert,
  VoiceCapture,
  CreateThoughtParams,
  GenerateContentParams,
  PublishContentParams,
  ThoughtsQueryParams,
  TrendingQueryParams,
  ApiResponse,
  ApiError,
  NeuralInsights,
} from '@/types/api';