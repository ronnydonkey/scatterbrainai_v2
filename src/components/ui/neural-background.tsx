import React from 'react';
import { cn } from '@/lib/utils';

interface NeuralBackgroundProps {
  variant?: 'subtle' | 'connections' | 'grid' | 'flow';
  className?: string;
  children?: React.ReactNode;
}

export function NeuralBackground({ 
  variant = 'subtle', 
  className, 
  children 
}: NeuralBackgroundProps) {
  const backgroundClasses = {
    subtle: 'neural-network-bg',
    connections: 'neural-connections',
    grid: 'neural-grid',
    flow: 'neural-flow'
  };

  return (
    <div className={cn(
      'relative',
      backgroundClasses[variant],
      className
    )}>
      {children}
    </div>
  );
}