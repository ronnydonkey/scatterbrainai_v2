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
        
        {/* Main Brain Shape with Cortical Folds */}
        <path
          d="M24 6C28 6 32 8 34 12C36 10 38 9 40 10C42 11 43 13 42 16C43 18 42 20 40 21C41 23 40 26 38 28C39 30 38 32 36 33C35 35 33 36 30 36C28 37 26 36 24 36C22 36 20 37 18 36C15 36 13 35 12 33C10 32 9 30 10 28C8 26 7 23 8 21C6 20 5 18 6 16C5 13 6 11 8 10C10 9 12 10 14 12C16 8 20 6 24 6Z"
          fill={variant === 'premium' ? "url(#brain-gradient)" : "hsl(var(--neural-purple))"}
          stroke="hsl(var(--neural-purple)/0.2)"
          strokeWidth="0.5"
          className={animate ? "animate-[pulse-neural_4s_ease-in-out_infinite]" : ""}
        />
        
        {/* Left Hemisphere Cortical Folds */}
        <path
          d="M12 16C14 14 16 15 18 17C16 19 17 21 19 22C17 24 18 26 20 27"
          stroke="hsl(var(--neural-purple)/0.4)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M14 20C16 18 17 20 19 21C17 23 18 25 20 26"
          stroke="hsl(var(--neural-purple)/0.3)"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Right Hemisphere Cortical Folds */}
        <path
          d="M36 16C34 14 32 15 30 17C32 19 31 21 29 22C31 24 30 26 28 27"
          stroke="hsl(var(--neural-purple)/0.4)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M34 20C32 18 31 20 29 21C31 23 30 25 28 26"
          stroke="hsl(var(--neural-purple)/0.3)"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Central Fissure */}
        <path
          d="M24 12C24 16 24 20 24 24C24 26 24 28 24 30"
          stroke="hsl(var(--neural-purple)/0.5)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Additional Brain Texture */}
        <path
          d="M16 14C18 13 19 15 21 16"
          stroke="hsl(var(--neural-purple)/0.25)"
          strokeWidth="0.6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M32 14C30 13 29 15 27 16"
          stroke="hsl(var(--neural-purple)/0.25)"
          strokeWidth="0.6"
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