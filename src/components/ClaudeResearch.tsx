import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Lightbulb, Target, TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClaudeResearchProps {
  topic?: string;
  niche?: string;
  userTier: string;
  organizationId: string;
  onUpgrade?: (message: string) => void;
  className?: string;
}

interface ResearchResult {
  content: string;
  model_used: string;
  research_type: string;
  topic: string;
  timestamp: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

const ClaudeResearch: React.FC<ClaudeResearchProps> = ({
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
  const [researchType, setResearchType] = useState<string>('deep_analysis');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const { toast } = useToast();

  const canUseClaude = userTier !== 'starter';

  const researchTypes = [
    { 
      value: 'deep_analysis', 
      label: 'Deep Analysis', 
      icon: Brain,
      description: 'Comprehensive research with strategic insights'
    },
    { 
      value: 'content_ideas', 
      label: 'Content Ideas', 
      icon: Lightbulb,
      description: 'Creative content concepts and strategies'
    },
    { 
      value: 'competitive_analysis', 
      label: 'Competitive Analysis', 
      icon: Target,
      description: 'Market positioning and competitor insights'
    },
    { 
      value: 'trend_forecast', 
      label: 'Trend Forecast', 
      icon: TrendingUp,
      description: 'Future trends and predictions'
    }
  ];

  const handleResearch = async () => {
    if (!canUseClaude) {
      onUpgrade?.('Claude research requires Professional or higher tier');
      return;
    }

    if (!topic && !useCustomPrompt) {
      setError('Please select a topic or use custom prompt');
      return;
    }

    if (useCustomPrompt && !customPrompt.trim()) {
      setError('Please enter a custom prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Calling claude-research with:', { 
        topic: useCustomPrompt ? undefined : topic, 
        niche, 
        researchType: useCustomPrompt ? 'custom' : researchType,
        customPrompt: useCustomPrompt ? customPrompt : undefined
      });
      
      const { data, error } = await supabase.functions.invoke('claude-research', {
        body: {
          topic: useCustomPrompt ? undefined : topic,
          niche,
          researchType: useCustomPrompt ? 'custom' : researchType,
          customPrompt: useCustomPrompt ? customPrompt : undefined
        }
      });

      console.log('Claude response:', { data, error });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

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
      console.error('Claude research error:', err);
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

  const selectedResearchType = researchTypes.find(type => type.value === researchType);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Claude Research & Writing
            </CardTitle>
            <CardDescription>
              Advanced AI research powered by Claude Sonnet 4
            </CardDescription>
          </div>
          <Badge variant={canUseClaude ? "default" : "secondary"}>
            {userTier.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!canUseClaude && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Professional Feature
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Upgrade to Creator for basic research, Professional for 25 queries/month, or Agency for unlimited Claude research.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Button
              variant={!useCustomPrompt ? "default" : "outline"}
              size="sm"
              onClick={() => setUseCustomPrompt(false)}
            >
              Research Topic
            </Button>
            <Button
              variant={useCustomPrompt ? "default" : "outline"}
              size="sm"
              onClick={() => setUseCustomPrompt(true)}
            >
              Custom Prompt
            </Button>
          </div>

          {!useCustomPrompt ? (
            <div className="space-y-3">
              {topic && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900">Topic: {topic}</p>
                  <p className="text-xs text-blue-700">Niche: {niche || 'General'}</p>
                </div>
              )}

              <Select value={researchType} onValueChange={setResearchType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select research type" />
                </SelectTrigger>
                <SelectContent>
                  {researchTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Research Prompt</label>
              <Textarea
                placeholder="Enter your custom research prompt or question..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          )}

          <Button
            onClick={handleResearch}
            disabled={!canUseClaude || loading || (!topic && !useCustomPrompt) || (useCustomPrompt && !customPrompt.trim())}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {useCustomPrompt ? 'Generate Research' : `Start ${selectedResearchType?.label}`}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {research && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                {research.research_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
              <span className="text-xs text-gray-500">
                {new Date(research.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="prose prose-sm max-w-none">
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {research.content}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-blue-200">
              <span>Model: {research.model_used}</span>
              <span>Tokens: {research.usage.input_tokens + research.usage.output_tokens}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaudeResearch;