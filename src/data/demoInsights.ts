// Demo insights data for Scatterbrain showcase
export const demoInsights = [
  {
    id: 'demo-meeting-summary',
    input: `Had a really productive team meeting today but my notes are all over the place. We talked about the Q4 product roadmap, discussed the user feedback from the mobile app release, assigned some action items for the design system updates, and Sarah mentioned something about the budget approval process being delayed. Also need to follow up with marketing about the holiday campaign launch timeline. Oh and we decided to move the retrospective to next Friday instead of Thursday.`,
    response: {
      insights: {
        keyThemes: [
          {
            theme: "Q4 Team Meeting Summary",
            confidence: 0.95,
            explanation: "Meeting summary with clear action items and follow-ups"
          }
        ],
        actionItems: [
          "Follow up with marketing about holiday campaign timeline",
          "Complete design system updates (assigned)",
          "Reschedule retrospective to Friday",
          "Check budget approval status with Sarah"
        ],
        summary: "Productive Q4 planning meeting covering product roadmap, mobile app feedback, design updates, and administrative changes. Key decisions made on retrospective timing and identified budget approval bottleneck.",
        patterns: [
          "Multiple workstreams requiring coordination",
          "Mix of strategic planning and tactical execution",
          "Administrative scheduling adjustments needed"
        ]
      }
    },
    timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
    starred: true,
    archived: false,
    themes: ['meetings', 'planning', 'teamwork'],
    searchTerms: ['meeting', 'Q4', 'roadmap', 'action items', 'retrospective'],
    userActions: {
      calendarEvents: [
        { type: 'retrospective', date: 'Friday', status: 'scheduled' }
      ],
      sharedContent: [],
      completedTasks: ['Schedule retrospective for Friday'],
      followUpAnalyses: []
    },
    isDemo: true
  },
  {
    id: 'demo-random-thoughts',
    input: `Random thoughts bouncing around: Need to start exercising more regularly, maybe join that gym near work. Should also meal prep on Sundays to eat healthier during the week. Been thinking about learning Spanish again, downloaded Duolingo but haven't opened it. Work project deadlines are stressing me out, especially the client presentation next week. Need to organize my desk space, it's becoming chaotic. Want to read more books instead of scrolling social media. Should call mom more often, she complained last week. Maybe plan a weekend trip somewhere peaceful to recharge.`,
    response: {
      insights: {
        keyThemes: [
          {
            theme: "Personal Life Organization & Self-Care",
            confidence: 0.88,
            explanation: "Collection of self-improvement thoughts across health, learning, work-life balance"
          }
        ],
        actionItems: [
          "Sign up for gym membership near work",
          "Set up Sunday meal prep routine",
          "Open Duolingo and complete first Spanish lesson",
          "Organize desk workspace",
          "Schedule regular calls with mom",
          "Research weekend getaway destinations"
        ],
        summary: "Mix of health, learning, and relationship goals alongside work stress management needs. Shows desire for better structure and self-care routines.",
        patterns: [
          "Multiple areas seeking improvement simultaneously",
          "Tension between aspirations and current habits",
          "Work stress impacting personal goal motivation"
        ]
      }
    },
    timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
    starred: false,
    archived: false,
    themes: ['self-improvement', 'wellness', 'organization'],
    searchTerms: ['exercise', 'meal prep', 'Spanish', 'stress', 'books', 'travel'],
    userActions: {
      calendarEvents: [],
      sharedContent: [],
      completedTasks: ['Downloaded Duolingo'],
      followUpAnalyses: []
    },
    isDemo: true
  },
  {
    id: 'demo-tweet-thread',
    input: `I've been thinking about how AI is changing creative work. Not replacing creativity but augmenting it. Like having a super smart creative partner who never gets tired and has read everything. Artists can focus on vision and meaning while AI handles technical execution. Writers can explore ideas faster, iterate quicker. But there's still something irreplaceable about human experience, emotion, the mess of being alive that makes art meaningful. AI can copy style but can it copy soul? Maybe that's the wrong question. Maybe it's about collaboration not competition.`,
    response: {
      insights: {
        keyThemes: [
          {
            theme: "AI as Creative Collaborator Thread",
            confidence: 0.92,
            explanation: "Thoughtful perspective on AI-human creative collaboration ready for social sharing"
          }
        ],
        actionItems: [
          "Draft Twitter thread on AI-human creative collaboration",
          "Research examples of successful AI-artist partnerships",
          "Engage with creative community on this topic"
        ],
        summary: "Nuanced take on AI in creative fields emphasizing collaboration over replacement. Highlights human elements that remain unique while acknowledging AI's augmentative potential.",
        patterns: [
          "Balanced perspective avoiding AI extremes",
          "Focus on human-AI synergy",
          "Questions about authenticity and soul in creativity"
        ],
        socialContent: {
          twitterThread: [
            "🧵 AI isn't replacing creativity—it's becoming the ultimate creative partner who never gets tired and has absorbed all human knowledge.",
            "Artists can focus on vision and meaning while AI handles technical execution. Writers explore ideas faster, iterate quicker.",
            "But there's something irreplaceable about human experience—the beautiful mess of being alive that makes art meaningful.",
            "AI can copy style, but can it copy soul? Maybe that's the wrong question.",
            "Maybe it's about collaboration, not competition. What do you think? 🤖✨"
          ]
        }
      }
    },
    timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000), // 1 week ago
    starred: true,
    archived: false,
    themes: ['AI', 'creativity', 'technology', 'philosophy'],
    searchTerms: ['AI', 'creative', 'art', 'collaboration', 'soul', 'human'],
    userActions: {
      calendarEvents: [],
      sharedContent: [
        { platform: 'twitter', type: 'thread', status: 'drafted' }
      ],
      completedTasks: [],
      followUpAnalyses: []
    },
    isDemo: true
  },
  {
    id: 'demo-research-quotes',
    input: `Some interesting quotes I collected while researching innovation: "Innovation distinguishes between a leader and a follower" - Steve Jobs. "The way to get started is to quit talking and begin doing" - Walt Disney. "Innovation is the ability to see change as an opportunity, not a threat" - Steve Jobs again. "The secret to change is to focus all of your energy not on fighting the old, but on building the new" - Socrates. "If you want something new, you have to stop doing something old" - Peter Drucker. These all seem to point toward action over analysis paralysis.`,
    response: {
      insights: {
        keyThemes: [
          {
            theme: "Innovation & Action Quote Collection",
            confidence: 0.85,
            explanation: "Curated wisdom on innovation with clear actionable theme"
          }
        ],
        actionItems: [
          "Create innovation quote compilation for inspiration",
          "Identify one 'old thing' to stop doing",
          "Choose one new project to start building",
          "Share quote collection with team for motivation"
        ],
        summary: "Collection of innovation quotes emphasizing action over analysis. Common thread: successful innovation requires doing, not just thinking or planning.",
        patterns: [
          "Consistent theme of action over overthinking",
          "Multiple sources reinforcing same principle",
          "Balance between stopping old habits and starting new ones"
        ],
        quoteAnalysis: {
          mainTheme: "Action-oriented innovation",
          keyInsight: "All quotes emphasize doing over discussing",
          personalApplication: "Focus energy on building new rather than analyzing old"
        }
      }
    },
    timestamp: Date.now() - (10 * 24 * 60 * 60 * 1000), // 10 days ago
    starred: false,
    archived: false,
    themes: ['innovation', 'quotes', 'leadership', 'action'],
    searchTerms: ['innovation', 'Steve Jobs', 'Walt Disney', 'action', 'change', 'leadership'],
    userActions: {
      calendarEvents: [],
      sharedContent: [],
      completedTasks: [],
      followUpAnalyses: []
    },
    isDemo: true
  },
  {
    id: 'demo-brainstorm-todos',
    input: `Brainstorming session for the weekend project cleanup: Need to finally organize my digital photos, they're scattered across three different cloud services and my phone is full. Should also tackle that pile of books I've been meaning to read, maybe create a reading schedule. The garage needs serious decluttering before winter, especially the tools and seasonal items. Want to meal prep for next week to save time and money. Should backup my computer files to external drive, haven't done it in months. Maybe learn that new design software I downloaded. Oh and need to return those library books before they're overdue. Actually should just make a prioritized list of all this.`,
    response: {
      insights: {
        keyThemes: [
          {
            theme: "Weekend Project & Organization Tasks",
            confidence: 0.90,
            explanation: "Comprehensive task list extracted from brainstorming session"
          }
        ],
        actionItems: [
          "Organize digital photos across cloud services",
          "Create reading schedule for book pile",
          "Declutter garage before winter",
          "Prep meals for upcoming week",
          "Backup computer files to external drive",
          "Return library books (high priority - due soon)",
          "Schedule time to learn new design software"
        ],
        summary: "Weekend productivity brainstorm covering digital organization, physical decluttering, and skill development. Mix of urgent tasks (library books) and long-term improvements.",
        patterns: [
          "Multiple organizational projects across digital and physical spaces",
          "Mix of maintenance tasks and learning goals",
          "Some time-sensitive items requiring immediate attention"
        ],
        prioritization: {
          urgent: ["Return library books"],
          important: ["Backup computer files", "Organize digital photos"],
          whenTime: ["Learn design software", "Declutter garage"]
        }
      }
    },
    timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
    starred: false,
    archived: false,
    themes: ['productivity', 'organization', 'weekend-projects'],
    searchTerms: ['organize', 'photos', 'garage', 'meal prep', 'backup', 'library', 'books'],
    userActions: {
      calendarEvents: [
        { type: 'weekend project time', date: 'Saturday', status: 'planned' }
      ],
      sharedContent: [],
      completedTasks: [],
      followUpAnalyses: []
    },
    isDemo: true
  }
];