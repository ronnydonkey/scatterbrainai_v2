import React from 'react';
import { cn } from '@/lib/utils';

interface BrainIconProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function BrainIcon({ size = 24, className, animate = true }: BrainIconProps) {
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
      <path
        d="M12 2C10.5 2 9.2 2.8 8.5 4C7.8 3.2 6.8 2.7 5.7 2.7C3.7 2.7 2 4.4 2 6.4C2 8 3 9.4 4.3 10.1C4.1 10.7 4 11.3 4 12C4 13.5 4.6 14.8 5.5 15.8C5.2 16.5 5 17.2 5 18C5 20.2 6.8 22 9 22C9.8 22 10.5 21.7 11.1 21.3C11.4 21.4 11.7 21.5 12 21.5C12.3 21.5 12.6 21.4 12.9 21.3C13.5 21.7 14.2 22 15 22C17.2 22 19 20.2 19 18C19 17.2 18.8 16.5 18.5 15.8C19.4 14.8 20 13.5 20 12C20 11.3 19.9 10.7 19.7 10.1C21 9.4 22 8 22 6.4C22 4.4 20.3 2.7 18.3 2.7C17.2 2.7 16.2 3.2 15.5 4C14.8 2.8 13.5 2 12 2Z"
        fill="currentColor"
        className={animate ? "animate-pulse" : ""}
      />
      <circle cx="9" cy="9" r="1" fill="currentColor" className="opacity-70" />
      <circle cx="15" cy="9" r="1" fill="currentColor" className="opacity-70" />
      <circle cx="12" cy="12" r="1" fill="currentColor" className="opacity-70" />
      <circle cx="8" cy="15" r="1" fill="currentColor" className="opacity-70" />
      <circle cx="16" cy="15" r="1" fill="currentColor" className="opacity-70" />
    </svg>
  );
}