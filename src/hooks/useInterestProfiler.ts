import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useThoughts } from '@/hooks/api/useThoughts';

// Interest categories and their keyword patterns
const INTEREST_PATTERNS = {
  technology: {
    keywords: ['api', 'code', 'programming', 'software', 'ai', 'ml', 'javascript', 'react', 'node', 'database', 'cloud', 'aws', 'docker', 'kubernetes', 'saas', 'startup', 'tech', 'development', 'frontend', 'backend', 'mobile', 'web', 'app'],
    forums: ['r/programming', 'r/webdev', 'r/javascript', 'r/MachineLearning', 'Hacker News', 'Stack Overflow'],
    contentFormats: ['technical_blog', 'tutorial', 'github_readme', 'dev_twitter'],
    platforms: ['dev.to', 'medium', 'twitter', 'linkedin', 'github']
  },
  gaming: {
    keywords: ['game', 'gaming', 'esports', 'twitch', 'stream', 'pokemon', 'nintendo', 'ps5', 'xbox', 'pc', 'mobile gaming', 'indie', 'mmorpg', 'fps', 'rpg', 'strategy'],
    forums: ['r/gaming', 'r/GameDev', 'r/pcgaming', 'r/nintendo', 'r/pokemon'],
    contentFormats: ['review', 'guide', 'stream_highlight', 'tiktok_reaction'],
    platforms: ['youtube', 'twitch', 'tiktok', 'reddit', 'discord']
  },
  music: {
    keywords: ['music', 'song', 'album', 'artist', 'band', 'guitar', 'piano', 'drums', 'vocals', 'recording', 'studio', 'mix', 'master', 'bluegrass', 'jazz', 'rock', 'pop', 'hip hop', 'electronic'],
    forums: ['r/WeAreTheMusicMakers', 'r/edmproduction', 'r/Guitar', 'r/piano'],
    contentFormats: ['song_analysis', 'playlist_curation', 'artist_spotlight', 'tutorial'],
    platforms: ['youtube', 'spotify', 'instagram', 'soundcloud', 'bandcamp']
  },
  business: {
    keywords: ['business', 'startup', 'entrepreneur', 'marketing', 'sales', 'revenue', 'profit', 'strategy', 'growth', 'funding', 'investor', 'product', 'market', 'customer', 'b2b', 'b2c', 'saas', 'freelance'],
    forums: ['r/entrepreneur', 'r/startups', 'IndieHackers', 'Product Hunt'],
    contentFormats: ['case_study', 'thought_leadership', 'industry_analysis', 'how_to'],
    platforms: ['linkedin', 'medium', 'company_blog', 'twitter']
  },
  creative: {
    keywords: ['art', 'design', 'creative', 'illustration', 'photography', 'video', 'animation', 'drawing', 'painting', 'sculpture', 'digital art', 'graphic design', 'ui', 'ux', 'brand'],
    forums: ['r/art', 'r/Design', 'r/photography', 'r/graphic_design'],
    contentFormats: ['portfolio_piece', 'design_breakdown', 'creative_process', 'inspiration'],
    platforms: ['behance', 'dribbble', 'instagram', 'artstation']
  },
  fitness: {
    keywords: ['fitness', 'workout', 'gym', 'exercise', 'health', 'nutrition', 'diet', 'training', 'cardio', 'strength', 'yoga', 'running', 'cycling', 'bodybuilding', 'crossfit'],
    forums: ['r/fitness', 'r/bodybuilding', 'r/running', 'r/yoga'],
    contentFormats: ['workout_plan', 'progress_update', 'fitness_tip', 'nutrition_guide'],
    platforms: ['instagram', 'youtube', 'tiktok', 'strava']
  },
  lifestyle: {
    keywords: ['life', 'personal', 'mindfulness', 'productivity', 'goals', 'habits', 'wellness', 'travel', 'food', 'cooking', 'family', 'relationships', 'self improvement'],
    forums: ['r/getmotivated', 'r/productivity', 'r/selfimprovement', 'r/cooking'],
    contentFormats: ['personal_story', 'life_tip', 'reflection', 'advice'],
    platforms: ['instagram', 'medium', 'tiktok', 'pinterest']
  }
};

