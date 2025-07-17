
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export interface SynthesizeRequest {
  input: string;
  context: {
    timeOfDay: number;
    inputMethod: 'text' | 'voice' | 'upload';
    sessionHistory?: string[];
    userGoals?: string[];
    urgencyLevel: 'low' | 'medium' | 'high';
  };
  outputPreferences: {
    insightDepth: 'brief' | 'detailed' | 'creative';
    actionFormat: 'calendar-first' | 'todos-first' | 'content-first';
    contentPlatforms: string[];
    calendarIntegration: boolean;
  };
  features: {
    communityInsights: boolean;
    trendAnalysis: boolean;
    contentGeneration: boolean;
    calendarSync: boolean;
  };
  userId?: string;
  sessionId: string;
  preferences: any;
}

export interface StreamedInsight {
  type: 'progress' | 'insight' | 'action' | 'content' | 'complete' | 'error';
  data: any;
  timestamp: number;
}

export interface DetectedTopic {
  topic: string;
  confidence: number;
}

export interface SmartSources {
  communities: string[];
  websites: string[];
  contentFocus: string[];
  reasoning: string;
}

export interface SynthesizeResponse {
  success: boolean;
  processingId: string;
  insights: {
    keyThemes: Array<{
      theme: string;
      confidence: number;
      connections: string[];
      actionable: boolean;
    }>;
    actionItems: Array<{
      task: string;
      priority: 'low' | 'medium' | 'high';
      estimatedDuration: string;
      bestTiming: string;
      calendarReady?: {
        title: string;
        description: string;
        duration: number;
        suggestedTimes: string[];
      };
    }>;
    contentSuggestions: {
      [platform: string]: {
        content: string;
        engagement_prediction: number;
        hashtags?: string[];
        best_time?: string;
        post_type?: string;
      };
    };
    communityConnections: Array<{
      similarThought: string;
      relevance: number;
      source: string;
    }>;
    metadata: {
      processingTime: number;
      tokensUsed: number;
      confidenceScore: number;
      nextRecommendedAnalysis?: string;
    };
  };
  // New adaptive intelligence fields
  detectedTopics?: DetectedTopic[];
  smartSources?: SmartSources;
  userProfile?: {
    adaptationLevel: number;
    topInterests: string[];
    totalInsights: number;
  };
}

// Cache for API responses
class ResponseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl = 300000) { // 5 minutes default
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }
  
  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  generateKey(input: string, preferences: any): string {
    try {
      const normalizedInput = input.toLowerCase().trim();
      const prefString = JSON.stringify(preferences);
      // Use encodeURIComponent to safely handle Unicode characters, then create a simple hash
      const combined = encodeURIComponent(normalizedInput + prefString);
      return combined.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32) || 'default_key';
    } catch (error) {
      console.warn('Failed to generate cache key:', error);
      return 'default_key';
    }
  }
}

const responseCache = new ResponseCache();

// Check if error is retryable
const isRetryableError = (error: any): boolean => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) return true;
  if (error.status >= 500) return true;
  if (error.status === 429) return true; // Rate limit
  if (error.status === 408) return true; // Timeout
  return false;
};

