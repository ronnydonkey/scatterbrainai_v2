
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';
import { createDetailedAnalysisPrompt } from './helpers/ai-prompt.ts';
import { generateAIAnalysis } from './helpers/ai-service.ts';
import { checkExistingReport, saveReport, createComprehensiveReport } from './helpers/report-service.ts';

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

    const { insightId, originalInput, basicInsights, generateResources, includeAffiliateLinks } = await req.json();

    // Check if report already exists
    const existingReport = await checkExistingReport(supabase, insightId, user.id);

    if (existingReport) {
      console.log('Found existing report, returning cached version');
      return new Response(JSON.stringify({ success: true, report: existingReport.report_data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('No existing report found, generating new one');

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error('User organization not found');
    }

    console.log('Generating detailed report for insight:', insightId);

    // Generate detailed analysis using AI
    const detailedAnalysis = await generateAIAnalysis(
      originalInput,
      basicInsights,
      createDetailedAnalysisPrompt(),
      openAIApiKey
    );

    // Create comprehensive report
    const report = createComprehensiveReport(insightId, detailedAnalysis, includeAffiliateLinks);

    // Store the report in the database
    await saveReport(supabase, insightId, user.id, profile.organization_id, report);

    return new Response(JSON.stringify({ success: true, report }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Detailed report generation failed:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
