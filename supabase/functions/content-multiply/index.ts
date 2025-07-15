import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token and create Supabase client
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { 
      originalInput, 
      contentTypes, 
      targetAudience = 'general', 
      tone = 'professional',
      brandVoice = 'helpful and informative'
    } = await req.json();

    console.log('Content multiplication request:', { contentTypes, targetAudience, tone });

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error('User organization not found');
    }

    // Generate content for each requested type
    const contentSuite = {};
    
    for (const contentType of contentTypes) {
      console.log(`Generating content for type: ${contentType}`);
      
      const content = await generateContent({
        type: contentType,
        originalInput,
        targetAudience,
        tone,
        brandVoice
      });
      
      contentSuite[contentType] = content;

      // Store each generated content as a content_suggestion
      await supabase
        .from('content_suggestions')
        .insert({
          user_id: user.id,
          organization_id: profile.organization_id,
          title: content.title || `${formatTypeLabel(contentType)} - Generated Content`,
          content_type: contentType,
          description: content.description || content.subtitle,
          ai_generated_content: JSON.stringify(content),
          target_keywords: content.seoKeywords || [],
          suggested_tone: tone,
          engagement_prediction: content.engagementScore || 0.75,
          voice_authenticity_score: 0.85
        });
    }

    // Extract core insights and generate scheduling recommendations
    const coreInsights = await extractCoreInsights(originalInput);
    const schedulingRecommendations = generateSchedulingRecommendations(contentTypes);

    const response = {
      success: true,
      coreTheme: coreInsights.mainTheme,
      expandedIdeas: coreInsights.expandedIdeas,
      contentSuite,
      suggestedSchedule: schedulingRecommendations,
      seoKeywords: coreInsights.seoKeywords,
      hashtags: coreInsights.hashtags
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Content multiplication failed:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateContent({ type, originalInput, targetAudience, tone, brandVoice }) {
  const prompt = getContentPrompt(type, originalInput, targetAudience, tone, brandVoice);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content creator specializing in multi-format content generation. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    }),
  });

  const aiResponse = await response.json();
  
  if (!aiResponse.choices || !aiResponse.choices[0]) {
    throw new Error('Invalid response from OpenAI');
  }

  try {
    return JSON.parse(aiResponse.choices[0].message.content);
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON:', parseError);
    // Fallback structure
    return {
      title: `Generated ${formatTypeLabel(type)}`,
      content: aiResponse.choices[0].message.content,
      wordCount: aiResponse.choices[0].message.content.length / 5,
      engagementScore: 0.75
    };
  }
}

