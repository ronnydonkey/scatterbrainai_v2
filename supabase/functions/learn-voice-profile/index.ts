import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { thoughts, userId } = await req.json();
    
    if (!thoughts || !Array.isArray(thoughts) || thoughts.length === 0) {
      throw new Error('No thoughts provided for analysis');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log(`Analyzing voice profile for user ${userId} from ${thoughts.length} thoughts`);

    // Combine all thought content for analysis
    const combinedText = thoughts.map(t => t.content).join('\n\n');
    
    const analysisPrompt = `Analyze the following writing samples to extract the writer's unique voice characteristics. Focus on:

1. Writing Style:
   - Sentence structure (simple, complex, varied)
   - Paragraph length preferences
   - Use of punctuation and formatting
   - Vocabulary complexity level

2. Tone and Personality:
   - Formal vs casual approach
   - Emotional expression style
   - Humor usage (witty, sarcastic, playful, etc.)
   - Confidence level in writing

3. Communication Patterns:
   - Use of questions vs statements
   - Storytelling vs direct communication
   - Use of examples and analogies
   - Personal anecdotes frequency

4. Language Preferences:
   - Preferred words and phrases
   - Sentence connectors and transitions
   - Technical vs everyday language
   - Use of metaphors or imagery

Return a JSON object with these fields:
{
  "writing_style": {
    "sentence_structure": "description",
    "vocabulary_level": "basic|intermediate|advanced",
    "punctuation_style": "description",
    "paragraph_preference": "short|medium|long"
  },
  "tone_characteristics": {
    "formality": "casual|semi_formal|formal",
    "emotional_expression": "reserved|moderate|expressive",
    "humor_style": "none|dry|playful|witty|sarcastic",
    "confidence_level": "tentative|balanced|assertive"
  },
  "communication_patterns": {
    "questioning_frequency": "low|medium|high",
    "storytelling_tendency": "direct|occasional|frequent",
    "example_usage": "rare|moderate|frequent",
    "personal_touch": "impersonal|some|personal"
  },
  "language_preferences": {
    "common_phrases": ["phrase1", "phrase2"],
    "transition_style": "simple|varied|complex",
    "technical_comfort": "avoids|comfortable|prefers",
    "imagery_usage": "literal|some|metaphorical"
  },
  "voice_summary": "A 2-3 sentence description of the overall writing voice"
}

Writing samples to analyze:
${combinedText}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
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

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const anthropicResult = await response.json();
    const analysisText = anthropicResult.content[0].text;
    
    // Extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse voice analysis JSON');
    }

    const voiceProfile = JSON.parse(jsonMatch[0]);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update user's voice profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        voice_profile_config: voiceProfile,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(`Failed to save voice profile: ${updateError.message}`);
    }

    console.log(`Voice profile updated for user ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        voiceProfile,
        message: 'Voice profile learned and saved successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in learn-voice-profile function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});