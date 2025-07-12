// TypeScript interfaces for ScatterbrainAI data types
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Enhanced Thought interface with neural connections
export interface Thought extends Tables<'thoughts'> {
  connections?: string[]; // IDs of related thoughts
  voiceData?: {
    duration: number;
    transcript: string;
    confidence: number;
    audioUrl?: string;
  };
  neuralScore?: number; // AI-calculated relevance score
}

export interface ThoughtInsert extends TablesInsert<'thoughts'> {
  connections?: string[];
  voiceData?: Thought['voiceData'];
  neuralScore?: number;
}

export interface ThoughtUpdate extends TablesUpdate<'thoughts'> {
  connections?: string[];
  voiceData?: Thought['voiceData'];
  neuralScore?: number;
}

// Enhanced TrendingTopic interface
export interface TrendingTopic extends Tables<'trending_topics'> {
  relevanceScore: number;
  trend: 'rising' | 'peak' | 'declining';
  relatedThoughts?: string[]; // IDs of user thoughts connected to this topic
  neuralConnections?: {
    thoughtId: string;
    relevance: number;
    keywords: string[];
  }[];
}

// Generated Content interface
export interface GeneratedContent extends Tables<'content_suggestions'> {
  platform: 'twitter' | 'linkedin' | 'instagram' | 'tiktok' | 'youtube' | 'blog';
  metadata: {
    wordCount?: number;
    estimatedReach?: number;
    contentPillars?: string[];
    cta?: string;
    hashtags?: string[];
    scheduledFor?: string;
  };
  neuralAlignment?: number; // How well it matches user's voice
}

export interface GeneratedContentInsert extends TablesInsert<'content_suggestions'> {
  platform: GeneratedContent['platform'];
  metadata: GeneratedContent['metadata'];
  neuralAlignment?: number;
}

// Voice processing types
export interface VoiceCapture {
  id: string;
  audioBlob: Blob;
  duration: number;
  status: 'recording' | 'processing' | 'completed' | 'error';
  transcript?: string;
  confidence?: number;
  thoughtId?: string;
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    count: number;
    page?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Mutation types
export interface CreateThoughtParams {
  content: string;
  title?: string;
  tags?: string[];
  context?: string;
  mood?: string;
  voiceData?: Thought['voiceData'];
}

export interface GenerateContentParams {
  thoughtId: string;
  platform: GeneratedContent['platform'];
  contentType: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  targetAudience?: string;
}

export interface PublishContentParams {
  contentId: string;
  platform: GeneratedContent['platform'];
  scheduledFor?: string;
  platformSettings?: Record<string, unknown>;
}

// Query params
export interface ThoughtsQueryParams {
  tags?: string[];
  search?: string;
  sortBy?: 'created_at' | 'updated_at' | 'neuralScore';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TrendingQueryParams {
  source?: string;
  minScore?: number;
  timeframe?: '24h' | '7d' | '30d';
  niche?: string;
  limit?: number;
}

// Real-time subscription types
export interface RealtimeEvent<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: T;
  old?: T;
  table: string;
}

// Neural analytics types
export interface NeuralInsights {
  thoughtConnections: {
    thoughtId: string;
    connections: string[];
    strength: number;
  }[];
  topicalClusters: {
    topic: string;
    thoughts: string[];
    coherence: number;
  }[];
  voiceProfile: {
    dominantTones: string[];
    averageLength: number;
    topKeywords: string[];
    emotionalRange: Record<string, number>;
  };
}