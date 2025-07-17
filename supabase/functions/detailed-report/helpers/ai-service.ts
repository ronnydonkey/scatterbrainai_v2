
interface AIAnalysisResponse {
  summary: {
    keyFindings: string[];
    confidence: string;
    timeToImplement: string;
    impactLevel: string;
  };
  analysis: {
    detailedBreakdown: string;
    connections: string[];
    patterns: string[];
    recommendations: string[];
  };
  actionPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    resources: string[];
  };
  resources: {
    articles: Array<{ title: string; url: string; description: string }>;
    tools: Array<{ name: string; url: string; description: string }>;
  };
  contentSuggestions: {
    socialPosts: Record<string, { content: string }>;
  };
}

export async function generateAIAnalysis(
  originalInput: string,
  basicInsights: any,
  systemPrompt: string,
  openAIApiKey: string
): Promise<AIAnalysisResponse> {
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
          content: systemPrompt
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

  let detailedAnalysis: AIAnalysisResponse;
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

  return detailedAnalysis;
}
