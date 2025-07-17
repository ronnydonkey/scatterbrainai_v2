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
        
        {/* Left Hemisphere Outline */}
        <path
          d="M8 24C8 16 12 10 18 8C20 7 22 7 24 8V40C22 41 20 41 18 40C12 38 8 32 8 24Z"
          fill="none"
          stroke={variant === 'premium' ? "url(#brain-gradient)" : "hsl(var(--neural-purple))"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animate ? "animate-[pulse-neural_4s_ease-in-out_infinite]" : ""}
        />
        
        {/* Right Hemisphere Outline */}
        <path
          d="M40 24C40 16 36 10 30 8C28 7 26 7 24 8V40C26 41 28 41 30 40C36 38 40 32 40 24Z"
          fill="none"
          stroke={variant === 'premium' ? "url(#brain-gradient)" : "hsl(var(--neural-purple))"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animate ? "animate-[pulse-neural_4s_ease-in-out_infinite_0.2s]" : ""}
        />
        
        {/* Central Divider */}
        <line
          x1="24" y1="12" x2="24" y2="36"
          stroke={variant === 'premium' ? "url(#brain-gradient)" : "hsl(var(--neural-purple))"}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Left Hemisphere Neural Network */}
        <g opacity="0.9">
          {/* Left side nodes */}
          <circle cx="14" cy="16" r="1.5" fill="hsl(var(--neural-gold))" className={animate ? "animate-pulse" : ""} />
          <circle cx="19" cy="14" r="1.5" fill="hsl(var(--neural-gold))" className={animate ? "animate-pulse" : ""} />
          <circle cx="12" cy="22" r="1.5" fill="hsl(var(--neural-gold))" className={animate ? "animate-pulse" : ""} />
          <circle cx="18" cy="20" r="1.5" fill="hsl(var(--neural-gold))" className={animate ? "animate-pulse" : ""} />
          <circle cx="16" cy="26" r="1.5" fill="hsl(var(--neural-gold))" className={animate ? "animate-pulse" : ""} />
          <circle cx="20" cy="30" r="1.5" fill="hsl(var(--neural-gold))" className={animate ? "animate-pulse" : ""} />
          <circle cx="14" cy="32" r="1.5" fill="hsl(var(--neural-gold))" className={animate ? "animate-pulse" : ""} />
          
          {/* Left side connections */}
          <line x1="14" y1="16" x2="19" y2="14" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
          <line x1="14" y1="16" x2="12" y2="22" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
          <line x1="19" y1="14" x2="18" y2="20" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
          <line x1="12" y1="22" x2="18" y2="20" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
          <line x1="18" y1="20" x2="16" y2="26" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
          <line x1="16" y1="26" x2="20" y2="30" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
          <line x1="16" y1="26" x2="14" y2="32" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
          <line x1="20" y1="30" x2="14" y2="32" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
        </g>
        
        {/* Right Hemisphere Neural Network */}
        <g opacity="0.9">
          {/* Right side nodes */}
          <circle cx="34" cy="16" r="1.5" fill="hsl(var(--neural-gold))" className={animate ? "animate-pulse" : ""} />
          <circle cx="29" cy="14" r="1.5" fill="hsl(var(--neural-gold))" className={animate ? "animate-pulse" : ""} />
          <circle cx="36" cy="22" r="1.5" fill="hsl(var(--neural-gold))" className={animate ? "animate-pulse" : ""} />
          <circle cx="30" cy="20" r="1.5" fill="hsl(var(--neural-gold))" className={animate ? "animate-pulse" : ""} />
          <circle cx="32" cy="26" r="1.5" fill="hsl(var(--neural-gold))" className={animate ? "animate-pulse" : ""} />
          <circle cx="28" cy="30" r="1.5" fill="hsl(var(--neural-gold))" className={animate ? "animate-pulse" : ""} />
          <circle cx="34" cy="32" r="1.5" fill="hsl(var(--neural-gold))" className={animate ? "animate-pulse" : ""} />
          
          {/* Right side connections */}
          <line x1="34" y1="16" x2="29" y2="14" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
          <line x1="34" y1="16" x2="36" y2="22" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
          <line x1="29" y1="14" x2="30" y2="20" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
          <line x1="36" y1="22" x2="30" y2="20" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
          <line x1="30" y1="20" x2="32" y2="26" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
          <line x1="32" y1="26" x2="28" y2="30" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
          <line x1="32" y1="26" x2="34" y2="32" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
          <line x1="28" y1="30" x2="34" y2="32" stroke="hsl(var(--neural-purple))" strokeWidth="1.5" opacity="0.7" />
        </g>
        
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