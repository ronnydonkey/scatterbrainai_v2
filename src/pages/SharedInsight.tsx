import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, Clock, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NeuralAmbientBackground } from '@/components/ui/neural-ambient-background';
import { demoInsights } from '@/data/demoInsights';

export default function SharedInsight() {
  const { insightId } = useParams();
  const navigate = useNavigate();
  const [insight, setInsight] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const loadInsight = () => {
      // Check if it's a demo insight
      if (insightId?.startsWith('demo-')) {
        const demoId = insightId.replace('demo-', '');
        const demoInsight = demoInsights.find(i => i.id === demoId);
        if (demoInsight) {
          setInsight(demoInsight);
          setIsDemo(true);
        }
      } else {
        // Try to load from localStorage (for now)
        const savedInsights = JSON.parse(localStorage.getItem('scatterbrain_insights') || '[]');
        const foundInsight = savedInsights.find((i: any) => i.id === insightId);
        if (foundInsight) {
          setInsight(foundInsight);
        }
      }
      setIsLoading(false);
    };

    loadInsight();
  }, [insightId]);

  const getRelativeTime = (timestamp: number): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return 'Today';
    if (diffInHours < 48) return 'Yesterday';
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading insight...</p>
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Insight Not Found</h1>
          <p className="text-muted-foreground mb-6">This insight may have been removed or doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const response = insight.response?.insights;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <NeuralAmbientBackground intensity="minimal" />
      
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
            <span className="text-xl font-bold">Scatterbrain</span>
            {isDemo && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Demo</span>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="border-primary/20 hover:border-primary/40"
          >
            Try Scatterbrain
          </Button>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-6 py-12">
        {/* Insight Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-muted-foreground">{getRelativeTime(insight.timestamp)}</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {response?.keyThemes?.[0]?.theme || 'Shared Insight'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A Scatterbrain synthesis from scattered thoughts
          </p>
        </div>

        {/* Original Input */}
        <Card className="mb-8 bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              Original Thoughts
            </h2>
            <div className="bg-background/30 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {insight.input || 'No original content available'}
            </div>
          </CardContent>
        </Card>

        {/* Insights Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Key Themes */}
          {response?.keyThemes?.length > 0 && (
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-primary">🎯 Key Themes</h3>
                <div className="space-y-3">
                  {response.keyThemes.map((theme: any, index: number) => (
                    <div key={index} className="bg-background/30 rounded-lg p-3">
                      <div className="font-medium mb-1">{theme.theme}</div>
                      {theme.description && (
                        <div className="text-sm text-muted-foreground">{theme.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {response?.summary && (
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-primary">📝 Summary</h3>
                <div className="text-sm leading-relaxed">{response.summary}</div>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          {response?.actionItems?.length > 0 && (
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-primary">🎯 Action Items</h3>
                <div className="space-y-2">
                  {response.actionItems.map((action: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <div className="text-sm leading-relaxed flex-1">{action}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quotes */}
          {response?.quotes?.length > 0 && (
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-primary">💡 Key Quotes</h3>
                <div className="space-y-3">
                  {response.quotes.map((quote: string, index: number) => (
                    <div key={index} className="border-l-4 border-primary/30 pl-4 italic text-sm">
                      "{quote}"
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to organize your own thoughts?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Scatterbrain transforms scattered thoughts into structured insights. Start capturing your ideas and see the patterns emerge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/')}>
                <Sparkles className="w-5 h-5 mr-2" />
                Try Scatterbrain Free
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/gallery')}>
                <ExternalLink className="w-5 h-5 mr-2" />
                View More Examples
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attribution */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Created with Scatterbrain - A method for your madness</p>
        </div>
      </div>
    </div>
  );
}