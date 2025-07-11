import React from 'react';

interface TrendingScoreIndicatorProps {
  score: number;
  className?: string;
}

export const TrendingScoreIndicator: React.FC<TrendingScoreIndicatorProps> = ({ 
  score, 
  className = "" 
}) => {
  const getTrendingScore = (score: number) => {
    if (score >= 80) return { 
      label: 'Hot', 
      dotColor: 'bg-trending-hot',
      textColor: 'text-trending-hot' 
    };
    if (score >= 60) return { 
      label: 'Rising', 
      dotColor: 'bg-trending-rising',
      textColor: 'text-trending-rising' 
    };
    if (score >= 40) return { 
      label: 'Warm', 
      dotColor: 'bg-trending-warm',
      textColor: 'text-trending-warm' 
    };
    return { 
      label: 'Cool', 
      dotColor: 'bg-trending-cool',
      textColor: 'text-trending-cool' 
    };
  };

  const trendScore = getTrendingScore(score);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${trendScore.dotColor}`}></div>
      <span className={`text-sm font-medium ${trendScore.textColor}`}>
        {trendScore.label}
      </span>
    </div>
  );
};