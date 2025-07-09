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
    const { 
      topic, 
      contentType, 
      targetKeywords, 
      tone, 
      voiceProfile,
      organizationId,
      userId 
    } = await req.json();

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create system prompt for voice preservation
    const systemPrompt = `You are an expert content creator who specializes in maintaining authentic voice and tone across different content types. 

Voice Profile: ${JSON.stringify(voiceProfile)}
Content Type: ${contentType}
Target Tone: ${tone}
Target Keywords: ${targetKeywords?.join(', ') || 'None specified'}

Create engaging, authentic content that:
1. Matches the specified voice profile characteristics
2. Incorporates target keywords naturally
3. Maintains the requested tone throughout
4. Is optimized for the specified content type
5. Provides genuine value to the audience

Topic: ${topic}

Generate comprehensive content including:
- A compelling title
- Main content body
- Key takeaways or call-to-action
- Suggested hashtags (if applicable)

Keep the content authentic and avoid overly promotional language.`;

    // Generate content with Claude
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
            content: systemPrompt
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
    const generatedContent = data.content[0].text;

    // Calculate engagement prediction (simple heuristic)
    const keywordScore = targetKeywords ? targetKeywords.length * 0.1 : 0;
    const lengthScore = Math.min(generatedContent.length / 1000, 1) * 0.3;
    const voiceScore = voiceProfile ? 0.4 : 0.2;
    const engagementPrediction = Math.min((keywordScore + lengthScore + voiceScore) * 100, 95);

    // Extract title from generated content (assumes first line is title)
    const lines = generatedContent.split('\n').filter(line => line.trim());
    const title = lines[0] || topic;
    
    // Store content suggestion in database
    const { data: suggestion, error: dbError } = await supabase
      .from('content_suggestions')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        title,
        description: `AI-generated ${contentType} content about ${topic}`,
        content_type: contentType,
        ai_generated_content: generatedContent,
        target_keywords: targetKeywords,
        suggested_tone: tone,
        engagement_prediction: engagementPrediction,
        voice_authenticity_score: voiceProfile ? 85 : 70,
        estimated_word_count: generatedContent.split(' ').length
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save content suggestion');
    }

    return new Response(JSON.stringify({
      success: true,
      suggestion,
      content: generatedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});