// Exponential backoff delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useSynthesizeStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<StreamedInsight | null>(null);
  const [accumulatedInsights, setAccumulatedInsights] = useState<StreamedInsight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { handleError, handleAsyncError } = useErrorHandler();

  const synthesizeWithStream = useCallback(async (
    request: SynthesizeRequest,
    onInsight: (insight: StreamedInsight) => void = () => {},
    retryCount = 0
  ): Promise<SynthesizeResponse | null> => {
    setIsStreaming(true);
    setError(null);
    setAccumulatedInsights([]);

    // Check cache first
    const cacheKey = responseCache.generateKey(request.input, request.preferences);
    const cachedResponse = responseCache.get(cacheKey);
    
    if (cachedResponse) {
      setIsStreaming(false);
      toast({
        title: "Insights ready! ⚡",
        description: "Found similar analysis from recent session.",
      });
      return cachedResponse;
    }

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error: functionError } = await supabase.functions.invoke('synthesize', {
        body: {
          input: request.input,
          userId: request.userId,
          timestamp: new Date().toISOString(),
          sessionId: request.sessionId,
          preferences: request.preferences
        },
      });

      if (functionError) {
        throw new Error(`Function Error: ${functionError.message}`);
      }

      if (!data) {
        throw new Error('No response data received');
      }

      // Since this is a direct function response, treat it as the final response
      const finalResponse: SynthesizeResponse = {
        success: data.success,
        processingId: data.id || 'unknown',
        insights: {
          keyThemes: data.insights?.keyThemes?.map((theme: any) => ({
            theme: theme.theme,
            confidence: theme.confidence,
            connections: theme.relatedConcepts || [],
            actionable: true
          })) || [],
          actionItems: data.insights?.actionItems?.map((action: any) => ({
            task: action.task,
            priority: action.priority,
            estimatedDuration: action.estimatedDuration,
            bestTiming: action.suggestedTime
          })) || [],
          contentSuggestions: data.insights?.contentSuggestions || {},
          communityConnections: [],
          metadata: {
            processingTime: data.processingTime || 0,
            tokensUsed: 0,
            confidenceScore: 0.8
          }
        },
        detectedTopics: data.detectedTopics,
        smartSources: data.smartSources,
        userProfile: data.userProfile
      };

      // Simulate streaming insights for UX
      const progressInsight: StreamedInsight = {
        type: 'progress',
        data: { message: 'Analyzing your thought...', progress: 50 },
        timestamp: Date.now()
      };
      
      setCurrentInsight(progressInsight);
      setAccumulatedInsights([progressInsight]);
      onInsight(progressInsight);

      // Small delay for UX
      await delay(500);

      const completeInsight: StreamedInsight = {
        type: 'complete',
        data: finalResponse,
        timestamp: Date.now()
      };

      setCurrentInsight(completeInsight);
      setAccumulatedInsights(prev => [...prev, completeInsight]);
      onInsight(completeInsight);

      // Cache successful response
      responseCache.set(cacheKey, finalResponse);
      
      toast({
        title: "Synthesis complete! ✨",
        description: `Generated insights with ${data.detectedTopics?.length || 0} detected topics`,
      });
      
      setIsStreaming(false);
      return finalResponse;

    } catch (error) {
      handleAsyncError(error, { component: 'useSynthesizeStream', action: 'synthesize' });
      
      if (retryCount < 3) {
        const backoffDelay = Math.pow(2, retryCount) * 1000;
        
        toast({
          title: "Retrying analysis...",
          description: `Attempt ${retryCount + 2}/4 in ${backoffDelay/1000}s`,
        });
        
        await delay(backoffDelay);
        return synthesizeWithStream(request, onInsight, retryCount + 1);
      }
      
      setIsStreaming(false);
      return null;
    }
  }, [handleAsyncError]);

  const clearInsights = useCallback(() => {
    setCurrentInsight(null);
    setAccumulatedInsights([]);
    setError(null);
  }, []);

  return {
    synthesizeWithStream,
    isStreaming,
    currentInsight,
    accumulatedInsights,
    error,
    clearInsights,
  };
};

// Generate unique session ID
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Detect urgency level from text
export const detectUrgency = (text: string): 'low' | 'medium' | 'high' => {
  const urgencyKeywords = {
    high: ['urgent', 'asap', 'emergency', 'critical', 'immediately', 'deadline', 'overdue'],
    medium: ['soon', 'important', 'priority', 'need to', 'should', 'tomorrow'],
  };

  const lowerText = text.toLowerCase();
  
  if (urgencyKeywords.high.some(keyword => lowerText.includes(keyword))) {
    return 'high';
  }
  if (urgencyKeywords.medium.some(keyword => lowerText.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
};
