import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { thoughtIds, userId, organizationId } = await req.json();

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch thoughts to analyze
    const { data: thoughts, error: fetchError } = await supabase
      .from('thoughts')
      .select('id, title, content, tags, mood, context, created_at')
      .in('id', thoughtIds)
      .eq('user_id', userId);

    if (fetchError) throw fetchError;

    if (!thoughts || thoughts.length === 0) {
      throw new Error('No thoughts found to analyze');
    }

    // Prepare thoughts for analysis
    const thoughtsContent = thoughts.map(t => ({
      id: t.id,
      title: t.title || 'Untitled',
      content: t.content,
      tags: t.tags || [],
      mood: t.mood,
      context: t.context,
      date: new Date(t.created_at).toLocaleDateString()
    }));

    // Create analysis prompt
    const analysisPrompt = `Analyze the following user thoughts and extract trending topics and insights:

${JSON.stringify(thoughtsContent, null, 2)}

Please provide:
1. 3-5 trending topics extracted from these thoughts with scores (1-100) based on relevance and frequency
2. Key themes and patterns
3. Sentiment analysis for each topic
4. Suggested keywords for each topic
5. Content opportunities based on these thoughts

Format your response as JSON with this structure:
{
  "trending_topics": [
    {
      "topic": "topic name",
      "title": "descriptive title",
      "description": "detailed description",
      "score": 85,
      "sentiment": 0.7,
      "keywords": ["keyword1", "keyword2"],
      "source_thoughts": ["thought_id1", "thought_id2"]
    }
  ],
  "themes": ["theme1", "theme2"],
  "content_opportunities": [
    {
      "type": "blog_post",
      "topic": "suggested topic",
      "angle": "content angle",
      "target_keywords": ["keyword1", "keyword2"]
    }
  ],
  "overall_sentiment": 0.5,
  "insights": "key insights about the user's thinking patterns"
}

Ensure all scores are realistic (trending topics: 60-95, sentiment: -1 to 1).`;

    // Analyze with Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisResult = JSON.parse(data.content[0].text);

    // Store trending topics in database
    const trendingTopicsToInsert = analysisResult.trending_topics.map((topic: any) => ({
      organization_id: organizationId,
      topic: topic.topic,
      title: topic.title,
      description: topic.description,
      score: topic.score,
      sentiment: topic.sentiment,
      keywords: topic.keywords,
      source: 'user_thoughts',
      source_data: {
        source_thoughts: topic.source_thoughts,
        analysis_date: new Date().toISOString(),
        themes: analysisResult.themes
      },
      is_validated: true
    }));

    const { data: insertedTopics, error: insertError } = await supabase
      .from('trending_topics')
      .insert(trendingTopicsToInsert)
      .select();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save trending topics');
    }

    // Mark thoughts as processed
    const { error: updateError } = await supabase
      .from('thoughts')
      .update({ 
        is_processed: true, 
        processed_at: new Date().toISOString() 
      })
      .in('id', thoughtIds);

    if (updateError) {
      console.error('Failed to update thoughts:', updateError);
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      trending_topics: insertedTopics,
      processed_thoughts: thoughtIds.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-thoughts function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});