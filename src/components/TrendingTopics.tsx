import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TrendingTopic {
  id: string;
  topic: string;
  title: string | null;
  description: string | null;
  score: number;
  source: string;
  source_url: string | null;
  keywords: string[] | null;
  sentiment: number | null;
  created_at: string;
  expires_at: string | null;
  is_validated: boolean | null;
}

export const TrendingTopics = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingTopics();
  }, [user]);

  const fetchTrendingTopics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      toast({
        title: "Error",
        description: "Failed to load trending topics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: number | null) => {
    if (!sentiment) return 'secondary';
    if (sentiment > 0.3) return 'default';
    if (sentiment < -0.3) return 'destructive';
    return 'secondary';
  };

  const getSentimentText = (sentiment: number | null) => {
    if (!sentiment) return 'Neutral';
    if (sentiment > 0.3) return 'Positive';
    if (sentiment < -0.3) return 'Negative';
    return 'Neutral';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Trending Topics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Trending Topics</span>
        </CardTitle>
        <CardDescription>
          AI-curated trending topics for your niche
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topics.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No trending topics available yet.
            </p>
          ) : (
            topics.map((topic) => (
              <div key={topic.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">
                      {topic.title || topic.topic}
                    </h4>
                    {topic.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {topic.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-2">
                    Score: {Math.round(topic.score)}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant={getSentimentColor(topic.sentiment)}>
                    {getSentimentText(topic.sentiment)}
                  </Badge>
                  <Badge variant="secondary">
                    {topic.source}
                  </Badge>
                  {topic.is_validated && (
                    <Badge variant="default">
                      Validated
                    </Badge>
                  )}
                </div>

                {topic.keywords && topic.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {topic.keywords.slice(0, 5).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(topic.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {topic.source_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => window.open(topic.source_url!, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};