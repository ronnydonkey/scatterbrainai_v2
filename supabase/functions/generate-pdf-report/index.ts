import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { insightId, reportData, originalInput, timestamp } = await req.json();
    
    console.log('Generating PDF for insight:', insightId);

    // Create readable filename from timestamp
    const date = new Date(parseInt(timestamp));
    const dateStr = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }).replace(/[,\s]/g, '-');
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    }).replace(':', '');
    
    const readableFilename = `Scatterbrain-Insight-${dateStr}-${timeStr}`;

    // Create HTML content for the PDF
    const htmlContent = generateReportHTML(reportData, originalInput, timestamp, insightId);
    
    // Generate simple text report as PDF fallback
    const textReport = generateTextReport(reportData, originalInput, timestamp, insightId);
    const textBytes = new TextEncoder().encode(textReport);
    
    return new Response(
      JSON.stringify({ 
        pdfBuffer: Array.from(textBytes),
        contentType: 'text/plain',
        filename: `${readableFilename}.txt`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback: Return formatted text content
    try {
      const { reportData, originalInput, timestamp, insightId } = await req.json();
      const textContent = generateTextReport(reportData, originalInput, timestamp, insightId);
      
      return new Response(
        JSON.stringify({ 
          pdfBuffer: Array.from(new TextEncoder().encode(textContent)),
          contentType: 'text/plain'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } catch (fallbackError) {
      console.error('Fallback generation failed:', fallbackError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate report' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
  }
});

function generateReportHTML(reportData: any, originalInput: string, timestamp: string, insightId: string): string {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Scatterbrain Insight Report</title>
      <style>${getReportCSS()}</style>
    </head>
    <body>
      <div class="container">
        <header class="header">
          <h1>🧠 SCATTERBRAIN REPORT</h1>
          <p class="subtitle">Insight Analysis</p>
          <p class="date">Generated: ${formatDate(timestamp)}</p>
        </header>

        <section class="original-input">
          <h2>Original Thought</h2>
          <div class="content-box">
            <p>${originalInput}</p>
          </div>
        </section>

         <section class="executive-summary">
           <h2>Executive Summary</h2>
           ${reportData.summary?.keyFindings?.map((finding: string) => `
             <div class="finding">
               <p>${finding}</p>
             </div>
           `).join('') || ''}
         </section>

        <section class="analysis">
          <h2>Deep Dive Analysis</h2>
          ${reportData.analysis?.detailedBreakdown ? `
            <div class="analysis-section">
              <h3>Detailed Breakdown</h3>
              <p>${reportData.analysis.detailedBreakdown}</p>
            </div>
          ` : ''}
          
          ${reportData.analysis?.patterns ? `
            <div class="analysis-section">
              <h3>Patterns Identified</h3>
              <div class="patterns">
                ${reportData.analysis.patterns.map((pattern: string) => `
                  <span class="pattern-tag">${pattern}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${reportData.analysis?.recommendations ? `
            <div class="analysis-section">
              <h3>Recommendations</h3>
              <ul>
                ${reportData.analysis.recommendations.map((rec: string) => `
                  <li>${rec}</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </section>

        <section class="action-plan">
          <h2>Action Plan</h2>
          <div class="action-columns">
            ${reportData.actionPlan?.immediate ? `
              <div class="action-column">
                <h3 class="immediate">Immediate Actions</h3>
                <ul>
                  ${reportData.actionPlan.immediate.map((action: string) => `
                    <li>${action}</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${reportData.actionPlan?.shortTerm ? `
              <div class="action-column">
                <h3 class="short-term">Short Term</h3>
                <ul>
                  ${reportData.actionPlan.shortTerm.map((action: string) => `
                    <li>${action}</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${reportData.actionPlan?.longTerm ? `
              <div class="action-column">
                <h3 class="long-term">Long Term</h3>
                <ul>
                  ${reportData.actionPlan.longTerm.map((action: string) => `
                    <li>${action}</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </section>

        ${reportData.resources ? `
          <section class="resources">
            <h2>Research & Resources</h2>
            <div class="resource-columns">
              ${reportData.resources.articles ? `
                <div class="resource-column">
                  <h3>Articles</h3>
                  <ul>
                    ${reportData.resources.articles.map((article: any) => `
                      <li>
                        <strong>${article.title}</strong><br>
                        <span class="url">${article.url}</span>
                        ${article.description ? `<br><em>${article.description}</em>` : ''}
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${reportData.resources.tools ? `
                <div class="resource-column">
                  <h3>Tools</h3>
                  <ul>
                    ${reportData.resources.tools.map((tool: any) => `
                      <li>
                        <strong>${tool.name}</strong><br>
                        <span class="url">${tool.url}</span>
                        <br><em>${tool.description}</em>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          </section>
        ` : ''}

        <footer class="footer">
          <p>Generated by Scatterbrain AI • Report ID: ${insightId}</p>
        </footer>
      </div>
    </body>
    </html>
  `;
}

function getReportCSS(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #6366f1;
    }
    
    .header h1 {
      font-size: 2.5rem;
      color: #6366f1;
      margin-bottom: 10px;
    }
    
    .subtitle {
      font-size: 1.2rem;
      color: #6b7280;
      margin-bottom: 5px;
    }
    
    .date {
      font-size: 0.9rem;
      color: #9ca3af;
    }
    
    section {
      margin-bottom: 40px;
    }
    
    h2 {
      font-size: 1.8rem;
      color: #1f2937;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    h3 {
      font-size: 1.3rem;
      color: #374151;
      margin-bottom: 15px;
    }
    
    .content-box, .finding {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
      border-left: 4px solid #6366f1;
    }
    
    .metrics {
      display: flex;
      justify-content: space-around;
      margin-bottom: 30px;
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
    }
    
    .metric {
      text-align: center;
    }
    
    .metric-value {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
      color: #6366f1;
    }
    
    .metric-label {
      font-size: 0.9rem;
      color: #6b7280;
    }
    
    .analysis-section {
      margin-bottom: 25px;
    }
    
    .patterns {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .pattern-tag {
      background: #6366f1;
      color: white;
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
    }
    
    .action-columns, .resource-columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }
    
    .action-column, .resource-column {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
    }
    
    .immediate {
      color: #dc2626;
      border-bottom: 2px solid #dc2626;
    }
    
    .short-term {
      color: #d97706;
      border-bottom: 2px solid #d97706;
    }
    
    .long-term {
      color: #059669;
      border-bottom: 2px solid #059669;
    }
    
    ul {
      padding-left: 20px;
    }
    
    li {
      margin-bottom: 8px;
    }
    
    .url {
      color: #6366f1;
      font-size: 0.8rem;
    }
    
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 0.9rem;
    }
    
    @media print {
      .container {
        padding: 20px;
      }
      
      section {
        page-break-inside: avoid;
      }
    }
  `;
}

function generateTextReport(reportData: any, originalInput: string, timestamp: string, insightId: string): string {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let report = `
🧠 SCATTERBRAIN REPORT
Insight Analysis
Generated: ${formatDate(timestamp)}
Report ID: ${insightId}

${'='.repeat(80)}

ORIGINAL THOUGHT
${'-'.repeat(20)}
${originalInput}

${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(20)}

Key Findings:
`;

  if (reportData.summary?.keyFindings) {
    reportData.summary.keyFindings.forEach((finding: string, index: number) => {
      report += `${index + 1}. ${finding}\n`;
    });
  }

  report += `
${'='.repeat(80)}

DEEP DIVE ANALYSIS
${'-'.repeat(20)}
`;

  if (reportData.analysis?.detailedBreakdown) {
    report += `Detailed Breakdown:\n${reportData.analysis.detailedBreakdown}\n\n`;
  }

  if (reportData.analysis?.patterns) {
    report += `Patterns Identified:\n`;
    reportData.analysis.patterns.forEach((pattern: string) => {
      report += `• ${pattern}\n`;
    });
    report += '\n';
  }

  if (reportData.analysis?.recommendations) {
    report += `Recommendations:\n`;
    reportData.analysis.recommendations.forEach((rec: string) => {
      report += `• ${rec}\n`;
    });
    report += '\n';
  }

  report += `${'='.repeat(80)}

ACTION PLAN
${'-'.repeat(20)}
`;

  if (reportData.actionPlan?.immediate) {
    report += `IMMEDIATE ACTIONS:\n`;
    reportData.actionPlan.immediate.forEach((action: string) => {
      report += `• ${action}\n`;
    });
    report += '\n';
  }

  if (reportData.actionPlan?.shortTerm) {
    report += `SHORT TERM:\n`;
    reportData.actionPlan.shortTerm.forEach((action: string) => {
      report += `• ${action}\n`;
    });
    report += '\n';
  }

  if (reportData.actionPlan?.longTerm) {
    report += `LONG TERM:\n`;
    reportData.actionPlan.longTerm.forEach((action: string) => {
      report += `• ${action}\n`;
    });
    report += '\n';
  }

  if (reportData.resources) {
    report += `${'='.repeat(80)}

RESEARCH & RESOURCES
${'-'.repeat(20)}
`;

    if (reportData.resources.articles) {
      report += `ARTICLES:\n`;
      reportData.resources.articles.forEach((article: any) => {
        report += `• ${article.title}\n  ${article.url}\n`;
        if (article.description) {
          report += `  ${article.description}\n`;
        }
        report += '\n';
      });
    }

    if (reportData.resources.tools) {
      report += `TOOLS:\n`;
      reportData.resources.tools.forEach((tool: any) => {
        report += `• ${tool.name}\n  ${tool.url}\n  ${tool.description}\n\n`;
      });
    }
  }

  report += `${'='.repeat(80)}

Generated by Scatterbrain AI
`;

  return report;
}

function generateSimplePDF(reportData: any, originalInput: string, timestamp: string, insightId: string): string {
  // For now, return the text version as fallback
  // In a production environment, you might want to use a different PDF library
  return generateTextReport(reportData, originalInput, timestamp, insightId);
}