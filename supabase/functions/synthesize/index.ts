import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SynthesizeRequest {
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

interface ActionItem {
  id: string;
  task: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimatedDuration: string;
  suggestedTime: string;
  completed: boolean;
}

interface ContentSuggestion {
  content: string;
  hashtags?: string[];
  engagement_prediction?: number;
  post_type?: string;
  style?: string;
}

interface KeyTheme {
  theme: string;
  confidence: number;
  evidence: string[];
  relatedConcepts: string[];
}

interface SynthesizeResponse {
  success: boolean;
  id: string;
  processingTime: number;
  insights: {
    keyThemes: KeyTheme[];
    actionItems: ActionItem[];
    contentSuggestions: {
      twitter: ContentSuggestion;
      linkedin: ContentSuggestion;
      instagram: ContentSuggestion;
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
}

async function analyzeWithOpenAI(input: string): Promise<any> {
  const prompt = `Analyze this thought/input and extract insights in the following JSON format:

{
  "keyThemes": [
    {
      "theme": "theme name",
      "confidence": 0.0-1.0,
      "evidence": ["keyword1", "keyword2"],
      "relatedConcepts": ["concept1", "concept2"]
    }
  ],
  "actionItems": [
    {
      "task": "specific actionable task",
      "priority": "low|medium|high",
      "category": "planning|creative|research|communication",
      "estimatedDuration": "30 minutes",
      "suggestedTime": "morning|afternoon|evening|specific time"
    }
  ],
  "contentSuggestions": {
    "twitter": {
      "content": "engaging tweet content",
      "hashtags": ["#relevant", "#hashtags"]
    },
    "linkedin": {
      "content": "professional LinkedIn post",
      "post_type": "insight_sharing|question|announcement"
    },
    "instagram": {
      "content": "visual-friendly caption",
      "style": "motivational|behind_scenes|educational"
    }
  },
  "researchSuggestions": [
    {
      "topic": "relevant research topic",
      "sources": ["academic papers", "expert blogs", "industry reports"],
      "relevance": 0.0-1.0
    }
  ],
  "calendarBlocks": [
    {
      "title": "specific calendar event title",
      "duration": 60,
      "priority": "low|medium|high",
      "suggestedTimes": ["tomorrow_9am", "thursday_2pm"]
    }
  ],
  "metadata": {
    "sentiment": "positive|neutral|negative|optimistic|concerned",
    "complexity": "simple|medium|complex",
    "topics": ["topic1", "topic2"]
  }
}

Input to analyze: "${input}"

Return only valid JSON, no explanations.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert at analyzing thoughts and extracting actionable insights. Always respond with valid JSON only.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const rawContent = data.choices[0].message.content;
  
  try {
    return JSON.parse(rawContent);
  } catch (parseError) {
    console.error('Failed to parse AI response:', rawContent);
    throw new Error('Invalid JSON response from AI');
  }
}

function generateInsightId(): string {
  return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateActionId(index: number): string {
  return `action_${Date.now()}_${index}`;
}

function calculateEngagementPrediction(content: string, platform: string): number {
  // Simple heuristic for engagement prediction
  const hasHashtags = content.includes('#');
  const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(content);
  const length = content.length;
  
  let score = 0.5; // base score
  
  if (hasHashtags) score += 0.1;
  if (hasEmojis) score += 0.1;
  
  // Platform-specific adjustments
  switch (platform) {
    case 'twitter':
      score += length < 280 && length > 50 ? 0.2 : 0;
      break;
    case 'linkedin':
      score += length > 100 && length < 1500 ? 0.2 : 0;
      break;
    case 'instagram':
      score += length < 500 && hasEmojis ? 0.2 : 0;
      break;
  }
  
  return Math.min(Math.max(score, 0.1), 1.0);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const requestData: SynthesizeRequest = await req.json();
    const { input, userId, timestamp, sessionId, preferences } = requestData;

    if (!input || input.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Input text is required' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Processing thought for user ${userId || 'anonymous'}: ${input.substring(0, 100)}...`);

    // Analyze with AI
    const aiInsights = await analyzeWithOpenAI(input);
    
    // Process and enhance the AI response
    const insightId = generateInsightId();
    const processingTime = (Date.now() - startTime) / 1000;
    const wordCount = input.split(/\s+/).length;

    // Add IDs to action items and enhance them
    const enhancedActionItems: ActionItem[] = aiInsights.actionItems.map((item: any, index: number) => ({
      id: generateActionId(index),
      task: item.task,
      priority: item.priority || 'medium',
      category: item.category || 'planning',
      estimatedDuration: item.estimatedDuration || '30 minutes',
      suggestedTime: item.suggestedTime || 'morning',
      completed: false,
    }));

    // Enhance content suggestions with engagement predictions
    const enhancedContentSuggestions = {
      twitter: {
        ...aiInsights.contentSuggestions.twitter,
        engagement_prediction: calculateEngagementPrediction(
          aiInsights.contentSuggestions.twitter.content, 
          'twitter'
        ),
      },
      linkedin: {
        ...aiInsights.contentSuggestions.linkedin,
        engagement_prediction: calculateEngagementPrediction(
          aiInsights.contentSuggestions.linkedin.content, 
          'linkedin'
        ),
      },
      instagram: {
        ...aiInsights.contentSuggestions.instagram,
        engagement_prediction: calculateEngagementPrediction(
          aiInsights.contentSuggestions.instagram.content, 
          'instagram'
        ),
      },
    };

    const response: SynthesizeResponse = {
      success: true,
      id: insightId,
      processingTime: processingTime,
      insights: {
        keyThemes: aiInsights.keyThemes || [],
        actionItems: enhancedActionItems,
        contentSuggestions: enhancedContentSuggestions,
        researchSuggestions: aiInsights.researchSuggestions || [],
        calendarBlocks: aiInsights.calendarBlocks || [],
      },
      metadata: {
        wordCount: wordCount,
        sentiment: aiInsights.metadata?.sentiment || 'neutral',
        complexity: aiInsights.metadata?.complexity || 'medium',
        topics: aiInsights.metadata?.topics || [],
      },
    };

    console.log(`Successfully processed insight ${insightId} in ${processingTime}s`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in synthesize function:', error);
    
    const processingTime = (Date.now() - startTime) / 1000;
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        processingTime: processingTime,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});