import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface StoredInsight {
  id: string;
  input: string;
  response: any;
  timestamp: number;
  starred: boolean;
  archived: boolean;
  themes: string[];
  searchTerms: string[];
  userActions: {
    calendarEvents: any[];
    sharedContent: any[];
    completedTasks: any[];
    followUpAnalyses: any[];
  };
}

class InsightDatabase {
  private dbName = 'ScatterbrainInsights';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('insights')) {
          const store = db.createObjectStore('insights', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('themes', 'themes', { unique: false, multiEntry: true });
          store.createIndex('starred', 'starred', { unique: false });
          store.createIndex('archived', 'archived', { unique: false });
        }
      };
    });
  }

  async saveInsight(insight: StoredInsight): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['insights'], 'readwrite');
      const store = transaction.objectStore('insights');
      const request = store.put(insight);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getInsights(filters?: {
    starred?: boolean;
    archived?: boolean;
    themes?: string[];
    dateRange?: { start: number; end: number };
    limit?: number;
  }): Promise<StoredInsight[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['insights'], 'readonly');
      const store = transaction.objectStore('insights');
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let insights = request.result as StoredInsight[];
        
        // Apply filters
        if (filters) {
          if (filters.starred !== undefined) {
            insights = insights.filter(i => i.starred === filters.starred);
          }
          if (filters.archived !== undefined) {
            insights = insights.filter(i => i.archived === filters.archived);
          }
          if (filters.themes?.length) {
            insights = insights.filter(i => 
              filters.themes!.some(theme => i.themes.includes(theme))
            );
          }
          if (filters.dateRange) {
            insights = insights.filter(i => 
              i.timestamp >= filters.dateRange!.start && 
              i.timestamp <= filters.dateRange!.end
            );
          }
        }
        
        // Sort by timestamp (newest first)
        insights.sort((a, b) => b.timestamp - a.timestamp);
        
        // Apply limit
        if (filters?.limit) {
          insights = insights.slice(0, filters.limit);
        }
        
        resolve(insights);
      };
    });
  }

  async searchInsights(query: string): Promise<StoredInsight[]> {
    const insights = await this.getInsights();
    const lowerQuery = query.toLowerCase();
    
    return insights.filter(insight => 
      insight.input.toLowerCase().includes(lowerQuery) ||
      insight.searchTerms.some(term => term.toLowerCase().includes(lowerQuery)) ||
      insight.themes.some(theme => theme.toLowerCase().includes(lowerQuery))
    );
  }

  async deleteInsight(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['insights'], 'readwrite');
      const store = transaction.objectStore('insights');
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateInsight(id: string, updates: Partial<StoredInsight>): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['insights'], 'readwrite');
      const store = transaction.objectStore('insights');
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const insight = getRequest.result;
        if (!insight) {
          reject(new Error('Insight not found'));
          return;
        }
        
        const updated = { ...insight, ...updates };
        const putRequest = store.put(updated);
        
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}

const insightDB = new InsightDatabase();

