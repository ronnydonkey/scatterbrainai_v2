import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { Brain, Cpu, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingTopicCard } from './TrendingTopicCard';
import { SimpleNeuralLoading } from '@/components/ui/simple-neural-loading';
import { NeuralBorder } from '@/components/ui/neural-border';
import { BrainIcon } from '@/components/ui/brain-icon';
import { NeuralNetworkIcon } from '@/components/ui/neural-network-icon';
import { ThoughtCluster } from '@/components/ui/thought-cluster';

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
      <div className="space-y-6">
        <div className="flex justify-center">
          <SimpleNeuralLoading size="md" text="Analyzing trending neural patterns..." />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <NeuralBorder key={i}>
              <Card className="border-0">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                </CardHeader>
              </Card>
            </NeuralBorder>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <NeuralNetworkIcon size={28} />
            <span>Neural Trending Patterns</span>
            <ThoughtCluster thoughts={5} className="w-6 h-6" />
          </h2>
          <p className="text-muted-foreground mt-1">
            Click any neural pattern to research it with AI
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
        {topics.map((topic, index) => (
          <NeuralBorder key={topic.id} active={topic.score > 70}>
            <TrendingTopicCard 
              topic={topic} 
              onClick={handleTopicClick}
            />
          </NeuralBorder>
        ))}
      </div>

      {topics.length === 0 && (
        <NeuralBorder>
          <Card className="text-center py-12 border-0">
            <CardContent>
              <div className="flex justify-center mb-4">
                <BrainIcon size={48} animate={false} className="opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Neural network dormant
              </h3>
              <p className="text-muted-foreground mb-4">
                Add some thoughts to activate trending neural patterns
              </p>
              <Button variant="outline" onClick={fetchTrendingTopics}>
                <NeuralNetworkIcon size={16} className="mr-2" />
                Refresh Neural Scan
              </Button>
            </CardContent>
          </Card>
        </NeuralBorder>
      )}
    </div>
  );
};