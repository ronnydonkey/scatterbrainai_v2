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
        
        {/* Brain Structure - Anatomically recognizable brain shape */}
        {/* Left Hemisphere */}
        <path
          d="M8 18C8 12 12 8 18 8C20 8 22 9 23 11C23.5 10 24.5 9.5 26 9.5C28 9.5 30 11 30 13.5C30 15 29 16.5 27.5 17.2C27.8 18.5 28 19.8 28 21C28 25 25 28 21 29C20.5 30.5 19.5 32 18 32.5C16.5 33 15 32.5 14 31C12 32 9.5 31.5 8.5 29C7.5 27.5 7.5 25.5 8 23C7.5 21.5 7.5 19.5 8 18Z"
          fill={variant === 'premium' ? "url(#brain-gradient)" : "hsl(var(--neural-purple))"}
          stroke="hsl(var(--neural-purple)/0.3)"
          strokeWidth="0.5"
          filter={variant === 'premium' ? "url(#neural-glow)" : undefined}
          className={animate ? "animate-[pulse-neural_4s_ease-in-out_infinite]" : ""}
        />
        
        {/* Right Hemisphere */}
        <path
          d="M40 18C40 12 36 8 30 8C28 8 26 9 25 11C24.5 10 23.5 9.5 22 9.5C20 9.5 18 11 18 13.5C18 15 19 16.5 20.5 17.2C20.2 18.5 20 19.8 20 21C20 25 23 28 27 29C27.5 30.5 28.5 32 30 32.5C31.5 33 33 32.5 34 31C36 32 38.5 31.5 39.5 29C40.5 27.5 40.5 25.5 40 23C40.5 21.5 40.5 19.5 40 18Z"
          fill={variant === 'premium' ? "url(#brain-gradient)" : "hsl(var(--neural-purple))"}
          stroke="hsl(var(--neural-purple)/0.3)"
          strokeWidth="0.5"
          filter={variant === 'premium' ? "url(#neural-glow)" : undefined}
          className={animate ? "animate-[pulse-neural_4s_ease-in-out_infinite_0.2s]" : ""}
        />
        
        {/* Brain Stem */}
        <path
          d="M22 32C22 33 22.5 34 24 34C25.5 34 26 33 26 32"
          stroke="hsl(var(--neural-purple))"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
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