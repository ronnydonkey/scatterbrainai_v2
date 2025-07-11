import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIER_LIMITS = {
  starter: { perplexityQueries: 0 },
  professional: { perplexityQueries: 10 },
  agency: { perplexityQueries: 25 },
  enterprise: { perplexityQueries: 999999 }
};

serve(async (req) => {
  console.log('=== PERPLEXITY FUNCTION START ===');
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Processing POST request');
  console.log('Available env vars:', {
    hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
    hasSupabaseAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
    hasSupabaseServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    hasPerplexityKey: !!Deno.env.get('PERPLEXITY_API_KEY')
  });

  try {
    console.log('Starting perplexity-research function');
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    const { topic, niche, queryType = 'trend_verification' } = requestBody;

    if (!topic) {
      throw new Error('Topic is required');
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // Create service role client for database operations
    const supabaseService = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('Authentication required');
    }

    const user = userData.user;
    console.log('Authenticated user details:', { id: user.id, email: user.email });

    // Get user's organization and profile using service role
    const { data: profile, error: profileError } = await supabaseService
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile query error:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    if (!profile?.organization_id) {
      throw new Error('User profile not found. Please complete your profile setup.');
    }

    // Get organization details and subscription tier using service role
    const { data: organization, error: orgError } = await supabaseService
      .from('organizations')
      .select('subscription_tier, usage_limits, niche')
      .eq('id', profile.organization_id)
      .maybeSingle();

    if (orgError) {
      console.error('Organization query error:', orgError);
      throw new Error('Failed to fetch organization details');
    }

    if (!organization) {
      throw new Error('Organization not found');
    }

    const userTier = organization.subscription_tier || 'starter';
    const usageLimits = organization.usage_limits || TIER_LIMITS[userTier];

    // Check if user has access to Perplexity
    if (usageLimits.perplexityQueries === 0) {
      return new Response(JSON.stringify({
        error: 'Perplexity research requires Professional or Enterprise tier',
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
    
    const { data: monthlyUsage } = await supabaseClient
      .from('usage_tracking')
      .select('count')
      .eq('organization_id', profile.organization_id)
      .eq('resource_type', 'perplexity_query')
      .gte('tracked_date', firstDayOfMonth.toISOString().split('T')[0]);

    const currentUsage = monthlyUsage?.reduce((sum, record) => sum + record.count, 0) || 0;

    if (currentUsage >= usageLimits.perplexityQueries && usageLimits.perplexityQueries !== 999999) {
      return new Response(JSON.stringify({
        error: 'Monthly Perplexity query limit reached',
        usage: currentUsage,
        limit: usageLimits.perplexityQueries,
        upgrade_required: true,
        current_tier: userTier
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get Perplexity API key
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    // Create query based on type and niche
    let query = '';
    const contextNiche = niche || organization.niche || 'general';

    if (queryType === 'trend_verification') {
      query = `Latest discussions about "${topic}" in ${contextNiche} community. What are people saying right now? Include current sentiment and engagement levels.`;
    } else if (queryType === 'competitive_analysis') {
      query = `What content about "${topic}" have major ${contextNiche} influencers and brands published recently? What angles are they missing?`;
    } else if (queryType === 'content_opportunity') {
      query = `What specific questions and pain points about "${topic}" are ${contextNiche} communities discussing right now? What content opportunities exist?`;
    }

    console.log('Querying Perplexity with:', query);

    // Query Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a trend research analyst. Provide current, factual information with specific examples and actionable insights.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        return_citations: true,
        return_images: false,
        search_recency_filter: 'week'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Perplexity API error:', error);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const researchData = {
      content: data.choices[0].message.content,
      sources: data.citations || [],
      model_used: 'llama-3.1-sonar-large-128k-online',
      query_type: queryType,
      timestamp: new Date().toISOString()
    };

    // Save query record using existing service client

    // Save query record
    await supabaseService
      .from('perplexity_queries')
      .insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        query_text: query,
        response_data: researchData,
        sources: data.citations || [],
        tier_used: userTier
      });

    // Track usage
    await supabaseService
      .from('usage_tracking')
      .insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        resource_type: 'perplexity_query',
        count: 1,
        tier: userTier,
        metadata: { query_type: queryType, topic }
      });

    console.log('Perplexity research completed successfully');

    return new Response(JSON.stringify({
      success: true,
      research: researchData,
      usage: {
        current: currentUsage + 1,
        limit: usageLimits.perplexityQueries,
        tier: userTier
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in perplexity-research function:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    console.error('Error type:', typeof error);
    console.error('Error keys:', Object.keys(error || {}));
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      success: false,
      debug: {
        type: typeof error,
        keys: Object.keys(error || {}),
        stack: error.stack
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});