export const useOfflineInsights = () => {
  const [insights, setInsights] = useState<StoredInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize database on mount
  useEffect(() => {
    insightDB.init().catch(console.error);
  }, []);

  const saveInsight = useCallback(async (
    input: string,
    response: any,
    themes: string[] = []
  ): Promise<string> => {
    const id = `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const insight: StoredInsight = {
      id,
      input,
      response,
      timestamp: Date.now(),
      starred: false,
      archived: false,
      themes,
      searchTerms: generateSearchTerms(input, response),
      userActions: {
        calendarEvents: [],
        sharedContent: [],
        completedTasks: [],
        followUpAnalyses: []
      }
    };

    try {
      await insightDB.saveInsight(insight);
      setInsights(prev => [insight, ...prev]);
      
      // Auto-download PDF after saving
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
          body: {
            insightId: id,
            reportData: response,
            originalInput: input,
            timestamp: Date.now()
          }
        });

        if (!error && data) {
          const fileName = data.filename || `Scatterbrain-Insight-${new Date().toISOString().slice(0,10)}.txt`;
          
          const reportBlob = new Blob([new Uint8Array(data.pdfBuffer)], { type: data.contentType });
          const url = URL.createObjectURL(reportBlob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          URL.revokeObjectURL(url);
        }
      } catch (pdfError) {
        console.error('PDF auto-download failed:', pdfError);
        // Don't show error to user as the main save was successful
      }
      
      toast({
        title: "Insight saved! 💾",
        description: "Added to your personal gallery and PDF downloaded.",
      });
      
      return id;
    } catch (error) {
      console.error('Failed to save insight:', error);
      toast({
        title: "Failed to save insight",
        description: "Your browser storage might be full.",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const loadInsights = useCallback(async (filters?: Parameters<typeof insightDB.getInsights>[0]) => {
    setIsLoading(true);
    try {
      const loadedInsights = await insightDB.getInsights(filters);
      setInsights(loadedInsights);
    } catch (error) {
      console.error('Failed to load insights:', error);
      toast({
        title: "Failed to load insights",
        description: "There was an error accessing your insight gallery.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchInsights = useCallback(async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    
    try {
      const results = query.trim() 
        ? await insightDB.searchInsights(query)
        : await insightDB.getInsights();
      setInsights(results);
    } catch (error) {
      console.error('Failed to search insights:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleStar = useCallback(async (id: string) => {
    const insight = insights.find(i => i.id === id);
    if (!insight) return;

    try {
      await insightDB.updateInsight(id, { starred: !insight.starred });
      setInsights(prev => prev.map(i => 
        i.id === id ? { ...i, starred: !i.starred } : i
      ));
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  }, [insights]);

  const archiveInsight = useCallback(async (id: string) => {
    try {
      await insightDB.updateInsight(id, { archived: true });
      setInsights(prev => prev.filter(i => i.id !== id));
      
      toast({
        title: "Insight archived",
        description: "Moved to your archive.",
      });
    } catch (error) {
      console.error('Failed to archive insight:', error);
    }
  }, []);

  const deleteInsight = useCallback(async (id: string) => {
    try {
      await insightDB.deleteInsight(id);
      setInsights(prev => prev.filter(i => i.id !== id));
      
      toast({
        title: "Insight deleted",
        description: "Permanently removed from your gallery.",
      });
    } catch (error) {
      console.error('Failed to delete insight:', error);
    }
  }, []);

  const trackAction = useCallback(async (
    insightId: string,
    actionType: 'calendar' | 'social' | 'task' | 'followup',
    actionData: any
  ) => {
    const insight = insights.find(i => i.id === insightId);
    if (!insight) return;

    const actionMap = {
      calendar: 'calendarEvents',
      social: 'sharedContent',
      task: 'completedTasks',
      followup: 'followUpAnalyses'
    } as const;

    const actionKey = actionMap[actionType];
    const updatedActions = {
      ...insight.userActions,
      [actionKey]: [...insight.userActions[actionKey], actionData]
    };

    try {
      await insightDB.updateInsight(insightId, { userActions: updatedActions });
      setInsights(prev => prev.map(i => 
        i.id === insightId ? { ...i, userActions: updatedActions } : i
      ));
    } catch (error) {
      console.error('Failed to track action:', error);
    }
  }, [insights]);

  // Load insights on mount
  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return {
    insights,
    isLoading,
    searchQuery,
    saveInsight,
    loadInsights,
    searchInsights,
    toggleStar,
    archiveInsight,
    deleteInsight,
    trackAction
  };
};

// Helper function to generate search terms
function generateSearchTerms(input: string, response: any): string[] {
  const terms = new Set<string>();
  
  // Extract words from input
  const inputWords = input.toLowerCase().match(/\b\w+\b/g) || [];
  inputWords.forEach(word => {
    if (word.length > 3) terms.add(word);
  });
  
  // Extract themes from response
  if (response?.insights?.keyThemes) {
    response.insights.keyThemes.forEach((theme: any) => {
      if (theme.theme) {
        const themeWords = theme.theme.toLowerCase().match(/\b\w+\b/g) || [];
        themeWords.forEach(word => {
          if (word.length > 3) terms.add(word);
        });
      }
    });
  }
  
  return Array.from(terms);
}