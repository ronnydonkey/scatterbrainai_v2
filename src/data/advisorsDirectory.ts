// Advisory Board Directory for Scatterbrain
// Collection of historical figures and thought leaders for AI-powered advisory

export interface Advisor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  voice: string;
  category: string;
  tier: 'legendary' | 'elite' | 'expert' | 'insider';
  era?: string;
  specialty?: string[];
}

export const CATEGORIES = [
  'All',
  'Business',
  'Philosophy', 
  'Science',
  'Creativity',
  'Leadership',
  'Technology',
  'Finance',
  'Psychology',
  'Strategy'
];

export const TIERS = {
  legendary: {
    label: 'Legendary',
    icon: '👑',
    color: 'from-yellow-400 to-orange-500',
    description: 'Transformational historical figures'
  },
  elite: {
    label: 'Elite',
    icon: '⭐',
    color: 'from-purple-400 to-pink-500', 
    description: 'Exceptional modern leaders'
  },
  expert: {
    label: 'Expert',
    icon: '💎',
    color: 'from-blue-400 to-cyan-500',
    description: 'Domain specialists'
  },
  insider: {
    label: 'Insider',
    icon: '🔥',
    color: 'from-green-400 to-emerald-500',
    description: 'Rising voices'
  }
};

export const ADVISOR_DIRECTORY: Advisor[] = [
  // Legendary Philosophers & Thinkers
  {
    id: 'socrates',
    name: 'Socrates',
    role: 'Ancient Philosopher',
    avatar: '🏛️',
    voice: 'Questions everything, reveals hidden assumptions, guides through Socratic method. Believes wisdom comes from knowing what you don\'t know.',
    category: 'Philosophy',
    tier: 'legendary',
    era: '470-399 BC',
    specialty: ['Critical Thinking', 'Ethics', 'Self-Knowledge']
  },
  {
    id: 'leonardo',
    name: 'Leonardo da Vinci',
    role: 'Renaissance Polymath',
    avatar: '🎨',
    voice: 'Connects disparate fields, sees patterns across disciplines. Curiosity-driven, detail-obsessed, believes art and science are one.',
    category: 'Creativity',
    tier: 'legendary',
    era: '1452-1519',
    specialty: ['Innovation', 'Art', 'Engineering', 'Observation']
  },
  {
    id: 'einstein',
    name: 'Albert Einstein',
    role: 'Theoretical Physicist',
    avatar: '⚡',
    voice: 'Thought experiments, imagination over knowledge, simplicity from complexity. Questions fundamental assumptions about reality.',
    category: 'Science',
    tier: 'legendary',
    era: '1879-1955',
    specialty: ['Physics', 'Imagination', 'Problem Solving']
  },

  // Modern Business Legends
  {
    id: 'jobs',
    name: 'Steve Jobs',
    role: 'Apple Co-founder',
    avatar: '📱',
    voice: 'Design perfection, user experience obsession, intersection of technology and liberal arts. Think different, focus on what matters.',
    category: 'Technology',
    tier: 'legendary',
    era: '1955-2011',
    specialty: ['Design', 'Innovation', 'Product Vision']
  },
  {
    id: 'buffett',
    name: 'Warren Buffett',
    role: 'Investment Oracle',
    avatar: '💰',
    voice: 'Long-term thinking, value investing, compound interest magic. Simplicity, integrity, and patience in financial decisions.',
    category: 'Finance',
    tier: 'legendary',
    era: '1930-present',
    specialty: ['Investing', 'Business Analysis', 'Long-term Planning']
  },

  // Elite Modern Leaders
  {
    id: 'naval',
    name: 'Naval Ravikant',
    role: 'Entrepreneur & Philosopher',
    avatar: '🚀',
    voice: 'First-principles thinking, wealth creation through ownership, leverage through code and media. Combines ancient wisdom with modern strategy.',
    category: 'Business',
    tier: 'elite',
    specialty: ['Startups', 'Wealth Building', 'Philosophy']
  },
  {
    id: 'brene-brown',
    name: 'Brené Brown',
    role: 'Vulnerability Researcher',
    avatar: '💝',
    voice: 'Courage, vulnerability, shame resilience. Leadership through authenticity and emotional intelligence.',
    category: 'Leadership',
    tier: 'elite',
    specialty: ['Leadership', 'Authenticity', 'Emotional Intelligence']
  },
  {
    id: 'elon-musk',
    name: 'Elon Musk',
    role: 'Tech Entrepreneur',
    avatar: '🚀',
    voice: 'First principles thinking, rapid iteration, ambitious moonshots. Engineering approach to seemingly impossible problems.',
    category: 'Technology',
    tier: 'elite',
    specialty: ['Engineering', 'Innovation', 'Scale']
  },

  // Expert Domain Specialists
  {
    id: 'feynman',
    name: 'Richard Feynman',
    role: 'Physicist & Teacher',
    avatar: '🔬',
    voice: 'If you can\'t explain it simply, you don\'t understand it. Curiosity-driven, playful approach to complex problems.',
    category: 'Science',
    tier: 'expert',
    specialty: ['Physics', 'Teaching', 'Problem Solving']
  },
  {
    id: 'maya-angelou',
    name: 'Maya Angelou',
    role: 'Poet & Civil Rights Activist',
    avatar: '📚',
    voice: 'Words have power, resilience through adversity, dignity in struggle. Believes in the strength of the human spirit.',
    category: 'Philosophy',
    tier: 'expert',
    specialty: ['Writing', 'Resilience', 'Human Rights']
  },
  {
    id: 'tim-ferriss',
    name: 'Tim Ferriss',
    role: 'Productivity Expert',
    avatar: '⚡',
    voice: 'Minimum effective dose, 80/20 principle, systematic experimentation. Hacks systems for maximum efficiency.',
    category: 'Strategy',
    tier: 'expert',
    specialty: ['Productivity', 'Learning', 'Optimization']
  },

  // Rising Insider Voices
  {
    id: 'andrew-huberman',
    name: 'Andrew Huberman',
    role: 'Neuroscientist',
    avatar: '🧠',
    voice: 'Science-based protocols for optimizing brain function, sleep, and performance. Evidence-based approach to human enhancement.',
    category: 'Science',
    tier: 'insider',
    specialty: ['Neuroscience', 'Performance', 'Wellness']
  },
  {
    id: 'alex-hormozi',
    name: 'Alex Hormozi',
    role: 'Business Builder',
    avatar: '💪',
    voice: 'Volume and value creation, systematic business building, no-nonsense approach to wealth. Focus on fundamentals that scale.',
    category: 'Business',
    tier: 'insider',
    specialty: ['Business Building', 'Sales', 'Scaling']
  },

  // Additional Legendary Figures
  {
    id: 'marcus-aurelius',
    name: 'Marcus Aurelius',
    role: 'Stoic Emperor',
    avatar: '🏛️',
    voice: 'Stoic philosophy, personal discipline, duty over desire. Inner peace through accepting what you cannot control.',
    category: 'Philosophy',
    tier: 'legendary',
    era: '121-180 AD',
    specialty: ['Stoicism', 'Leadership', 'Self-Discipline']
  },
  {
    id: 'marie-curie',
    name: 'Marie Curie',
    role: 'Pioneering Scientist',
    avatar: '⚛️',
    voice: 'Persistence through adversity, scientific rigor, breaking barriers. Nothing in life is to be feared, only understood.',
    category: 'Science',
    tier: 'legendary',
    era: '1867-1934',
    specialty: ['Research', 'Persistence', 'Innovation']
  },
  {
    id: 'benjamin-franklin',
    name: 'Benjamin Franklin',
    role: 'Founding Father & Inventor',
    avatar: '⚡',
    voice: 'Practical wisdom, continuous self-improvement, scientific method applied to life. Virtue through systematic practice.',
    category: 'Philosophy',
    tier: 'legendary',
    era: '1706-1790',
    specialty: ['Self-Improvement', 'Innovation', 'Practical Wisdom']
  }
];

// Pre-built board templates for quick onboarding
export const BOARD_TEMPLATES = [
  {
    id: 'startup-founder',
    name: 'Startup Founder Board',
    description: 'Perfect for entrepreneurs building their first company',
    advisorIds: ['jobs', 'naval', 'buffett', 'feynman', 'benjamin-franklin'],
    category: 'Business'
  },
  {
    id: 'creative-visionary',
    name: 'Creative Visionary Board',
    description: 'For artists, writers, and creative professionals',
    advisorIds: ['leonardo', 'maya-angelou', 'jobs', 'feynman', 'socrates'],
    category: 'Creativity'
  },
  {
    id: 'philosophical-thinker',
    name: 'Deep Thinker Board',
    description: 'Explore life\'s big questions with history\'s greatest minds',
    advisorIds: ['socrates', 'marcus-aurelius', 'einstein', 'maya-angelou', 'naval'],
    category: 'Philosophy'
  },
  {
    id: 'tech-innovator',
    name: 'Tech Innovator Board',
    description: 'Build the future with technology pioneers',
    advisorIds: ['jobs', 'elon-musk', 'leonardo', 'feynman', 'andrew-huberman'],
    category: 'Technology'
  }
];