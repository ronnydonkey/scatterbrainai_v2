import React from 'react';
import { cn } from '@/lib/utils';
import { NeuralThinkingAnimation } from './neural-thinking-animation';
import { ThinkingStatusLabels } from './thinking-status-labels';

interface SimpleNeuralLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  showMessages?: boolean;
}

export function SimpleNeuralLoading({ 
  size = 'md', 
  text = "Processing neural patterns...", 
  className,
  showMessages = false
}: SimpleNeuralLoadingProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <NeuralThinkingAnimation size={size} intensity="normal" />
      {showMessages ? (
        <ThinkingStatusLabels />
      ) : text && (
        <p className="text-sm font-medium bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
          {text}
        </p>
      )}
    </div>
  );
}