import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Zap, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PerplexityResearchProps {
  topic: string;
  niche?: string;
  userTier: string;
  organizationId: string;
  onUpgrade?: (message: string) => void;
  className?: string;
}

interface ResearchResult {
  content: string;
  sources: Array<{
    url: string;
    title?: string;
  }>;
  model_used: string;
  query_type: string;
  timestamp: string;
}

const PerplexityResearch: React.FC<PerplexityResearchProps> = ({
  topic,
  niche,
  userTier,
  organizationId,
  onUpgrade,
  className = ""
}) => {
  const [research, setResearch] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const canUsePerplexity = userTier !== 'starter';

  const handleResearch = async (queryType: 'trend_verification' | 'competitive_analysis' | 'content_opportunity') => {
    if (!canUsePerplexity) {
      onUpgrade?.('Perplexity research requires Professional or Enterprise tier');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('perplexity-research', {
        body: {
          topic,
          niche,
          queryType
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.upgrade_required) {
          onUpgrade?.(data.error);
          return;
        }
        throw new Error(data.error);
      }

      setResearch(data.research);
      toast({
        title: "Research Complete",
        description: `Used ${data.usage.current}/${data.usage.limit} queries this month`,
      });

    } catch (err: any) {
      console.error('Perplexity research error:', err);
      setError(err.message || 'Failed to complete research');
      toast({
        title: "Research Failed",
        description: err.message || 'Something went wrong',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getQueryTypeLabel = (type: string) => {
    switch (type) {
      case 'trend_verification': return 'Trend Verification';
      case 'competitive_analysis': return 'Competitive Analysis';
      case 'content_opportunity': return 'Content Opportunity';
      default: return type;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Real-Time Research
            </CardTitle>
            <CardDescription>
              Live intelligence powered by Perplexity AI
            </CardDescription>
          </div>
          <Badge variant={canUsePerplexity ? "default" : "secondary"}>
            {userTier.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!canUsePerplexity && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Professional Feature
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Upgrade to Professional for real-time research with 10 queries/month, 
                  Agency for 25 queries/month, or Enterprise for unlimited research.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-2">
          <Button
            onClick={() => handleResearch('trend_verification')}
            disabled={!canUsePerplexity || loading}
            variant="outline"
            className="justify-start"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Verify Trend
          </Button>

          <Button
            onClick={() => handleResearch('content_opportunity')}
            disabled={!canUsePerplexity || loading}
            variant="outline"
            className="justify-start"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Find Opportunities
          </Button>

          {userTier === 'enterprise' && (
            <Button
              onClick={() => handleResearch('competitive_analysis')}
              disabled={loading}
              variant="outline"
              className="justify-start"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Competitive Analysis
              <Badge variant="secondary" className="ml-2 text-xs">
                ENTERPRISE
              </Badge>
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {research && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {getQueryTypeLabel(research.query_type)}
              </Badge>
              <span className="text-xs text-gray-500">
                {new Date(research.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {research.content}
              </p>
            </div>

            {research.sources && research.sources.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {research.sources.slice(0, 3).map((source, i) => (
                    <a
                      key={i}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Source {i + 1}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerplexityResearch;