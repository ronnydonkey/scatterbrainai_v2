import { supabase } from '@/integrations/supabase/client';

// Types for API responses
export interface SynthesisResult {
  success: boolean;
  id: string;
  processingTime: number;
  insights: {
    keyThemes: Array<{
      theme: string;
      confidence: number;
      evidence: string[];
      relatedConcepts: string[];
    }>;
    actionItems: Array<{
      id: string;
      task: string;
      priority: 'low' | 'medium' | 'high';
      category: string;
      estimatedDuration: string;
      suggestedTime: string;
      completed: boolean;
    }>;
    contentSuggestions: {
      twitter: {
        content: string;
        hashtags?: string[];
        engagement_prediction?: number;
      };
      linkedin: {
        content: string;
        post_type?: string;
        engagement_prediction?: number;
      };
      instagram: {
        content: string;
        style?: string;
        engagement_prediction?: number;
      };
    };
    researchSuggestions: Array<{
      topic: string;
      sources: string[];
      relevance: number;
    }>;
    calendarBlocks: Array<{
      title: string;
      duration: number;
      priority: string;
      suggestedTimes: string[];
    }>;
  };
  metadata: {
    wordCount: number;
    sentiment: string;
    complexity: string;
    topics: string[];
  };
  detectedTopics: Array<{
    topic: string;
    confidence: number;
  }>;
  smartSources: {
    communities: string[];
    websites: string[];
    contentFocus: string[];
    reasoning: string;
  };
  userProfile: {
    adaptationLevel: number;
    topInterests: string[];
    totalInsights: number;
  };
}

export interface ThoughtAnalysisRequest {
  input: string;
  userId?: string;
  timestamp: string;
  sessionId: string;
  preferences?: {
    preferredInput?: string;
    timeContext?: any;
    urgencyLevel?: string;
    socialPlatforms?: string[];
  };
}

// Main synthesis function
export const synthesizeThought = async (
  input: string,
  options: {
    userId?: string;
    sessionId?: string;
    preferences?: any;
  } = {}
): Promise<SynthesisResult> => {
  const { data, error } = await supabase.functions.invoke('synthesize', {
    body: {
      input,
      userId: options.userId,
      timestamp: new Date().toISOString(),
      sessionId: options.sessionId || `session_${Date.now()}`,
      preferences: options.preferences || {}
    }
  });

  if (error) {
    console.error('Synthesis error:', error);
    throw new Error(`Synthesis failed: ${error.message}`);
  }

  return data;
};

// Content generation function
export const generateContent = async (
  thought: string, 
  formats: string[],
  options: { userId?: string } = {}
): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('generate-content', {
    body: {
      thought,
      formats,
      userId: options.userId,
      timestamp: new Date().toISOString()
    }
  });

  if (error) {
    console.error('Content generation error:', error);
    throw new Error(`Content generation failed: ${error.message}`);
  }

  return data;
};

// Content multiplication function
export const multiplyContent = async (
  baseContent: string,
  targetPlatforms: string[],
  options: { userId?: string } = {}
): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('content-multiply', {
    body: {
      content: baseContent,
      platforms: targetPlatforms,
      userId: options.userId,
      timestamp: new Date().toISOString()
    }
  });

  if (error) {
    console.error('Content multiplication error:', error);
    throw new Error(`Content multiplication failed: ${error.message}`);
  }

  return data;
};

// Analyze thought function  
export const analyzeThought = async (
  input: string,
  options: { userId?: string; thoughtId?: string } = {}
): Promise<any> => {
  // Generate thoughtId if not provided
  const thoughtId = options.thoughtId || `thought_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const { data, error } = await supabase.functions.invoke('analyze-thought', {
    body: {
      thoughtId,
      content: input
    }
  });

  if (error) {
    console.error('Thought analysis error:', error);
    throw new Error(`Thought analysis failed: ${error.message}`);
  }

  return data;
};