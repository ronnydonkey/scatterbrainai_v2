import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Progressive intelligence levels based on user data
const INTELLIGENCE_LEVELS = {
  BASIC: 'basic',      // New users (0-3 thoughts)
  ENHANCED: 'enhanced', // Learning users (4-10 thoughts)
  ADAPTIVE: 'adaptive', // Regular users (11-25 thoughts)
  GENIUS: 'genius'     // Power users (25+ thoughts)
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { thoughtId, content, userId } = await req.json();
    
    if (!thoughtId || !content || !userId) {
      throw new Error('Missing required parameters');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Starting adaptive analysis for thought: ${thoughtId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get user's organization and thought history
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', userId)
      .single();

    if (!profile?.organization_id) {
      throw new Error('User profile not found');
    }

    // Get user's thought history to determine intelligence level
    const { data: userThoughts } = await supabase
      .from('thoughts')
      .select('id, content, tags, mood, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    const thoughtCount = userThoughts?.length || 0;
    
    // Determine intelligence level
    let intelligenceLevel = INTELLIGENCE_LEVELS.BASIC;
    if (thoughtCount >= 25) intelligenceLevel = INTELLIGENCE_LEVELS.GENIUS;
    else if (thoughtCount >= 11) intelligenceLevel = INTELLIGENCE_LEVELS.ADAPTIVE;
    else if (thoughtCount >= 4) intelligenceLevel = INTELLIGENCE_LEVELS.ENHANCED;

    console.log(`User intelligence level: ${intelligenceLevel} (${thoughtCount} thoughts)`);

    // Extract user interests from thought history
    const userInterests = extractUserInterests(userThoughts || []);
    const recentThemes = extractRecentThemes(userThoughts || [], 10);
    const writingStyle = analyzeWritingStyle(userThoughts || []);

    // Create adaptive analysis prompt based on intelligence level
    const { systemPrompt, userPrompt } = createAdaptivePrompt(
      content, 
      intelligenceLevel, 
      userInterests, 
      recentThemes, 
      writingStyle,
      thoughtCount
    );

    console.log(`Using ${intelligenceLevel} level analysis`);

    // Call OpenAI API with adaptive prompt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: getMaxTokens(intelligenceLevel),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0].message.content;
    
    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      throw new Error('AI response was not valid JSON');
    }

    // Enhance analysis with progressive intelligence features
    const enhancedAnalysis = enhanceAnalysisWithIntelligence(
      analysis, 
      intelligenceLevel, 
      userInterests, 
      recentThemes
    );

    // Update the thought with enhanced analysis
    const { error: updateError } = await supabase
      .from('thoughts')
      .update({
        mood: enhancedAnalysis.mood,
        tags: enhancedAnalysis.themes,
        processed_at: new Date().toISOString(),
        is_processed: true,
        context: JSON.stringify({
          ...enhancedAnalysis,
          intelligence_level: intelligenceLevel,
          thought_count: thoughtCount,
          adaptive_features: getAdaptiveFeatures(intelligenceLevel)
        })
      })
      .eq('id', thoughtId);

    if (updateError) {
      console.error('Failed to update thought:', updateError);
      throw new Error('Failed to save analysis to database');
    }

    console.log(`Successfully completed ${intelligenceLevel} analysis for thought ${thoughtId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: enhancedAnalysis,
        thoughtId: thoughtId,
        intelligence_level: intelligenceLevel,
        thought_count: thoughtCount,
        adaptive_features: getAdaptiveFeatures(intelligenceLevel),
        progression_status: getProgressionStatus(thoughtCount)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Adaptive analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Extract user interests from thought history
function extractUserInterests(thoughts: any[]) {
  const interestPatterns = {
    technology: ['code', 'programming', 'software', 'ai', 'tech', 'app', 'development'],
    business: ['startup', 'business', 'marketing', 'sales', 'strategy', 'revenue'],
    creative: ['art', 'design', 'creative', 'music', 'writing', 'photography'],
    lifestyle: ['health', 'fitness', 'travel', 'food', 'personal', 'mindfulness'],
    gaming: ['game', 'gaming', 'play', 'esports', 'entertainment'],
    learning: ['learn', 'study', 'education', 'skill', 'knowledge', 'research']
  };

  const interests: {[key: string]: number} = {};
  
  thoughts.forEach(thought => {
    const text = `${thought.content} ${(thought.tags || []).join(' ')}`.toLowerCase();
    
    Object.entries(interestPatterns).forEach(([category, keywords]) => {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      interests[category] = (interests[category] || 0) + matches;
    });
  });

  return Object.entries(interests)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category, score]) => ({ category, score }));
}

// Extract recent themes from thoughts
function extractRecentThemes(thoughts: any[], limit: number) {
  return thoughts
    .slice(0, limit)
    .flatMap(thought => thought.tags || [])
    .reduce((acc: {[key: string]: number}, tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
}

// Analyze writing style patterns
function analyzeWritingStyle(thoughts: any[]) {
  if (thoughts.length === 0) return { tone: 'neutral', complexity: 'simple' };

  const totalLength = thoughts.reduce((sum, t) => sum + t.content.length, 0);
  const avgLength = totalLength / thoughts.length;
  
  const complexity = avgLength > 200 ? 'detailed' : avgLength > 100 ? 'moderate' : 'concise';
  
  // Analyze tone from mood patterns
  const moods = thoughts.map(t => t.mood).filter(Boolean);
  const dominantMood = moods.length > 0 ? getMostFrequent(moods) : 'thoughtful';
  
  return { tone: dominantMood, complexity, avgLength };
}

function getMostFrequent(arr: string[]) {
  const frequency: {[key: string]: number} = {};
  arr.forEach(item => frequency[item] = (frequency[item] || 0) + 1);
  return Object.entries(frequency).sort(([,a], [,b]) => b - a)[0]?.[0] || 'thoughtful';
}

// Create adaptive prompts based on intelligence level
function createAdaptivePrompt(
  content: string, 
  level: string, 
  interests: any[], 
  themes: any, 
  style: any,
  thoughtCount: number
) {
  const topInterest = interests[0]?.category || 'general';
  const userTone = style.tone || 'thoughtful';
  
  let systemPrompt = '';
  let userPrompt = '';

  switch (level) {
    case INTELLIGENCE_LEVELS.BASIC:
      systemPrompt = `You are a helpful thought analyst. Provide clear, encouraging analysis for a new user just starting their thought journey.`;
      userPrompt = `Analyze this thought and provide a simple, encouraging JSON response:

"${content}"

Provide this structure:
{
  "summary": "Simple, clear summary (1-2 sentences)",
  "keyInsights": ["Simple insight 1", "Simple insight 2"],
  "themes": ["theme1", "theme2"],
  "mood": "detected mood",
  "encouragement": "Encouraging message about their thought journey",
  "nextSteps": ["Simple action they could take"],
  "contentSuggestion": {
    "platform": "best platform for this thought",
    "format": "simple format like 'short post' or 'note'"
  }
}`;
      break;

    case INTELLIGENCE_LEVELS.ENHANCED:
      systemPrompt = `You are an intelligent thought analyst learning about this user's ${topInterest} interests. Provide more detailed analysis with personal touches.`;
      userPrompt = `Analyze this thought from someone interested in ${topInterest} with a ${userTone} tone:

"${content}"

Provide this enhanced JSON structure:
{
  "summary": "Detailed summary connecting to their ${topInterest} interests",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "themes": ["theme1", "theme2", "theme3"],
  "mood": "detected mood",
  "personalConnections": ["How this connects to their ${topInterest} interests"],
  "contentSuggestions": [
    {
      "platform": "platform",
      "format": "format",
      "angle": "content angle",
      "audience": "target audience"
    }
  ],
  "actionableInsights": ["Specific actions they could take"],
  "growthOpportunities": ["Ways to develop this thought further"]
}`;
      break;

    case INTELLIGENCE_LEVELS.ADAPTIVE:
      const recentThemeList = Object.keys(themes).slice(0, 3).join(', ');
      systemPrompt = `You are an adaptive AI assistant that knows this user has ${thoughtCount} thoughts, is interested in ${topInterest}, and recently thinks about: ${recentThemeList}. Provide highly personalized analysis.`;
      userPrompt = `Analyze this thought from your regular user who has ${thoughtCount} thoughts and prefers ${style.complexity} explanations:

"${content}"

Consider their interest in ${topInterest} and recent themes: ${recentThemeList}

Provide this adaptive JSON structure:
{
  "summary": "Personalized summary referencing their thought patterns",
  "keyInsights": ["Deep insight 1", "Deep insight 2", "Deep insight 3"],
  "themes": ["theme1", "theme2", "theme3"],
  "mood": "detected mood",
  "personalizedConnections": [
    "How this builds on their previous ${recentThemeList} thoughts",
    "Connection to their ${topInterest} interests"
  ],
  "adaptiveContentSuite": [
    {
      "platform": "platform optimized for their style",
      "format": "format matching their ${style.complexity} preference",
      "angle": "personalized angle",
      "audience": "their typical audience",
      "crossPlatformStrategy": "how to adapt across platforms"
    }
  ],
  "strategicInsights": ["Strategic recommendations based on their pattern"],
  "thoughtEvolution": "How this thought shows growth from their ${thoughtCount} thoughts",
  "adaptiveRecommendations": {
    "nextTopics": ["Topics they might explore next"],
    "skillDevelopment": ["Skills to develop based on their interests"],
    "communityConnections": ["Relevant communities for their ${topInterest} interests"]
  }
}`;
      break;

    case INTELLIGENCE_LEVELS.GENIUS:
      const topThemes = Object.entries(themes).slice(0, 5).map(([theme, count]) => `${theme}(${count})`).join(', ');
      systemPrompt = `You are a genius-level AI assistant analyzing thoughts from a power user with ${thoughtCount} thoughts. This user has demonstrated deep thinking patterns in ${topInterest} and consistently explores: ${topThemes}. Provide sophisticated, strategic analysis that matches their advanced thinking level.`;
      userPrompt = `Analyze this thought from your power user (${thoughtCount} thoughts) who has established expertise in ${topInterest}:

"${content}"

Their thinking patterns show depth in: ${topThemes}
Their style: ${style.complexity} with ${userTone} tone

Provide this genius-level JSON structure:
{
  "summary": "Strategic summary connecting to their established thought architecture",
  "keyInsights": ["Strategic insight 1", "Strategic insight 2", "Strategic insight 3", "Meta insight"],
  "themes": ["theme1", "theme2", "theme3", "theme4"],
  "mood": "detected mood",
  "strategicContext": {
    "thoughtEvolution": "How this builds on their ${thoughtCount} thought journey",
    "patternRecognition": "Deeper patterns in their thinking",
    "expertiseAreas": ["Areas where they show expertise"]
  },
  "geniusContentStrategy": [
    {
      "platform": "optimal platform for maximum impact",
      "format": "sophisticated format",
      "strategicAngle": "unique positioning angle",
      "audienceSegmentation": "detailed audience analysis",
      "thoughtLeadershipPotential": "how this positions them as a thought leader",
      "viralMechanics": "elements that could drive engagement",
      "crossPlatformOrchestration": "coordinated multi-platform strategy"
    }
  ],
  "metaAnalysis": {
    "cognitivePatterns": "Deep cognitive patterns observed",
    "innovationPotential": "Innovation opportunities in this thought",
    "intellectualConnections": "Connections to broader intellectual frameworks"
  },
  "powerUserRecommendations": {
    "thoughtLeadershipOpportunities": ["Opportunities to lead in their field"],
    "communityBuilding": ["Ways to build community around their ideas"],
    "knowledgeMonetization": ["Ways to monetize their expertise"],
    "influenceExpansion": ["Strategies to expand their influence"],
    "expertNetworking": ["High-value connections to pursue"]
  },
  "adaptiveIntelligence": {
    "predictiveInsights": ["Predictions about where their thinking is heading"],
    "emergingOpportunities": ["Emerging opportunities aligned with their expertise"],
    "strategicPivots": ["Strategic directions they might consider"]
  }
}`;
      break;
  }

  return { systemPrompt, userPrompt };
}

// Get max tokens based on intelligence level
function getMaxTokens(level: string) {
  switch (level) {
    case INTELLIGENCE_LEVELS.BASIC: return 1500;
    case INTELLIGENCE_LEVELS.ENHANCED: return 2500;
    case INTELLIGENCE_LEVELS.ADAPTIVE: return 3500;
    case INTELLIGENCE_LEVELS.GENIUS: return 4500;
    default: return 2000;
  }
}

// Enhance analysis with intelligence-specific features
function enhanceAnalysisWithIntelligence(analysis: any, level: string, interests: any[], themes: any) {
  return {
    ...analysis,
    intelligence_level: level,
    adaptive_features: getAdaptiveFeatures(level),
    personalization_score: calculatePersonalizationScore(interests, themes),
    user_growth_indicators: getGrowthIndicators(level)
  };
}

// Get adaptive features for each intelligence level
function getAdaptiveFeatures(level: string) {
  const features = {
    [INTELLIGENCE_LEVELS.BASIC]: [
      'Basic analysis',
      'Encouraging feedback',
      'Simple content suggestions',
      'Getting started guidance'
    ],
    [INTELLIGENCE_LEVELS.ENHANCED]: [
      'Interest-aware analysis',
      'Personal connections',
      'Enhanced content suggestions',
      'Growth opportunities identification'
    ],
    [INTELLIGENCE_LEVELS.ADAPTIVE]: [
      'Pattern recognition',
      'Personalized content suite',
      'Strategic insights',
      'Cross-platform optimization',
      'Community recommendations'
    ],
    [INTELLIGENCE_LEVELS.GENIUS]: [
      'Meta-cognitive analysis',
      'Thought leadership positioning',
      'Sophisticated content strategy',
      'Innovation opportunity detection',
      'Strategic influence expansion',
      'Predictive insights',
      'Expert networking suggestions'
    ]
  };

  return features[level] || features[INTELLIGENCE_LEVELS.BASIC];
}

// Calculate personalization score
function calculatePersonalizationScore(interests: any[], themes: any) {
  const interestScore = Math.min(interests.length * 20, 60);
  const themeScore = Math.min(Object.keys(themes).length * 5, 30);
  const baseScore = 10;
  
  return Math.min(interestScore + themeScore + baseScore, 100);
}

// Get growth indicators for progression
function getGrowthIndicators(level: string) {
  const indicators = {
    [INTELLIGENCE_LEVELS.BASIC]: {
      current: 'Building foundation',
      next: 'Add 2 more thoughts to unlock Enhanced Analysis',
      progress: 25
    },
    [INTELLIGENCE_LEVELS.ENHANCED]: {
      current: 'Learning your patterns',
      next: 'Add 8 more thoughts to unlock Adaptive Intelligence',
      progress: 50
    },
    [INTELLIGENCE_LEVELS.ADAPTIVE]: {
      current: 'Personalized insights active',
      next: 'Add 15 more thoughts to unlock Genius Mode',
      progress: 75
    },
    [INTELLIGENCE_LEVELS.GENIUS]: {
      current: 'Maximum intelligence achieved',
      next: 'Continue adding thoughts for even deeper insights',
      progress: 100
    }
  };

  return indicators[level] || indicators[INTELLIGENCE_LEVELS.BASIC];
}

// Get progression status message
function getProgressionStatus(thoughtCount: number) {
  if (thoughtCount < 4) {
    return {
      level: 'Getting Started',
      message: `Add ${4 - thoughtCount} more thoughts to unlock Enhanced Analysis with personal insights!`,
      unlockSoon: 'Enhanced Analysis'
    };
  } else if (thoughtCount < 11) {
    return {
      level: 'Enhanced Mode Active',
      message: `Add ${11 - thoughtCount} more thoughts to unlock Adaptive Intelligence with pattern recognition!`,
      unlockSoon: 'Adaptive Intelligence'
    };
  } else if (thoughtCount < 25) {
    return {
      level: 'Adaptive Intelligence Active',
      message: `Add ${25 - thoughtCount} more thoughts to unlock Genius Mode with strategic insights!`,
      unlockSoon: 'Genius Mode'
    };
  } else {
    return {
      level: 'Genius Mode Active',
      message: 'Maximum intelligence level achieved! Every thought now receives genius-level analysis.',
      unlockSoon: null
    };
  }
}