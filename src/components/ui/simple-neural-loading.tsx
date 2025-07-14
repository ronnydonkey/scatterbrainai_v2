import React from 'react';
import { cn } from '@/lib/utils';

interface SimpleNeuralLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function SimpleNeuralLoading({ 
  size = 'md', 
  text = "Processing neural patterns...", 
  className 
}: SimpleNeuralLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <div className={cn(
          "rounded-full border-2 border-primary/20 border-t-primary animate-spin",
          sizeClasses[size]
        )} />
        <div className={cn(
          "absolute inset-0 rounded-full border-2 border-transparent border-r-accent animate-spin",
          sizeClasses[size]
        )} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}