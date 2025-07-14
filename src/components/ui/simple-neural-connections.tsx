import React from 'react';
import { cn } from '@/lib/utils';

interface SimpleNeuralConnectionsProps {
  connections?: number;
  animated?: boolean;
  className?: string;
}

export function SimpleNeuralConnections({ 
  connections = 3, 
  animated = true, 
  className 
}: SimpleNeuralConnectionsProps) {
  return (
    <div className={cn("relative w-full h-24", className)}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 100"
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        
        {Array.from({ length: connections }).map((_, i) => {
          const yOffset = 20 + (i * 20);
          return (
            <g key={i}>
              <path
                d={`M 10 ${yOffset} Q 100 ${yOffset - 10} 190 ${yOffset}`}
                stroke="url(#connectionGradient)"
                strokeWidth="2"
                fill="none"
                className={animated ? "animate-pulse" : ""}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
              <circle
                cx="10"
                cy={yOffset}
                r="3"
                fill="hsl(var(--primary))"
                className={animated ? "animate-ping" : ""}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
              <circle
                cx="190"
                cy={yOffset}
                r="3"
                fill="hsl(var(--accent))"
                className={animated ? "animate-ping" : ""}
                style={{ animationDelay: `${i * 0.2 + 0.5}s` }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}