import { useState, useEffect, useCallback } from 'react';

interface UserPatterns {
  preferredInput: 'text' | 'voice';
  activeHours: number[];
  actionPreferences: {
    calendar: number;
    social: number;
    todos: number;
  };
  insightStyle: 'brief' | 'detailed' | 'creative';
  lastSeen: number;
  sessionCount: number;
  socialPlatformUsage: {
    twitter: number;
    linkedin: number;
    instagram: number;
  };
  averageThoughtLength: number;
  commonThemes: string[];
}

const defaultPatterns: UserPatterns = {
  preferredInput: 'text',
  activeHours: [],
  actionPreferences: {
    calendar: 0.5,
    social: 0.5,
    todos: 0.5
  },
  insightStyle: 'detailed',
  lastSeen: Date.now(),
  sessionCount: 0,
  socialPlatformUsage: {
    twitter: 0,
    linkedin: 0,
    instagram: 0
  },
  averageThoughtLength: 0,
  commonThemes: []
};

export const usePersonalization = () => {
  const [userPatterns, setUserPatterns] = useState<UserPatterns>(defaultPatterns);
  const [isReturningUser, setIsReturningUser] = useState(false);

  // Load patterns from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('scatterbrain_patterns');
    if (stored) {
      try {
        const patterns = JSON.parse(stored);
        setUserPatterns(patterns);
        setIsReturningUser(patterns.sessionCount > 0);
      } catch (error) {
        console.error('Failed to parse user patterns:', error);
      }
    }
  }, []);

  // Save patterns to localStorage
  const savePatterns = useCallback((newPatterns: Partial<UserPatterns>) => {
    setUserPatterns(current => {
      const updated = { ...current, ...newPatterns };
      localStorage.setItem('scatterbrain_patterns', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Track session start
  const trackSessionStart = useCallback(() => {
    const now = Date.now();
    const currentHour = new Date().getHours();
    
    setUserPatterns(current => {
      const updated = {
        ...current,
        sessionCount: current.sessionCount + 1,
        lastSeen: now,
        activeHours: [...new Set([...current.activeHours, currentHour])].slice(-10)
      };
      localStorage.setItem('scatterbrain_patterns', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Track input method preference
  const trackInputMethod = useCallback((method: 'text' | 'voice') => {
    savePatterns({ preferredInput: method });
  }, [savePatterns]);

  // Track thought length for personalization
  const trackThoughtLength = useCallback((length: number) => {
    setUserPatterns(current => {
      const newAvg = current.sessionCount > 0 ? (current.averageThoughtLength + length) / 2 : length;
      const updated = { ...current, averageThoughtLength: newAvg };
      localStorage.setItem('scatterbrain_patterns', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Track action preferences
  const trackActionUsage = useCallback((action: 'calendar' | 'social' | 'todos') => {
    setUserPatterns(current => {
      const updatedValue = Math.min(current.actionPreferences[action] + 0.1, 1);
      const updated = {
        ...current,
        actionPreferences: {
          ...current.actionPreferences,
          [action]: updatedValue
        }
      };
      localStorage.setItem('scatterbrain_patterns', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Track social platform usage
  const trackSocialCopy = useCallback((platform: 'twitter' | 'linkedin' | 'instagram') => {
    setUserPatterns(current => {
      const updatedUsage = Math.min(current.socialPlatformUsage[platform] + 1, 10);
      const socialPreference = Math.min(current.actionPreferences.social + 0.1, 1);
      
      const updated = {
        ...current,
        socialPlatformUsage: {
          ...current.socialPlatformUsage,
          [platform]: updatedUsage
        },
        actionPreferences: {
          ...current.actionPreferences,
          social: socialPreference
        }
      };
      localStorage.setItem('scatterbrain_patterns', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get time-based context
  const getTimeContext = useCallback(() => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
      return {
        period: 'morning',
        energy: 'planning',
        suggestion: 'Great morning energy for organizing your thoughts!'
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        period: 'afternoon',
        energy: 'creative',
        suggestion: 'Perfect time for creative brainstorming!'
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        period: 'evening',
        energy: 'reflection',
        suggestion: 'Ideal time to reflect and plan ahead!'
      };
    } else {
      return {
        period: 'night',
        energy: 'focus',
        suggestion: 'Late night clarity session!'
      };
    }
  }, []);

  // Get personalized placeholder text
  const getPersonalizedPlaceholder = useCallback(() => {
    const timeContext = getTimeContext();
    const isFrequentUser = userPatterns.sessionCount > 5;
    const avgLength = userPatterns.averageThoughtLength;
    
    const basePlaceholders = {
      morning: [
        "What's on your mind this morning? Daily goals, random thoughts, creative sparks...",
        "Morning brain dump time! What needs organizing today?",
        "Fresh morning thoughts ready to become clear action plans..."
      ],
      afternoon: [
        "Afternoon creativity session! What ideas are brewing?",
        "Midday mind maze? Let's sort through those swirling thoughts...",
        "Creative energy flowing? Dump all those brilliant ideas here..."
      ],
      evening: [
        "Evening reflection time. What thoughts need organizing?",
        "End-of-day brain dump. What insights emerged today?",
        "Evening wind-down... what's swimming around in your head?"
      ],
      night: [
        "Late night thoughts often hold the best insights...",
        "Night owl session? Let's organize those deep thoughts...",
        "When the world is quiet, the best ideas emerge..."
      ]
    };

    const periodPlaceholders = basePlaceholders[timeContext.period as keyof typeof basePlaceholders];
    let placeholder = periodPlaceholders[Math.floor(Math.random() * periodPlaceholders.length)];

    // Add length hints for frequent users
    if (isFrequentUser && avgLength > 0) {
      if (avgLength < 100) {
        placeholder += " (Feel free to elaborate more - longer thoughts often yield richer insights!)";
      } else if (avgLength > 500) {
        placeholder += " (Even a few key points work great!)";
      }
    }

    return placeholder;
  }, [userPatterns, getTimeContext]);

  // Get processing time estimate based on patterns
  const getEstimatedProcessingTime = useCallback((inputLength: number) => {
    const baseTime = 3000; // 3 seconds base
    const lengthFactor = Math.max(inputLength / 200, 0.5); // Scale with length
    const experienceFactor = Math.max(1 - (userPatterns.sessionCount * 0.1), 0.7); // Faster for experienced users
    
    return Math.round(baseTime * lengthFactor * experienceFactor);
  }, [userPatterns]);

  // Get prioritized social platforms
  const getPrioritizedSocialPlatforms = useCallback(() => {
    const usage = userPatterns.socialPlatformUsage;
    const platforms = [
      { name: 'twitter', usage: usage.twitter, icon: 'Twitter' },
      { name: 'linkedin', usage: usage.linkedin, icon: 'Linkedin' },
      { name: 'instagram', usage: usage.instagram, icon: 'Instagram' }
    ];
    
    return platforms.sort((a, b) => b.usage - a.usage);
  }, [userPatterns]);

  // Check if user is likely to use a feature
  const isLikelyToUse = useCallback((feature: 'calendar' | 'social' | 'todos') => {
    return userPatterns.actionPreferences[feature] > 0.6;
  }, [userPatterns]);

  return {
    userPatterns,
    isReturningUser,
    trackSessionStart,
    trackInputMethod,
    trackThoughtLength,
    trackActionUsage,
    trackSocialCopy,
    getTimeContext,
    getPersonalizedPlaceholder,
    getEstimatedProcessingTime,
    getPrioritizedSocialPlatforms,
    isLikelyToUse,
    savePatterns
  };
};