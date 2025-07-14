import React from 'react';
import { cn } from '@/lib/utils';

interface SynapseIconProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function SynapseIcon({ size = 24, className, animate = true }: SynapseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        "text-accent",
        animate && "hover:text-primary transition-colors duration-300",
        className
      )}
    >
      <circle 
        cx="6" 
        cy="6" 
        r="3" 
        fill="currentColor" 
        className={animate ? "animate-pulse" : ""}
      />
      <circle 
        cx="18" 
        cy="18" 
        r="3" 
        fill="currentColor" 
        className={animate ? "animate-pulse animation-delay-300" : ""}
      />
      <path
        d="M8.5 8.5L15.5 15.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-70"
      />
      <circle 
        cx="12" 
        cy="12" 
        r="1.5" 
        fill="currentColor" 
        className={animate ? "animate-ping" : ""}
      />
      <circle 
        cx="10" 
        cy="10" 
        r="0.5" 
        fill="currentColor" 
        className="opacity-60"
      />
      <circle 
        cx="14" 
        cy="14" 
        r="0.5" 
        fill="currentColor" 
        className="opacity-60"
      />
    </svg>
  );
}