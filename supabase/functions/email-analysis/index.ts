import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, analysisData, thoughtContent, thoughtTitle } = await req.json();
    
    if (!email || !analysisData) {
      throw new Error('Missing required fields');
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('Resend API key not configured');
    }

    // Generate comprehensive email HTML
    const emailHtml = generateAnalysisEmail(analysisData, thoughtContent, thoughtTitle);

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ScatterBrain <insights@yourdomain.com>',
        to: [email],
        subject: `🧠 Thought Analysis: ${thoughtTitle || 'Your Latest Insight'}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Email service error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: result.id,
        message: 'Analysis report sent to your email!'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Email error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateAnalysisEmail(analysis: any, thoughtContent: string, thoughtTitle: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thought Analysis Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
    .section { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #667eea; }
    .quote { background: #e9ecef; border-left: 3px solid #667eea; padding: 15px; margin: 10px 0; font-style: italic; }
    .content-block { background: white; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; margin: 10px 0; }
    .hashtags { color: #667eea; font-weight: 500; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; }
    h2 { color: #495057; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    h3 { color: #667eea; margin-top: 0; }
    .badge { background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧠 Thought Analysis Report</h1>
    <p>Your personal AI-powered insight breakdown</p>
  </div>

  <div class="section">
    <h2>📝 Original Thought</h2>
    <p><strong>${thoughtTitle}</strong></p>
    <div class="content-block">
      <p>${thoughtContent}</p>
    </div>
  </div>

  <div class="section">
    <h2>🎯 Summary</h2>
    <p>${analysis.summary}</p>
  </div>

  <div class="section">
    <h2>💡 Key Insights</h2>
    ${analysis.keyInsights?.map((insight: string) => `
      <div class="quote">"${insight}"</div>
    `).join('') || '<p>No specific insights extracted.</p>'}
  </div>

  <div class="section">
    <h2>🏷️ Themes & Mood</h2>
    <p><strong>Themes:</strong> ${analysis.themes?.join(', ') || 'General'}</p>
    <p><strong>Mood:</strong> <span class="badge">${analysis.mood || 'Neutral'}</span></p>
  </div>

  <div class="section">
    <h2>🐦 Twitter Content</h2>
    <div class="content-block">
      <h3>Suggested Tweet</h3>
      <p>${analysis.tweetSuggestion?.text || 'No tweet suggestion generated.'}</p>
      ${analysis.tweetSuggestion?.hashtags ? `
        <p class="hashtags">${analysis.tweetSuggestion.hashtags.map((tag: string) => `#${tag}`).join(' ')}</p>
        <p><small>Engagement Potential: <span class="badge">${analysis.tweetSuggestion.engagementPotential}</span></small></p>
      ` : ''}
    </div>
  </div>

  <div class="section">
    <h2>💼 LinkedIn Content</h2>
    <div class="content-block">
      <h3>${analysis.linkedinPost?.title || 'Professional Post'}</h3>
      <p>${analysis.linkedinPost?.text || 'No LinkedIn content generated.'}</p>
      ${analysis.linkedinPost?.hashtags ? `
        <p class="hashtags">${analysis.linkedinPost.hashtags.map((tag: string) => `#${tag}`).join(' ')}</p>
        <p><small>Voice Match: <span class="badge">${analysis.linkedinPost.voiceMatch || 85}%</span></small></p>
      ` : ''}
    </div>
  </div>

  <div class="section">
    <h2>🚀 Actionable Insights</h2>
    ${analysis.actionableInsights?.map((insight: string) => `
      <div class="content-block">
        <p>• ${insight}</p>
      </div>
    `).join('') || '<p>No specific actionable insights found.</p>'}
  </div>

  <div class="section">
    <h2>🎨 Content Angles</h2>
    ${analysis.contentAngles?.map((angle: string) => `
      <div class="content-block">
        <p>• ${angle}</p>
      </div>
    `).join('') || '<p>No alternative content angles suggested.</p>'}
  </div>

  <div class="footer">
    <p>Generated by ScatterBrain AI • Keep thinking, keep creating</p>
    <p><small>This analysis was created to help you understand and share your thoughts more effectively.</small></p>
  </div>
</body>
</html>
  `;
}