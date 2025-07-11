import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIER_LIMITS = {
  starter: { claudeQueries: 5 },
  professional: { claudeQueries: 25 },
  agency: { claudeQueries: 100 },
  enterprise: { claudeQueries: 999999 }
};

serve(async (req) => {
  console.log('=== CLAUDE RESEARCH FUNCTION START ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { topic, niche, researchType = 'deep_analysis', customPrompt } = requestBody;

    if (!topic && !customPrompt) {
      throw new Error('Topic or custom prompt is required');
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    const supabaseService = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('Authentication required');
    }

    const user = userData.user;

    // Get user's organization and profile
    const { data: profile, error: profileError } = await supabaseService
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError || !profile?.organization_id) {
      throw new Error('User profile not found');
    }

    // Get organization details
    const { data: organization, error: orgError } = await supabaseService
      .from('organizations')
      .select('subscription_tier, usage_limits, niche')
      .eq('id', profile.organization_id)
      .maybeSingle();

    if (orgError || !organization) {
      throw new Error('Organization not found');
    }

    const userTier = organization.subscription_tier || 'starter';
    const usageLimits = organization.usage_limits || TIER_LIMITS[userTier];

    // Check if user has access to Claude
    if (usageLimits.claudeQueries === 0) {
      return new Response(JSON.stringify({
        error: 'Claude research requires Professional or higher tier',
        upgrade_required: true,
        current_tier: userTier
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check monthly usage
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const { data: monthlyUsage } = await supabaseService
      .from('usage_tracking')
      .select('count')
      .eq('organization_id', profile.organization_id)
      .eq('resource_type', 'claude_query')
      .gte('tracked_date', firstDayOfMonth.toISOString().split('T')[0]);

    const currentUsage = monthlyUsage?.reduce((sum, record) => sum + record.count, 0) || 0;

    if (currentUsage >= usageLimits.claudeQueries && usageLimits.claudeQueries !== 999999) {
      return new Response(JSON.stringify({
        error: 'Monthly Claude query limit reached',
        usage: currentUsage,
        limit: usageLimits.claudeQueries,
        upgrade_required: true,
        current_tier: userTier
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get Claude API key
    const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    // Create research prompt based on type
    let systemPrompt = '';
    let userPrompt = '';
    const contextNiche = niche || organization.niche || 'general';

    if (customPrompt) {
      systemPrompt = `You are an expert researcher and writer. Provide comprehensive, well-structured content that is informative and engaging.`;
      userPrompt = customPrompt;
    } else {
      switch (researchType) {
        case 'deep_analysis':
          systemPrompt = `You are a strategic research analyst specializing in ${contextNiche}. Provide comprehensive analysis with actionable insights, current trends, and future implications.`;
          userPrompt = `Conduct a deep analysis of "${topic}" in the ${contextNiche} industry. Include:
1. Current landscape and key players
2. Market trends and consumer behavior
3. Opportunities and challenges
4. Future predictions and strategic recommendations
5. Specific actionable insights for content creators

Provide detailed, well-researched content with specific examples and data where relevant.`;
          break;
        
        case 'content_ideas':
          systemPrompt = `You are a creative content strategist specializing in ${contextNiche}. Generate innovative, engaging content ideas that resonate with audiences.`;
          userPrompt = `Generate 10 unique content ideas around "${topic}" for ${contextNiche} creators. For each idea, provide:
1. A compelling headline/title
2. Key points to cover
3. Target audience insights
4. Engagement strategies
5. Platform-specific adaptations

Focus on viral potential, audience value, and current relevance.`;
          break;
        
        case 'competitive_analysis':
          systemPrompt = `You are a competitive intelligence analyst. Provide comprehensive competitive landscape analysis with strategic insights.`;
          userPrompt = `Analyze the competitive landscape for "${topic}" in ${contextNiche}. Include:
1. Key competitors and their strategies
2. Content gaps and opportunities
3. Unique positioning angles
4. Audience overlap analysis
5. Differentiation strategies

Provide specific recommendations for standing out in this space.`;
          break;
        
        case 'trend_forecast':
          systemPrompt = `You are a trend forecasting expert specializing in ${contextNiche}. Predict emerging trends and their implications.`;
          userPrompt = `Forecast trends related to "${topic}" in ${contextNiche} for the next 6-12 months. Include:
1. Emerging trends and signals
2. Consumer behavior shifts
3. Technology impacts
4. Cultural and social influences
5. Content opportunities from these trends

Provide specific predictions with reasoning and timeline estimates.`;
          break;
        
        default:
          systemPrompt = `You are an expert researcher specializing in ${contextNiche}. Provide comprehensive, well-structured analysis.`;
          userPrompt = `Research and analyze "${topic}" in the context of ${contextNiche}. Provide detailed insights, current trends, and actionable recommendations.`;
      }
    }

    console.log('Querying Claude with research type:', researchType);

    // Query Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const data = await claudeResponse.json();
    const researchData = {
      content: data.content[0].text,
      model_used: 'claude-sonnet-4-20250514',
      research_type: researchType,
      topic: topic || 'Custom Research',
      timestamp: new Date().toISOString(),
      usage: {
        input_tokens: data.usage.input_tokens,
        output_tokens: data.usage.output_tokens
      }
    };

    // Save research record
    await supabaseService
      .from('usage_tracking')
      .insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        resource_type: 'claude_query',
        count: 1,
        tier: userTier,
        metadata: { 
          research_type: researchType, 
          topic: topic || 'custom',
          tokens_used: data.usage.input_tokens + data.usage.output_tokens
        }
      });

    console.log('Claude research completed successfully');

    return new Response(JSON.stringify({
      success: true,
      research: researchData,
      usage: {
        current: currentUsage + 1,
        limit: usageLimits.claudeQueries,
        tier: userTier
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in claude-research function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});