interface InterestScore {
  category: string;
  score: number;
  keywords: string[];
  recentMentions: number;
  totalMentions: number;
  lastSeen: string;
}

interface UserInterestProfile {
  primaryInterests: InterestScore[];
  expertiseLevel: {[key: string]: 'beginner' | 'intermediate' | 'expert'};
  contentPreferences: {
    formats: string[];
    platforms: string[];
    tone: 'casual' | 'professional' | 'enthusiastic' | 'analytical';
  };
  recommendedSources: {
    forums: string[];
    platforms: string[];
    keywords: string[];
  };
  lastUpdated: string;
  thoughtCount: number;
}

const defaultProfile: UserInterestProfile = {
  primaryInterests: [],
  expertiseLevel: {},
  contentPreferences: {
    formats: [],
    platforms: [],
    tone: 'casual'
  },
  recommendedSources: {
    forums: [],
    platforms: [],
    keywords: []
  },
  lastUpdated: new Date().toISOString(),
  thoughtCount: 0
};

export const useInterestProfiler = () => {
  const { user } = useAuth();
  const { data: thoughts } = useThoughts();
  const [profile, setProfile] = useState<UserInterestProfile>(defaultProfile);
  const [isBuilding, setIsBuilding] = useState(false);

  // Load profile from localStorage
  useEffect(() => {
    if (!user) return;
    
    const stored = localStorage.getItem(`interest_profile_${user.id}`);
    if (stored) {
      try {
        const parsedProfile = JSON.parse(stored);
        setProfile(parsedProfile);
      } catch (error) {
        console.error('Failed to parse interest profile:', error);
      }
    }
  }, [user]);

  // Extract keywords from text
  const extractKeywords = useCallback((text: string): {[category: string]: string[]} => {
    const normalizedText = text.toLowerCase();
    const extractedKeywords: {[category: string]: string[]} = {};

    Object.entries(INTEREST_PATTERNS).forEach(([category, pattern]) => {
      const foundKeywords = pattern.keywords.filter(keyword => 
        normalizedText.includes(keyword.toLowerCase())
      );
      if (foundKeywords.length > 0) {
        extractedKeywords[category] = foundKeywords;
      }
    });

    return extractedKeywords;
  }, []);

  // Assess expertise level based on keyword sophistication and context
  const assessExpertiseLevel = useCallback((text: string, category: string): 'beginner' | 'intermediate' | 'expert' => {
    const normalizedText = text.toLowerCase();
    
    // Expert indicators
    const expertTerms = {
      technology: ['architecture', 'scalability', 'optimization', 'microservices', 'devops', 'ci/cd'],
      gaming: ['meta', 'competitive', 'esports', 'tournament', 'professional'],
      music: ['mastering', 'production', 'mixing', 'recording', 'studio'],
      business: ['metrics', 'kpis', 'conversion', 'retention', 'churn', 'valuation'],
      creative: ['portfolio', 'client', 'brief', 'campaign', 'brand guidelines'],
      fitness: ['macros', 'periodization', 'progressive overload', 'biomechanics']
    };

    const categoryExpertTerms = expertTerms[category as keyof typeof expertTerms] || [];
    const expertMatches = categoryExpertTerms.filter(term => normalizedText.includes(term)).length;
    
    if (expertMatches >= 2) return 'expert';
    if (text.length > 200 && expertMatches >= 1) return 'intermediate';
    return 'beginner';
  }, []);

  // Determine content tone from text
  const determineTone = useCallback((text: string): 'casual' | 'professional' | 'enthusiastic' | 'analytical' => {
    const casual = ['lol', 'tbh', 'omg', 'cool', 'awesome', 'fun'];
    const professional = ['strategy', 'implement', 'analyze', 'optimize', 'leverage', 'execute'];
    const enthusiastic = ['amazing', 'incredible', 'love', 'passion', 'excited', 'fantastic'];
    const analytical = ['data', 'metrics', 'analysis', 'research', 'study', 'evidence'];

    const normalizedText = text.toLowerCase();
    
    const casualScore = casual.filter(word => normalizedText.includes(word)).length;
    const professionalScore = professional.filter(word => normalizedText.includes(word)).length;
    const enthusiasticScore = enthusiastic.filter(word => normalizedText.includes(word)).length;
    const analyticalScore = analytical.filter(word => normalizedText.includes(word)).length;

    const scores = { casual: casualScore, professional: professionalScore, enthusiastic: enthusiasticScore, analytical: analyticalScore };
    return Object.entries(scores).sort(([,a], [,b]) => b - a)[0][0] as 'casual' | 'professional' | 'enthusiastic' | 'analytical';
  }, []);

  // Build interest profile from thoughts
  const buildProfile = useCallback(async () => {
    if (!thoughts || thoughts.length === 0) return;

    setIsBuilding(true);
    
    try {
      const interestScores: {[category: string]: InterestScore} = {};
      const expertiseLevels: {[category: string]: 'beginner' | 'intermediate' | 'expert'} = {};
      const allFormats: string[] = [];
      const allPlatforms: string[] = [];
      const tones: string[] = [];

      // Analyze each thought
      thoughts.forEach(thought => {
        const thoughtText = `${thought.title || ''} ${thought.content}`;
        const extractedKeywords = extractKeywords(thoughtText);
        const thoughtTone = determineTone(thoughtText);
        tones.push(thoughtTone);

        Object.entries(extractedKeywords).forEach(([category, keywords]) => {
          if (!interestScores[category]) {
            interestScores[category] = {
              category,
              score: 0,
              keywords: [],
              recentMentions: 0,
              totalMentions: 0,
              lastSeen: thought.created_at
            };
          }

          // Calculate score based on keyword frequency and recency
          const keywordScore = keywords.length;
          const recencyScore = new Date(thought.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 2 : 1;
          
          interestScores[category].score += keywordScore * recencyScore;
          interestScores[category].totalMentions += 1;
          interestScores[category].keywords = [...new Set([...interestScores[category].keywords, ...keywords])];
          
          if (recencyScore === 2) {
            interestScores[category].recentMentions += 1;
          }

          // Update last seen
          if (new Date(thought.created_at) > new Date(interestScores[category].lastSeen)) {
            interestScores[category].lastSeen = thought.created_at;
          }

          // Assess expertise
          const currentLevel = expertiseLevels[category] || 'beginner';
          const thoughtLevel = assessExpertiseLevel(thoughtText, category);
          
          if (thoughtLevel === 'expert' || (thoughtLevel === 'intermediate' && currentLevel === 'beginner')) {
            expertiseLevels[category] = thoughtLevel;
          }

          // Add category formats and platforms
          const pattern = INTEREST_PATTERNS[category as keyof typeof INTEREST_PATTERNS];
          if (pattern) {
            allFormats.push(...pattern.contentFormats);
            allPlatforms.push(...pattern.platforms);
          }
        });
      });

      // Sort interests by score
      const sortedInterests = Object.values(interestScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Top 5 interests

      // Determine most common tone
      const toneFrequency = tones.reduce((acc, tone) => {
        acc[tone] = (acc[tone] || 0) + 1;
        return acc;
      }, {} as {[key: string]: number});
      
      const dominantTone = Object.entries(toneFrequency).sort(([,a], [,b]) => b - a)[0]?.[0] as 'casual' | 'professional' | 'enthusiastic' | 'analytical' || 'casual';

      // Generate recommended sources
      const recommendedForums: string[] = [];
      const recommendedPlatforms: string[] = [];
      const recommendedKeywords: string[] = [];

      sortedInterests.forEach(interest => {
        const pattern = INTEREST_PATTERNS[interest.category as keyof typeof INTEREST_PATTERNS];
        if (pattern) {
          recommendedForums.push(...pattern.forums);
          recommendedPlatforms.push(...pattern.platforms);
          recommendedKeywords.push(...interest.keywords);
        }
      });

      const newProfile: UserInterestProfile = {
        primaryInterests: sortedInterests,
        expertiseLevel: expertiseLevels,
        contentPreferences: {
          formats: [...new Set(allFormats)].slice(0, 8),
          platforms: [...new Set(allPlatforms)].slice(0, 6),
          tone: dominantTone
        },
        recommendedSources: {
          forums: [...new Set(recommendedForums)].slice(0, 10),
          platforms: [...new Set(recommendedPlatforms)].slice(0, 6),
          keywords: [...new Set(recommendedKeywords)].slice(0, 20)
        },
        lastUpdated: new Date().toISOString(),
        thoughtCount: thoughts.length
      };

      setProfile(newProfile);
      
      // Save to localStorage
      if (user) {
        localStorage.setItem(`interest_profile_${user.id}`, JSON.stringify(newProfile));
      }

    } catch (error) {
      console.error('Error building interest profile:', error);
    } finally {
      setIsBuilding(false);
    }
  }, [thoughts, user, extractKeywords, assessExpertiseLevel, determineTone]);

  // Auto-rebuild profile when new thoughts are added
  useEffect(() => {
    if (thoughts && thoughts.length > profile.thoughtCount) {
      buildProfile();
    }
  }, [thoughts, profile.thoughtCount, buildProfile]);

  // Get adaptive sources for research
  const getAdaptiveSources = useCallback((topic?: string) => {
    if (!profile.primaryInterests.length) {
      // Return default sources if no profile yet
      return {
        reddit: ['r/all', 'r/todayilearned'],
        forums: ['Hacker News', 'Reddit'],
        keywords: topic ? [topic] : ['trending', 'popular']
      };
    }

    const relevantInterests = topic 
      ? profile.primaryInterests.filter(interest => 
          topic.toLowerCase().includes(interest.category) || 
          interest.keywords.some(keyword => topic.toLowerCase().includes(keyword.toLowerCase()))
        )
      : profile.primaryInterests.slice(0, 3);

    if (relevantInterests.length === 0) {
      relevantInterests.push(profile.primaryInterests[0]); // Fallback to top interest
    }

    const adaptiveSources = {
      reddit: [] as string[],
      forums: [] as string[],
      keywords: [] as string[]
    };

    relevantInterests.forEach(interest => {
      const pattern = INTEREST_PATTERNS[interest.category as keyof typeof INTEREST_PATTERNS];
      if (pattern) {
        // Get Reddit communities from forums list
        const redditSources = pattern.forums.filter(forum => forum.startsWith('r/'));
        adaptiveSources.reddit.push(...redditSources);
        
        // Get other forums
        const otherForums = pattern.forums.filter(forum => !forum.startsWith('r/'));
        adaptiveSources.forums.push(...otherForums);
        
        // Add interest keywords
        adaptiveSources.keywords.push(...interest.keywords.slice(0, 5));
      }
    });

    // Add topic-specific keywords if provided
    if (topic) {
      adaptiveSources.keywords.unshift(topic);
    }

    return {
      reddit: [...new Set(adaptiveSources.reddit)].slice(0, 8),
      forums: [...new Set(adaptiveSources.forums)].slice(0, 6),
      keywords: [...new Set(adaptiveSources.keywords)].slice(0, 15)
    };
  }, [profile]);

  // Get personalized content suggestions
  const getPersonalizedContentFormats = useCallback(() => {
    if (!profile.primaryInterests.length) {
      return ['blog_post', 'social_media_post', 'quick_note'];
    }

    return profile.contentPreferences.formats.slice(0, 6);
  }, [profile]);

  return {
    profile,
    isBuilding,
    buildProfile,
    getAdaptiveSources,
    getPersonalizedContentFormats,
    hasProfile: profile.primaryInterests.length > 0,
    topInterest: profile.primaryInterests[0]?.category,
    profileStrength: profile.primaryInterests.reduce((sum, interest) => sum + interest.score, 0)
  };
};