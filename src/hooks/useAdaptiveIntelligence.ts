import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface DetectedTopic {
  topic: string;
  confidence: number;
}

interface UserProfile {
  adaptationLevel: number;
  topInterests: string[];
  totalInsights: number;
}

interface SmartSources {
  communities: string[];
  websites: string[];
  contentFocus: string[];
  reasoning: string;
}

interface EngagementEvent {
  action: 'click_source' | 'copy_content' | 'share' | 'save';
  item: string;
  context: any;
  timestamp: string;
}

export const useAdaptiveIntelligence = () => {
  const { user } = useAuth();
  const [engagementHistory, setEngagementHistory] = useState<EngagementEvent[]>([]);

  // Track user engagement with content and sources
  const trackEngagement = useCallback((
    action: EngagementEvent['action'],
    item: string,
    context?: any
  ) => {
    if (!user) return;

    const engagement: EngagementEvent = {
      action,
      item,
      context,
      timestamp: new Date().toISOString()
    };

    // Store engagement data locally
    setEngagementHistory(prev => [...prev, engagement]);
    
    // Store in localStorage for persistence
    const storageKey = `scatterbrain_engagement_${user.id}`;
    const existingData = localStorage.getItem(storageKey);
    const history = existingData ? JSON.parse(existingData) : [];
    history.push(engagement);
    
    // Keep only last 100 events
    const trimmedHistory = history.slice(-100);
    localStorage.setItem(storageKey, JSON.stringify(trimmedHistory));

    console.log('Tracked engagement:', engagement);
  }, [user]);

  // Handle source clicks with engagement tracking
  const handleSourceClick = useCallback((
    source: string, 
    sourceType: 'community' | 'website',
    detectedTopics?: DetectedTopic[]
  ) => {
    trackEngagement('click_source', source, {
      sourceType,
      detectedTopics,
      timestamp: new Date().toISOString()
    });
  }, [trackEngagement]);

  // Handle content copy with engagement tracking
  const handleContentCopy = useCallback((
    content: string,
    contentType: string,
    detectedTopics?: DetectedTopic[]
  ) => {
    trackEngagement('copy_content', contentType, {
      detectedTopics,
      contentLength: content.length,
      timestamp: new Date().toISOString()
    });

    // Copy to clipboard
    navigator.clipboard.writeText(content).then(() => {
      console.log('Content copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy content:', err);
    });
  }, [trackEngagement]);

  // Get user's learning preferences based on engagement history
  const getLearningPreferences = useCallback(() => {
    if (!user) return null;

    const storageKey = `scatterbrain_engagement_${user.id}`;
    const existingData = localStorage.getItem(storageKey);
    const history: EngagementEvent[] = existingData ? JSON.parse(existingData) : [];

    // Analyze engagement patterns
    const sourceClicks = history.filter(e => e.action === 'click_source');
    const contentCopies = history.filter(e => e.action === 'copy_content');

    const preferredSources = sourceClicks.reduce((acc, event) => {
      const topic = event.context?.detectedTopics?.[0]?.topic || 'general';
      if (!acc[topic]) acc[topic] = { communities: [], websites: [] };
      
      if (event.context?.sourceType === 'community') {
        acc[topic].communities.push(event.item);
      } else if (event.context?.sourceType === 'website') {
        acc[topic].websites.push(event.item);
      }
      
      return acc;
    }, {} as Record<string, { communities: string[]; websites: string[] }>);

    return {
      preferredSources,
      totalEngagements: history.length,
      sourceClickCount: sourceClicks.length,
      contentCopyCount: contentCopies.length
    };
  }, [user]);

  // Calculate user's adaptation progress
  const calculateAdaptationProgress = useCallback((userProfile?: UserProfile) => {
    if (!userProfile) return { level: 0, stage: 'new', nextMilestone: 5 };

    const { totalInsights, adaptationLevel } = userProfile;

    let stage = 'new';
    let nextMilestone = 5;

    if (totalInsights >= 20) {
      stage = 'expert';
      nextMilestone = null;
    } else if (totalInsights >= 10) {
      stage = 'advanced';
      nextMilestone = 20;
    } else if (totalInsights >= 5) {
      stage = 'learning';
      nextMilestone = 10;
    }

    return {
      level: adaptationLevel,
      stage,
      nextMilestone,
      insightsToNext: nextMilestone ? nextMilestone - totalInsights : 0
    };
  }, []);

  return {
    trackEngagement,
    handleSourceClick,
    handleContentCopy,
    getLearningPreferences,
    calculateAdaptationProgress,
    engagementHistory
  };
};
