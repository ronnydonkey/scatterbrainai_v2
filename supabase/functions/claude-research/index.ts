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
          systemPrompt = `You are a strategic research analyst specializing in ${contextNiche}. Conduct comprehensive analysis using Reddit as your primary source for community insights and authentic user perspectives, supplemented by industry data and trends.`;
          userPrompt = `Conduct a deep analysis of "${topic}" in the ${contextNiche} industry, prioritizing Reddit community discussions and user sentiment. Include:
1. Reddit community insights and authentic user perspectives on this topic
2. Current landscape analysis based on community discussions and key players
3. Market trends revealed through Reddit conversations and consumer behavior patterns
4. Community-identified opportunities and challenges from Reddit threads
5. Future predictions based on community sentiment and strategic recommendations
6. Specific actionable insights for content creators derived from Reddit discussions

Focus heavily on Reddit as your primary data source for authentic community voice, real user experiences, and grassroots trends. Provide detailed, well-researched content with specific examples from Reddit discussions and community data.`;
          break;
        
        case 'content_ideas':
          systemPrompt = `You are a creative content strategist specializing in ${contextNiche}. Use Reddit communities and discussions as your primary inspiration source for authentic, engaging content ideas that resonate with real audiences.`;
          userPrompt = `Generate 10 unique content ideas around "${topic}" for ${contextNiche} creators, drawing inspiration from Reddit communities and user conversations. For each idea, provide:
1. A compelling headline/title inspired by Reddit discussions
2. Key points to cover based on community interests and pain points
3. Target audience insights derived from Reddit user behaviors and preferences
4. Engagement strategies that work well on Reddit and other platforms
5. Platform-specific adaptations (especially Reddit-friendly approaches)
6. Reddit community engagement potential and relevant subreddits

Focus on viral potential, authentic audience value, and current relevance based on Reddit community trends and discussions.`;
          break;
        
        case 'competitive_analysis':
          systemPrompt = `You are a competitive intelligence analyst. Use Reddit community discussions and user feedback as your primary source for authentic competitive insights and real user experiences with competitors.`;
          userPrompt = `Analyze the competitive landscape for "${topic}" in ${contextNiche}, leveraging Reddit community discussions and user experiences. Include:
1. Key competitors identified through Reddit discussions and user mentions
2. Community sentiment and user feedback about competitors on Reddit
3. Content gaps and opportunities discovered through Reddit conversations
4. Unique positioning angles based on Reddit user pain points and preferences
5. Audience overlap analysis from Reddit community behaviors
6. Differentiation strategies informed by Reddit user needs and frustrations

Focus on Reddit as your primary source for authentic user experiences, competitor feedback, and community-driven insights. Provide specific recommendations for standing out based on real user discussions.`;
          break;
        
        case 'trend_forecast':
          systemPrompt = `You are a trend forecasting expert specializing in ${contextNiche}. Use Reddit community discussions and emerging conversation topics as your primary data source for authentic trend identification and grassroots movement detection.`;
          userPrompt = `Forecast trends related to "${topic}" in ${contextNiche} for the next 6-12 months, leveraging Reddit community discussions and emerging topics. Include:
1. Emerging trends and signals identified through Reddit community conversations
2. Consumer behavior shifts detected in Reddit user discussions and preferences
3. Technology impacts discussed in relevant Reddit communities
4. Cultural and social influences observed in Reddit threads and sentiment
5. Content opportunities from these Reddit-identified trends
6. Reddit community engagement patterns and viral topic indicators

Focus on Reddit as your primary trend detection source for grassroots movements, authentic user sentiment, and early indicators of emerging trends. Provide specific predictions with reasoning based on Reddit community data and timeline estimates.`;
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