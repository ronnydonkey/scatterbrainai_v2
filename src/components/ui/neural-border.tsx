import React from 'react';
import { cn } from '@/lib/utils';

interface NeuralBorderProps {
  children: React.ReactNode;
  active?: boolean;
  pulsing?: boolean;
  className?: string;
}

export function NeuralBorder({ children, active = false, pulsing = false, className }: NeuralBorderProps) {
  return (
    <div 
      className={cn(
        "relative rounded-lg border border-border/50 overflow-hidden",
        "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-primary/20 before:via-accent/20 before:to-primary/20 before:opacity-0 before:transition-opacity before:duration-500",
        active && "before:opacity-100 border-primary/50",
        pulsing && "before:animate-pulse",
        "hover:before:opacity-60 hover:border-primary/30 transition-all duration-300",
        className
      )}
    >
      <div className="relative z-10 bg-card/80 backdrop-blur-sm rounded-lg">
        {children}
      </div>
    </div>
  );
}