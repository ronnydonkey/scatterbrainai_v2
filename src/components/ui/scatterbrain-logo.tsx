import React from 'react';
import { cn } from '@/lib/utils';
import { NeuralBrainIcon } from './neural-brain-icon';

interface ScatterBrainLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'stacked' | 'icon-only';
  premium?: boolean;
  className?: string;
  animate?: boolean;
}

const sizeConfig = {
  sm: { icon: 24, text: 'text-lg', spacing: 'gap-2' },
  md: { icon: 32, text: 'text-xl', spacing: 'gap-3' },
  lg: { icon: 40, text: 'text-2xl', spacing: 'gap-4' },
  xl: { icon: 48, text: 'text-3xl', spacing: 'gap-4' }
};

export function ScatterBrainLogo({ 
  size = 'md', 
  variant = 'horizontal', 
  premium = false,
  className,
  animate = true 
}: ScatterBrainLogoProps) {
  const config = sizeConfig[size];
  
  const WordMark = () => (
    <div className={cn(
      "font-bold tracking-tight",
      config.text,
      premium ? "bg-gradient-to-r from-neural-purple to-neural-gold bg-clip-text text-transparent" : "text-foreground"
    )}>
      ScatterBrainAI
    </div>
  );

  if (variant === 'icon-only') {
    return (
      <div className={className}>
        <NeuralBrainIcon 
          size={config.icon} 
          variant={premium ? 'premium' : 'default'}
          animate={animate}
        />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={cn("flex flex-col items-center", config.spacing, className)}>
        <NeuralBrainIcon 
          size={config.icon} 
          variant={premium ? 'premium' : 'default'}
          animate={animate}
        />
        <WordMark />
      </div>
    );
  }

  // Horizontal (default)
  return (
    <div className={cn("flex items-center", config.spacing, className)}>
      <NeuralBrainIcon 
        size={config.icon} 
        variant={premium ? 'premium' : 'default'}
        animate={animate}
      />
      <WordMark />
    </div>
  );
}