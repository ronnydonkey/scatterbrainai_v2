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
    console.log('Starting analyze-thoughts function');
    
    const { thoughtIds, userId, organizationId } = await req.json();
    console.log('Request data:', { thoughtIds, userId, organizationId });

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      console.error('Missing Anthropic API key');
      throw new Error('Anthropic API key not configured');
    }
    console.log('Anthropic API key found');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch thoughts to analyze
    console.log('Fetching thoughts from database');
    const { data: thoughts, error: fetchError } = await supabase
      .from('thoughts')
      .select('id, title, content, tags, mood, context, created_at')
      .in('id', thoughtIds)
      .eq('user_id', userId);

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      throw fetchError;
    }

    if (!thoughts || thoughts.length === 0) {
      console.error('No thoughts found');
      throw new Error('No thoughts found to analyze');
    }

    console.log(`Found ${thoughts.length} thoughts to analyze`);

    // Prepare simplified thoughts for analysis
    const thoughtsContent = thoughts.map(t => ({
      id: t.id,
      title: t.title || 'Untitled',
      content: t.content,
      tags: t.tags || [],
      mood: t.mood,
      context: t.context,
      date: new Date(t.created_at).toLocaleDateString()
    }));

    // Create simple analysis prompt
    const analysisPrompt = `Analyze these user thoughts and create trending topics:

${JSON.stringify(thoughtsContent, null, 2)}

Return only valid JSON in this exact format:
{
  "trending_topics": [
    {
      "topic": "example topic",
      "title": "Example Title", 
      "description": "Description of the topic",
      "score": 75,
      "sentiment": 0.5,
      "keywords": ["keyword1", "keyword2"],
      "source_thoughts": ["${thoughtsContent[0]?.id || 'id'}"]
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
  "insights": "Key insights about thinking patterns"
}`;

    console.log('Sending request to Anthropic API');
    
    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ]
      })
    });

    console.log('Anthropic API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Received response from Anthropic');
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(data.content[0].text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Raw response:', data.content[0].text);
      throw new Error('Failed to parse AI response as JSON');
    }

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

    console.log('Inserting trending topics into database');
    const { data: insertedTopics, error: insertError } = await supabase
      .from('trending_topics')
      .insert(trendingTopicsToInsert)
      .select();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save trending topics');
    }

    // Mark thoughts as processed
    console.log('Marking thoughts as processed');
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

    console.log('Analysis completed successfully');
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