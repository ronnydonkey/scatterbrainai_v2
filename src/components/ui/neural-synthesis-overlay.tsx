import React from 'react';
import { NeuralThinkingAnimation } from './neural-thinking-animation';
import { ThinkingStatusLabels } from './thinking-status-labels';
import { cn } from '@/lib/utils';

interface NeuralSynthesisOverlayProps {
  isVisible: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function NeuralSynthesisOverlay({
  isVisible,
  title = "Processing Your Thoughts",
  subtitle = "Neural synthesis in progress",
  className
}: NeuralSynthesisOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <div className="flex flex-col items-center space-y-8 max-w-md mx-auto p-8">
        {/* Main thinking animation */}
        <NeuralThinkingAnimation 
          size="lg" 
          intensity="intense"
          className="mb-4"
        />
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-amber-500 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-muted-foreground">
            {subtitle}
          </p>
        </div>
        
        {/* Cycling status messages */}
        <ThinkingStatusLabels className="mt-6" />
        
        {/* Breathing glow effect */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent animate-pulse pointer-events-none" />
      </div>
    </div>
  );
}