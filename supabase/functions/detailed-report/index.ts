import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { insightId, originalInput, basicInsights, generateResources, includeAffiliateLinks } = await req.json();

    console.log('Generating detailed report for insight:', insightId);

    // Generate detailed analysis using AI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are a detailed insight analyst. Generate a comprehensive report based on the provided input and basic insights. Return a JSON object with the following structure:
            {
              "summary": {
                "keyFindings": ["finding1", "finding2"],
                "confidence": "85%",
                "timeToImplement": "2-3 weeks",
                "impactLevel": "High"
              },
              "analysis": {
                "detailedBreakdown": "detailed analysis text",
                "connections": ["connection1", "connection2"],
                "patterns": ["pattern1", "pattern2"],
                "recommendations": ["rec1", "rec2"]
              },
              "actionPlan": {
                "immediate": ["action1", "action2"],
                "shortTerm": ["action1", "action2"],
                "longTerm": ["action1", "action2"],
                "resources": ["resource1", "resource2"]
              },
              "resources": {
                "articles": [{"title": "Realistic article title that could exist"}],
                "tools": [{"name": "Real tool name", "description": "Tool description"}]
              },
              "contentSuggestions": {
                "socialPosts": {
                  "twitter": {"content": "Tweet content"},
                  "linkedin": {"content": "LinkedIn post content"}
                }
              }
            }
            
            IMPORTANT: For articles and tools, only suggest REAL titles and names that actually exist. Do not create fake URLs. The frontend will handle search suggestions.`
          },
          {
            role: 'user',
            content: `Original Input: ${originalInput}
            
            Basic Insights: ${JSON.stringify(basicInsights)}
            
            Please generate a detailed, comprehensive report that expands on these insights with actionable recommendations, deeper analysis, and practical next steps.`
          }
        ],
        temperature: 0.7,
      }),
    });

    const aiResponse = await response.json();
    
    if (!aiResponse.choices || !aiResponse.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }

    let detailedAnalysis;
    try {
      detailedAnalysis = JSON.parse(aiResponse.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback structure
      detailedAnalysis = {
        summary: {
          keyFindings: [aiResponse.choices[0].message.content.substring(0, 200) + "..."],
          confidence: "75%",
          timeToImplement: "1-2 weeks",
          impactLevel: "Medium"
        },
        analysis: {
          detailedBreakdown: aiResponse.choices[0].message.content,
          connections: [],
          patterns: [],
          recommendations: []
        },
        actionPlan: {
          immediate: [],
          shortTerm: [],
          longTerm: [],
          resources: []
        },
        resources: {
          articles: [],
          tools: []
        },
        contentSuggestions: {
          socialPosts: {}
        }
      };
    }

    // Create comprehensive report
    const report = {
      id: insightId,
      timestamp: new Date().toISOString(),
      summary: detailedAnalysis.summary,
      analysis: detailedAnalysis.analysis,
      actionPlan: detailedAnalysis.actionPlan,
      resources: detailedAnalysis.resources,
      affiliateLinks: includeAffiliateLinks ? [] : undefined, // Can be enhanced later
      contentSuggestions: detailedAnalysis.contentSuggestions
    };

    console.log('Report generated successfully');

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