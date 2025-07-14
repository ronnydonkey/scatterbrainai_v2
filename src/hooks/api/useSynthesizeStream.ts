import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

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
    const normalizedInput = input.toLowerCase().trim();
    const prefString = JSON.stringify(preferences);
    return btoa(normalizedInput + prefString).slice(0, 32);
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
      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          streamResponse: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finalResponse: SynthesizeResponse | null = null;
      const insights: StreamedInsight[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const insight: StreamedInsight = {
                type: data.type,
                data: data.data,
                timestamp: Date.now(),
              };

              insights.push(insight);
              setCurrentInsight(insight);
              setAccumulatedInsights(prev => [...prev, insight]);
              onInsight(insight);

              if (insight.type === 'complete') {
                finalResponse = insight.data as SynthesizeResponse;
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }

      setIsStreaming(false);

      if (finalResponse) {
        // Cache successful response
        responseCache.set(cacheKey, finalResponse);
        
        toast({
          title: "Synthesis complete! ✨",
          description: `Generated ${finalResponse.insights.keyThemes.length} key insights`,
        });
        
        return finalResponse;
      }

      throw new Error('No complete response received');

    } catch (error: any) {
      console.error('Synthesis error:', error);
      
      if (retryCount < 3 && isRetryableError(error)) {
        const backoffDelay = Math.pow(2, retryCount) * 1000;
        
        toast({
          title: "Retrying analysis...",
          description: `Attempt ${retryCount + 2}/4 in ${backoffDelay/1000}s`,
        });
        
        await delay(backoffDelay);
        return synthesizeWithStream(request, onInsight, retryCount + 1);
      }

      setIsStreaming(false);
      setError(error.message);
      
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });

      return null;
    }
  }, []);

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