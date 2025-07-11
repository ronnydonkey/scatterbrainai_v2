import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SourceBadgeProps {
  source: string;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, className = "" }) => {
  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'reddit':
        return '🔴';
      case 'google_trends':
        return '📈';
      case 'social':
        return '📱';
      case 'perplexity':
        return '🔍';
      default:
        return '📊';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'reddit':
        return 'bg-source-reddit-muted text-source-reddit-foreground border-source-reddit';
      case 'google_trends':
        return 'bg-source-google-muted text-source-google-foreground border-source-google';
      case 'social':
        return 'bg-source-social-muted text-source-social-foreground border-source-social';
      case 'perplexity':
        return 'bg-source-perplexity-muted text-source-perplexity-foreground border-source-perplexity';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getSourceColor(source)} ${className}`}
    >
      {getSourceIcon(source)} {source.replace('_', ' ')}
    </Badge>
  );
};