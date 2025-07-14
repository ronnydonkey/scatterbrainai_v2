import React from 'react';
import { cn } from '@/lib/utils';

interface NeuralNetworkIconProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function NeuralNetworkIcon({ size = 24, className, animate = true }: NeuralNetworkIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        "text-primary",
        animate && "hover:text-accent transition-colors duration-300",
        className
      )}
    >
      {/* Connection lines */}
      <path
        d="M4 8L8 12L4 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-50"
      />
      <path
        d="M8 12L16 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="opacity-50"
      />
      <path
        d="M16 12L20 8M16 12L20 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-50"
      />
      
      {/* Nodes */}
      <circle 
        cx="4" 
        cy="8" 
        r="2" 
        fill="currentColor" 
        className={animate ? "animate-pulse" : ""}
      />
      <circle 
        cx="4" 
        cy="16" 
        r="2" 
        fill="currentColor" 
        className={animate ? "animate-pulse animation-delay-200" : ""}
      />
      <circle 
        cx="12" 
        cy="12" 
        r="2.5" 
        fill="currentColor" 
        className={animate ? "animate-pulse animation-delay-100" : ""}
      />
      <circle 
        cx="20" 
        cy="8" 
        r="2" 
        fill="currentColor" 
        className={animate ? "animate-pulse animation-delay-300" : ""}
      />
      <circle 
        cx="20" 
        cy="16" 
        r="2" 
        fill="currentColor" 
        className={animate ? "animate-pulse animation-delay-400" : ""}
      />
    </svg>
  );
}