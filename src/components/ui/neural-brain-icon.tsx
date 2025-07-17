import React from 'react';
import { cn } from '@/lib/utils';

interface NeuralBrainIconProps {
  size?: number;
  className?: string;
  animate?: boolean;
  variant?: 'default' | 'premium' | 'minimal';
}

export function NeuralBrainIcon({ 
  size = 32, 
  className, 
  animate = true, 
  variant = 'default' 
}: NeuralBrainIconProps) {
  const baseClasses = "transition-all duration-500";
  const animationClasses = animate ? "neural-pulse" : "";
  
  const glowClasses = variant === 'premium' ? "drop-shadow-[0_0_20px_hsl(var(--neural-purple)/0.4)]" : "";
  
  return (
    <div className={cn(baseClasses, animationClasses, glowClasses, className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className="relative"
      >
        {/* Background Glow Effect */}
        {variant === 'premium' && (
          <defs>
            <filter id="neural-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="brain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--neural-purple))" />
              <stop offset="50%" stopColor="hsl(var(--neural-blue))" />
              <stop offset="100%" stopColor="hsl(var(--neural-gold))" />
            </linearGradient>
          </defs>
        )}
        
        {/* Brain Structure - Organic flowing lines */}
        <path
          d="M24 4C20.5 4 17.5 6 16 9C14.8 7.5 12.8 6.5 10.5 6.5C7 6.5 4 9.5 4 13C4 16 6 18.5 8.5 19.8C8.2 21 8 22.2 8 23.5C8 26.5 9.2 29.2 11 31.2C10.4 32.5 10 33.9 10 35.5C10 39.6 13.4 43 17.5 43C18.8 43 20 42.5 21 41.8C21.6 41.9 22.3 42 24 42C25.7 42 26.4 41.9 27 41.8C28 42.5 29.2 43 30.5 43C34.6 43 38 39.6 38 35.5C38 33.9 37.6 32.5 37 31.2C38.8 29.2 40 26.5 40 23.5C40 22.2 39.8 21 39.5 19.8C42 18.5 44 16 44 13C44 9.5 41 6.5 37.5 6.5C35.2 6.5 33.2 7.5 32 9C30.5 6 27.5 4 24 4Z"
          fill={variant === 'premium' ? "url(#brain-gradient)" : "hsl(var(--neural-purple))"}
          stroke="hsl(var(--neural-purple)/0.3)"
          strokeWidth="0.5"
          filter={variant === 'premium' ? "url(#neural-glow)" : undefined}
          className={animate ? "animate-[pulse-neural_4s_ease-in-out_infinite]" : ""}
        />
        
        {/* Neural Pathways - Left Hemisphere */}
        <path
          d="M12 15 Q16 18 18 22 Q20 26 16 30"
          stroke="hsl(var(--neural-gold))"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
          className={animate ? "animate-[neural-flow_6s_ease-in-out_infinite]" : ""}
        />
        
        <path
          d="M14 20 Q18 23 20 27"
          stroke="hsl(var(--neural-blue))"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
          className={animate ? "animate-[neural-flow_5s_ease-in-out_infinite_0.5s]" : ""}
        />
        
        {/* Neural Pathways - Right Hemisphere */}
        <path
          d="M36 15 Q32 18 30 22 Q28 26 32 30"
          stroke="hsl(var(--neural-gold))"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
          className={animate ? "animate-[neural-flow_6s_ease-in-out_infinite_1s]" : ""}
        />
        
        <path
          d="M34 20 Q30 23 28 27"
          stroke="hsl(var(--neural-blue))"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
          className={animate ? "animate-[neural-flow_5s_ease-in-out_infinite_1.5s]" : ""}
        />
        
        {/* Central Neural Pathway */}
        <path
          d="M24 12 Q24 18 24 24 Q24 30 24 36"
          stroke="hsl(var(--neural-purple))"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
          className={animate ? "animate-[pulse_3s_ease-in-out_infinite]" : ""}
        />
        
        {/* Neural Nodes - Synapses */}
        {variant !== 'minimal' && (
          <>
            <circle
              cx="16"
              cy="18"
              r="2"
              fill="hsl(var(--neural-gold))"
              opacity="0.9"
              className={animate ? "animate-[pulse_2s_ease-in-out_infinite]" : ""}
            />
            <circle
              cx="32"
              cy="18"
              r="2"
              fill="hsl(var(--neural-gold))"
              opacity="0.9"
              className={animate ? "animate-[pulse_2s_ease-in-out_infinite_0.3s]" : ""}
            />
            <circle
              cx="24"
              cy="24"
              r="2.5"
              fill="hsl(var(--neural-blue))"
              opacity="0.9"
              className={animate ? "animate-[pulse_2.5s_ease-in-out_infinite_0.6s]" : ""}
            />
            <circle
              cx="18"
              cy="30"
              r="1.5"
              fill="hsl(var(--neural-purple))"
              opacity="0.8"
              className={animate ? "animate-[pulse_1.8s_ease-in-out_infinite_0.9s]" : ""}
            />
            <circle
              cx="30"
              cy="30"
              r="1.5"
              fill="hsl(var(--neural-purple))"
              opacity="0.8"
              className={animate ? "animate-[pulse_1.8s_ease-in-out_infinite_1.2s]" : ""}
            />
          </>
        )}
        
        {/* Connection Sparks for Premium */}
        {variant === 'premium' && animate && (
          <>
            <circle
              cx="20"
              cy="20"
              r="0.5"
              fill="hsl(var(--neural-gold))"
              opacity="0"
              className="animate-[spark_3s_linear_infinite]"
            />
            <circle
              cx="28"
              cy="26"
              r="0.5"
              fill="hsl(var(--neural-blue))"
              opacity="0"
              className="animate-[spark_3s_linear_infinite_1s]"
            />
          </>
        )}
      </svg>
      
    </div>
  );
}