function getContentPrompt(type, originalInput, targetAudience, tone, brandVoice) {
  const basePrompt = `Transform this original thought into ${formatTypeLabel(type)} format:

Original Input: "${originalInput}"
Target Audience: ${targetAudience}
Tone: ${tone}
Brand Voice: ${brandVoice}

`;

  switch (type) {
    case 'blog_post':
      return basePrompt + `Create a comprehensive blog post. Return JSON with this structure:
{
  "title": "SEO-optimized title",
  "subtitle": "Engaging subtitle",
  "outline": ["Hook", "Problem", "Solution", "Implementation", "Conclusion"],
  "content": {
    "introduction": "Markdown formatted intro...",
    "sections": [
      {
        "heading": "## Section Title",
        "content": "Detailed content...",
        "wordCount": 200
      }
    ],
    "conclusion": "Compelling conclusion with CTA..."
  },
  "metadata": {
    "wordCount": 1200,
    "readingTime": "5 min",
    "targetAudience": "${targetAudience}",
    "tone": "${tone}"
  },
  "seoKeywords": ["keyword1", "keyword2"],
  "engagementScore": 0.85,
  "formatting": {
    "plainText": "Clean, readable plain text version without any markdown or formatting codes..."
  }
}`;

    case 'twitter_thread':
      return basePrompt + `Create a Twitter thread (8-15 tweets). Return JSON with this structure:
{
  "title": "Thread hook/title",
  "tweets": [
    {
      "number": 1,
      "content": "Hook tweet (280 chars max)",
      "type": "hook"
    },
    {
      "number": 2,
      "content": "Follow-up tweet...",
      "type": "content"
    }
  ],
  "hashtags": ["#hashtag1", "#hashtag2"],
  "engagementHooks": ["Questions", "Controversial takes"],
  "engagementScore": 0.9,
  "totalTweets": 10
}`;

    case 'newsletter':
      return basePrompt + `Create a newsletter section. Return JSON with this structure:
{
  "title": "Newsletter subject line",
  "subtitle": "Preview text",
  "sections": [
    {
      "heading": "Section Title",
      "content": "Newsletter content...",
      "type": "main_story"
    }
  ],
  "callToAction": "Clear CTA",
  "wordCount": 800,
  "engagementScore": 0.8,
  "formatting": {
    "plainText": "Clean, readable plain text version suitable for email"
  }
}`;

    case 'linkedin_article':
      return basePrompt + `Create a LinkedIn article for thought leadership. Return JSON with this structure:
{
  "title": "Professional headline",
  "subtitle": "Thought leadership hook",
  "content": {
    "introduction": "Professional opening...",
    "mainBody": "Detailed insights...",
    "conclusion": "Professional call to action..."
  },
  "wordCount": 1000,
  "professionalTone": true,
  "engagementScore": 0.85,
  "formatting": {
    "plainText": "Clean, professional plain text suitable for LinkedIn"
  }
}`;

    case 'instagram_carousel':
      return basePrompt + `Create Instagram carousel content (5-8 slides). Return JSON with this structure:
{
  "title": "Carousel hook",
  "slides": [
    {
      "number": 1,
      "title": "Slide title",
      "content": "Slide content",
      "visualDescription": "Description of visual needed"
    }
  ],
  "caption": "Instagram caption with hashtags",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "engagementScore": 0.85,
  "totalSlides": 6
}`;

    case 'youtube_script':
      return basePrompt + `Create a YouTube video script (5-10 minutes). Return JSON with this structure:
{
  "title": "Video title",
  "description": "Video description",
  "script": {
    "hook": "First 15 seconds hook",
    "introduction": "Intro section",
    "mainContent": "Main content sections",
    "conclusion": "Conclusion and CTA"
  },
  "timestamps": [
    {"time": "0:00", "section": "Hook"},
    {"time": "0:15", "section": "Introduction"}
  ],
  "estimatedDuration": "8 minutes",
  "engagementScore": 0.8
}`;

    default:
      return basePrompt + `Create content in ${type} format. Return JSON with title, content, and engagementScore fields.`;
  }
}

async function extractCoreInsights(originalInput) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: 'Extract core themes and insights from content. Return valid JSON.'
        },
        {
          role: 'user',
          content: `Analyze this input and extract core insights: "${originalInput}"

Return JSON with:
{
  "mainTheme": "Core theme",
  "expandedIdeas": ["idea1", "idea2"],
  "seoKeywords": ["keyword1", "keyword2"],
  "hashtags": ["#hashtag1", "#hashtag2"]
}`
        }
      ],
      temperature: 0.3,
    }),
  });

  const aiResponse = await response.json();
  
  try {
    return JSON.parse(aiResponse.choices[0].message.content);
  } catch (error) {
    return {
      mainTheme: "Content insights",
      expandedIdeas: ["Expanded insight 1", "Expanded insight 2"],
      seoKeywords: ["content", "insights"],
      hashtags: ["#content", "#insights"]
    };
  }
}

function generateSchedulingRecommendations(contentTypes) {
  const scheduleMap = {
    'blog_post': { platform: 'blog', optimalTime: '09:00', frequency: 'weekly' },
    'twitter_thread': { platform: 'twitter', optimalTime: '12:00', frequency: 'daily' },
    'newsletter': { platform: 'email', optimalTime: '08:00', frequency: 'weekly' },
    'linkedin_article': { platform: 'linkedin', optimalTime: '10:00', frequency: 'bi-weekly' },
    'instagram_carousel': { platform: 'instagram', optimalTime: '18:00', frequency: 'daily' },
    'youtube_script': { platform: 'youtube', optimalTime: '19:00', frequency: 'weekly' }
  };

  return contentTypes.map(type => ({
    contentType: type,
    ...scheduleMap[type] || { platform: 'general', optimalTime: '12:00', frequency: 'weekly' }
  }));
}

function formatTypeLabel(type) {
  const labels = {
    'blog_post': 'Blog Post',
    'newsletter': 'Newsletter',
    'twitter_thread': 'Twitter Thread',
    'linkedin_article': 'LinkedIn Article',
    'instagram_carousel': 'Instagram Carousel',
    'youtube_script': 'YouTube Script'
  };
  return labels[type] || type.replace('_', ' ').split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}