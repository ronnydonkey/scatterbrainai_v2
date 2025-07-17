import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';

export async function checkExistingReport(
  supabase: any,
  insightId: string,
  userId: string
) {
  console.log('Checking for existing detailed report for insight:', insightId);

  const { data: existingReport, error: fetchError } = await supabase
    .from('detailed_reports')
    .select('report_data')
    .eq('insight_id', insightId)
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error checking for existing report:', fetchError);
  }

  return existingReport;
}

export async function saveReport(
  supabase: any,
  insightId: string,
  userId: string,
  organizationId: string,
  report: any
) {
  console.log('Report generated successfully, storing in database');

  const { error: insertError } = await supabase
    .from('detailed_reports')
    .insert({
      insight_id: insightId,
      user_id: userId,
      organization_id: organizationId,
      report_data: report
    });

  if (insertError) {
    console.error('Failed to store report:', insertError);
    // Still return the report even if storage fails
  }
}

export function createComprehensiveReport(
  insightId: string,
  detailedAnalysis: any,
  includeAffiliateLinks: boolean
) {
  return {
    id: insightId,
    timestamp: new Date().toISOString(),
    summary: detailedAnalysis.summary,
    analysis: detailedAnalysis.analysis,
    actionPlan: detailedAnalysis.actionPlan,
    resources: detailedAnalysis.resources,
    affiliateLinks: includeAffiliateLinks ? [] : undefined, // Can be enhanced later
    contentSuggestions: detailedAnalysis.contentSuggestions
  };
}
