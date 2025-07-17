
export const createDetailedAnalysisPrompt = () => `You are a detailed insight analyst. Generate a comprehensive report based on the provided input and basic insights. Return a JSON object with the following structure:
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
    "articles": [{"title": "Article title", "url": "https://example.com", "description": "Brief description"}],
    "tools": [{"name": "Tool name", "url": "https://example.com", "description": "Tool description"}]
  },
  "contentSuggestions": {
    "socialPosts": {
      "twitter": {"content": "Tweet content"},
      "linkedin": {"content": "LinkedIn post content"}
    }
  }
}

IMPORTANT: Provide real, working URLs for articles and tools. Use these verified links:

Articles:
- "When Do You Feel Most Creative? Why Ideas Bloom at Bedtime": https://www.psychologytoday.com/us/blog/automatic-you/202309/when-do-you-feel-most-creative-why-ideas-bloom-at-bedtime
- "How to Capture Your Ideas and Accomplish More": https://evernote.com/blog/capture-ideas-accomplish-more
- "Collaboration Evolution: From CCing to Project Management Tools": https://www.proofhub.com/articles/evolution-of-collaboration-from-email-to-collaborative-workspaces
- "That moment when you're nodding off is a sweet spot for creativity": https://news.mit.edu/2023/sleep-sweet-spot-dreams-creativity-0515
- "We are at our most creative just before we fall asleep, scientists say": https://www.weforum.org/stories/2022/01/creativity-hotspot-just-before-sleep/

Tools:
- "Otter.ai": https://get.otter.ai/
- "Google Speech-to-Text API": https://cloud.google.com/speech-to-text/docs
- "UserVoice": https://www.uservoice.com/
- "Zapier": https://zapier.com/blog/collaboration-apps/
- "Slack": https://slack.com/blog/collaboration/team-collaboration-tools

Choose relevant articles and tools from these verified options based on the content topic.`;
