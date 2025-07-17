import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ThinkingStatusLabelsProps {
  className?: string;
  messages?: string[];
  interval?: number;
}

const defaultMessages = [
  "Gathering scattered thoughts...",
  "Finding hidden connections...",
  "Illuminating patterns...",
  "Weaving insights together...",
  "Sparking new understanding..."
];

export function ThinkingStatusLabels({ 
  className, 
  messages = defaultMessages,
  interval = 2500 
}: ThinkingStatusLabelsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 200);
    }, interval);

    return () => clearInterval(messageInterval);
  }, [messages.length, interval]);

  return (
    <div className={cn(
      "flex items-center justify-center min-h-[2rem]",
      className
    )}>
      <p className={cn(
        "text-center text-sm font-medium bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent transition-all duration-200",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}>
        {messages[currentIndex]}
      </p>
    </div>
  );
}