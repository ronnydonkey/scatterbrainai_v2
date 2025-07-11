import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingTopicCard } from './TrendingTopicCard';

interface TrendingTopic {
  id: string;
  topic: string;
  source: string;
  score: number;
  validation_data?: any;
  perplexity_research?: any;
  created_at: string;
  expires_at?: string;
}

interface TrendingTopicsProps {
  onTopicSelect: (topic: string) => void;
  onNavigateToResearch?: () => void;
}

export const TrendingTopics: React.FC<TrendingTopicsProps> = ({ 
  onTopicSelect, 
  onNavigateToResearch 
}) => {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  const fetchTrendingTopics = async () => {
    try {
      setLoading(true);
      
      // Sort by created_at DESC (most recent first)
      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      toast({
        title: "Error",
        description: "Failed to load trending topics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topic: TrendingTopic) => {
    // Set the selected topic
    onTopicSelect(topic.topic);
    
    // Navigate to research tab
    if (onNavigateToResearch) {
      onNavigateToResearch();
    }
    
    // Show feedback
    toast({
      title: "Topic Selected",
      description: `Researching: ${topic.topic}`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Trending Topics
          </h2>
          <p className="text-muted-foreground mt-1">
            Click any topic to research it with AI
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchTrendingTopics}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {topics.map((topic) => (
          <TrendingTopicCard 
            key={topic.id} 
            topic={topic} 
            onClick={handleTopicClick}
          />
        ))}
      </div>

      {topics.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No trending topics yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Add some thoughts to generate trending topics
            </p>
            <Button variant="outline" onClick={fetchTrendingTopics}>
              Refresh Topics
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};