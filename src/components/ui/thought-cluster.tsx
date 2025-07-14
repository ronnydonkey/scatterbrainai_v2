import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ThoughtClusterProps {
  thoughts: number;
  title?: string;
  className?: string;
  expanded?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}

export function ThoughtCluster({ 
  thoughts, 
  title = "Thought Cluster", 
  className, 
  expanded = false, 
  onToggle,
  children 
}: ThoughtClusterProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-primary">
              <circle cx="8" cy="8" r="6" fill="currentColor" className="opacity-20" />
              <circle cx="6" cy="6" r="1.5" fill="currentColor" className="animate-pulse" />
              <circle cx="10" cy="6" r="1.5" fill="currentColor" className="animate-pulse animation-delay-100" />
              <circle cx="8" cy="10" r="1.5" fill="currentColor" className="animate-pulse animation-delay-200" />
              <path
                d="M6 6L8 10M10 6L8 10"
                stroke="currentColor"
                strokeWidth="0.5"
                className="opacity-60"
              />
            </svg>
          </div>
          <span>{title}</span>
          <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
            {thoughts}
          </span>
        </div>
      </button>
      
      {isExpanded && children && (
        <div className="ml-6 mt-2 border-l border-border/50 pl-4 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}