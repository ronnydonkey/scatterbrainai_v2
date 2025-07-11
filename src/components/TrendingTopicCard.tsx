import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TrendingScoreIndicator } from './TrendingScoreIndicator';
import { SourceBadge } from './SourceBadge';

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

interface TrendingTopicCardProps {
  topic: TrendingTopic;
  onClick: (topic: TrendingTopic) => void;
}

export const TrendingTopicCard: React.FC<TrendingTopicCardProps> = ({ topic, onClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group hover:bg-accent/50"
      onClick={() => onClick(topic)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {topic.topic}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
            </CardDescription>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SourceBadge source={topic.source} />
            <TrendingScoreIndicator score={topic.score} />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">
              {Math.round(topic.score)}
            </span>
            <span className="text-sm text-muted-foreground">score</span>
          </div>
        </div>

        {/* Validation indicators */}
        {topic.validation_data && (
          <div className="mt-3 flex gap-2">
            <Badge variant="secondary" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Validated
            </Badge>
            {topic.perplexity_research && (
              <Badge variant="secondary" className="text-xs">
                🔍 Live Research
              </Badge>
            )}
          </div>
        )}

        {/* Click hint */}
        <div className="mt-3 text-xs text-muted-foreground group-hover:text-primary transition-colors">
          Click to research this topic →
        </div>
      </CardContent>
    </Card>
  );
};