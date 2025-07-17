
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    const { email, analysisData, thoughtContent, thoughtTitle } = await req.json();

    console.log('Attempting to send email to:', email);
    console.log('Analysis data available:', !!analysisData);
    console.log('Thought content available:', !!thoughtContent);

    if (!email) {
      throw new Error('Email address is required');
    }

    // Create a beautiful HTML email template
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${thoughtTitle}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #f5f5f5;
            }
            .container {
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: bold;
            }
            .header h2 {
              margin: 10px 0 0 0;
              font-size: 18px;
              opacity: 0.9;
              font-weight: normal;
            }
            .content { 
              padding: 40px 30px; 
            }
            .section { 
              margin: 40px 0; 
            }
            .section h3 {
              color: #667eea;
              font-size: 20px;
              margin-bottom: 20px;
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 10px;
            }
            .original-thought {
              background: linear-gradient(135deg, #f6f8ff 0%, #e8f0ff 100%);
              padding: 25px;
              border-radius: 10px;
              border-left: 5px solid #667eea;
              font-style: italic;
              font-size: 16px;
              margin: 20px 0;
            }
            .insight { 
              background: #f9f9f9; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 15px 0; 
              border-left: 4px solid #667eea; 
            }
            .action-item { 
              background: #e3f2fd; 
              padding: 15px; 
              border-radius: 8px; 
              margin: 10px 0; 
              border-left: 3px solid #2196f3;
            }
            .footer { 
              text-align: center; 
              color: #666; 
              margin-top: 40px; 
              padding: 30px;
              background: #f8f9fa;
              border-top: 1px solid #e9ecef;
            }
            .footer p {
              margin: 5px 0;
            }
            .btn {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧠 ScatterBrainAI Report</h1>
              <h2>${thoughtTitle}</h2>
            </div>
            
            <div class="content">
              <div class="section">
                <h3>💭 Your Original Thought</h3>
                <div class="original-thought">
                  "${thoughtContent}"
                </div>
              </div>

              ${analysisData.summary ? `
              <div class="section">
                <h3>📊 Executive Summary</h3>
                ${analysisData.summary.keyFindings ? analysisData.summary.keyFindings.map(finding => `
                  <div class="insight">
                    <strong>Key Finding:</strong> ${finding}
                  </div>
                `).join('') : ''}
                ${analysisData.summary.confidence ? `
                  <div class="insight">
                    <strong>Confidence Level:</strong> ${analysisData.summary.confidence}
                  </div>
                ` : ''}
                ${analysisData.summary.timeToImplement ? `
                  <div class="insight">
                    <strong>Time to Implement:</strong> ${analysisData.summary.timeToImplement}
                  </div>
                ` : ''}
                ${analysisData.summary.impactLevel ? `
                  <div class="insight">
                    <strong>Impact Level:</strong> ${analysisData.summary.impactLevel}
                  </div>
                ` : ''}
              </div>
              ` : ''}

              ${analysisData.analysis ? `
              <div class="section">
                <h3>🔍 Detailed Analysis</h3>
                ${analysisData.analysis.detailedBreakdown ? `
                  <div class="insight">
                    <p>${analysisData.analysis.detailedBreakdown}</p>
                  </div>
                ` : ''}
                ${analysisData.analysis.patterns && analysisData.analysis.patterns.length > 0 ? `
                  <h4 style="color: #667eea; margin-top: 30px;">🧩 Patterns Identified:</h4>
                  ${analysisData.analysis.patterns.map(pattern => `
                    <div class="insight">• ${pattern}</div>
                  `).join('')}
                ` : ''}
                ${analysisData.analysis.recommendations && analysisData.analysis.recommendations.length > 0 ? `
                  <h4 style="color: #667eea; margin-top: 30px;">💡 Recommendations:</h4>
                  ${analysisData.analysis.recommendations.map((rec, i) => `
                    <div class="action-item">${i + 1}. ${rec}</div>
                  `).join('')}
                ` : ''}
              </div>
              ` : ''}

              ${analysisData.actionPlan ? `
              <div class="section">
                <h3>🎯 Action Plan</h3>
                ${analysisData.actionPlan.immediate && analysisData.actionPlan.immediate.length > 0 ? `
                  <h4 style="color: #dc3545;">🔴 Immediate Actions:</h4>
                  ${analysisData.actionPlan.immediate.map((action, i) => `
                    <div class="action-item">${i + 1}. ${action}</div>
                  `).join('')}
                ` : ''}
                ${analysisData.actionPlan.shortTerm && analysisData.actionPlan.shortTerm.length > 0 ? `
                  <h4 style="color: #ffc107;">🟡 Short Term (1-4 weeks):</h4>
                  ${analysisData.actionPlan.shortTerm.map((action, i) => `
                    <div class="action-item">${i + 1}. ${action}</div>
                  `).join('')}
                ` : ''}
                ${analysisData.actionPlan.longTerm && analysisData.actionPlan.longTerm.length > 0 ? `
                  <h4 style="color: #28a745;">🟢 Long Term (1+ months):</h4>
                  ${analysisData.actionPlan.longTerm.map((action, i) => `
                    <div class="action-item">${i + 1}. ${action}</div>
                  `).join('')}
                ` : ''}
              </div>
              ` : ''}

              ${analysisData.contentSuggestions?.socialPosts ? `
              <div class="section">
                <h3>📱 Content Suggestions</h3>
                ${Object.entries(analysisData.contentSuggestions.socialPosts).map(([platform, content]) => `
                  <div class="insight">
                    <strong>${platform.charAt(0).toUpperCase() + platform.slice(1)}:</strong><br>
                    ${content?.content || 'No content available'}
                  </div>
                `).join('')}
              </div>
              ` : ''}

              ${analysisData.resources && (analysisData.resources.articles?.length > 0 || analysisData.resources.tools?.length > 0) ? `
              <div class="section">
                <h3>📚 Resources</h3>
                ${analysisData.resources.articles && analysisData.resources.articles.length > 0 ? `
                  <h4 style="color: #667eea;">📖 Recommended Articles:</h4>
                  ${analysisData.resources.articles.map(article => `
                    <div class="insight">
                      <strong><a href="${article.url}" style="color: #667eea; text-decoration: none;">${article.title}</a></strong><br>
                      <small style="color: #666;">${article.description || 'Click to read more'}</small>
                    </div>
                  `).join('')}
                ` : ''}
                ${analysisData.resources.tools && analysisData.resources.tools.length > 0 ? `
                  <h4 style="color: #667eea;">🛠️ Helpful Tools:</h4>
                  ${analysisData.resources.tools.map(tool => `
                    <div class="insight">
                      <strong><a href="${tool.url}" style="color: #667eea; text-decoration: none;">${tool.name}</a></strong><br>
                      <small style="color: #666;">${tool.description || 'Click to learn more'}</small>
                    </div>
                  `).join('')}
                ` : ''}
              </div>
              ` : ''}
            </div>

            <div class="footer">
              <p><strong>Generated by ScatterBrainAI</strong></p>
              <p>${new Date().toLocaleDateString()} • <em>Transform your scattered thoughts into actionable insights</em></p>
              <a href="https://scatterbrainai.com" class="btn">Visit ScatterBrainAI</a>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "ScatterBrainAI <onboarding@resend.dev>",
      to: [email],
      subject: `🧠 Your ScatterBrainAI Report - ${thoughtTitle}`,
      html: emailHTML,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Report emailed successfully!',
      emailId: emailResponse.id,
      emailContent: emailHTML,
      downloadUrl: `data:text/html;charset=utf-8,${encodeURIComponent(emailHTML)}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Email sending failed:', error);
    
    // If email fails, still provide downloadable HTML
    const fallbackHTML = `
      <!DOCTYPE html>
      <html>
        <head><title>ScatterBrainAI Report</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1>🧠 ScatterBrainAI Report</h1>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>Original Thought:</h3>
            <p><em>"${req.body?.thoughtContent || 'Content not available'}"</em></p>
          </div>
          <p><strong>Note:</strong> Email delivery failed, but you can save this HTML file for your records.</p>
          <p><em>Error: ${error.message}</em></p>
        </body>
      </html>
    `;

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      emailContent: fallbackHTML,
      downloadUrl: `data:text/html;charset=utf-8,${encodeURIComponent(fallbackHTML)}`,
      message: 'Email failed but report HTML is available for download'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
