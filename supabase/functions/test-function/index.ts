import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== TEST FUNCTION START ===');
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing POST request');
    
    // Test 1: Environment Variables
    console.log('=== TESTING ENVIRONMENT VARIABLES ===');
    const envTest = {
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasSupabaseAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
      hasSupabaseServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      hasPerplexityKey: !!Deno.env.get('PERPLEXITY_API_KEY'),
      supabaseUrl: Deno.env.get('SUPABASE_URL')?.substring(0, 30) + '...'
    };
    console.log('Environment test:', envTest);

    // Test 2: Request Body Parsing
    console.log('=== TESTING REQUEST PARSING ===');
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body parsed successfully:', requestBody);
    } catch (e) {
      console.log('Request body parse error:', e.message);
      requestBody = { error: 'Failed to parse request body' };
    }

    // Test 3: Supabase Client Creation
    console.log('=== TESTING SUPABASE CLIENTS ===');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log('Anon client created successfully');

    const supabaseService = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );
    console.log('Service client created successfully');

    // Test 4: Authentication (if auth header provided)
    console.log('=== TESTING AUTHENTICATION ===');
    let authTest = { status: 'no_auth_header' };
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
        if (userError) {
          authTest = { status: 'auth_error', error: userError.message };
        } else if (userData.user) {
          authTest = { 
            status: 'authenticated', 
            userId: userData.user.id,
            email: userData.user.email 
          };
        } else {
          authTest = { status: 'no_user_data' };
        }
      } catch (e) {
        authTest = { status: 'auth_exception', error: e.message };
      }
    }
    console.log('Auth test result:', authTest);

    // Test 5: Database Connectivity (if authenticated)
    console.log('=== TESTING DATABASE CONNECTIVITY ===');
    let dbTest = { status: 'skipped_no_auth' };
    if (authTest.status === 'authenticated') {
      try {
        const { data: profile, error: profileError } = await supabaseService
          .from('profiles')
          .select('organization_id')
          .eq('user_id', authTest.userId)
          .maybeSingle();
        
        if (profileError) {
          dbTest = { status: 'profile_error', error: profileError.message };
        } else if (profile) {
          dbTest = { status: 'profile_found', organizationId: profile.organization_id };
          
          // Test organization query
          const { data: org, error: orgError } = await supabaseService
            .from('organizations')
            .select('subscription_tier, usage_limits')
            .eq('id', profile.organization_id)
            .maybeSingle();
            
          if (orgError) {
            dbTest.orgError = orgError.message;
          } else if (org) {
            dbTest.organization = {
              tier: org.subscription_tier,
              limits: org.usage_limits
            };
          }
        } else {
          dbTest = { status: 'no_profile_found' };
        }
      } catch (e) {
        dbTest = { status: 'db_exception', error: e.message };
      }
    }
    console.log('Database test result:', dbTest);

    // Test 6: Perplexity API Key Test
    console.log('=== TESTING PERPLEXITY API KEY ===');
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    let perplexityTest = {
      hasKey: !!perplexityKey,
      keyLength: perplexityKey?.length || 0,
      keyPreview: perplexityKey ? perplexityKey.substring(0, 10) + '...' : 'none'
    };
    console.log('Perplexity test result:', perplexityTest);

    // Compile final test results
    const testResults = {
      timestamp: new Date().toISOString(),
      environment: envTest,
      requestBody,
      authentication: authTest,
      database: dbTest,
      perplexity: perplexityTest,
      status: 'all_tests_completed'
    };

    console.log('=== ALL TESTS COMPLETED ===');
    console.log('Final results:', JSON.stringify(testResults, null, 2));

    return new Response(JSON.stringify({
      success: true,
      message: 'Test function completed successfully',
      results: testResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('=== TEST FUNCTION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      stack: error.stack,
      type: typeof error
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});