import React from 'react';
import { cn } from '@/lib/utils';

interface NeuralAmbientBackgroundProps {
  className?: string;
  intensity?: 'minimal' | 'subtle' | 'normal';
}

export function NeuralAmbientBackground({ 
  className,
  intensity = 'subtle'
}: NeuralAmbientBackgroundProps) {
  const particleCount = {
    minimal: 8,
    subtle: 12,
    normal: 16
  }[intensity];

  const opacity = {
    minimal: 0.05,
    subtle: 0.08,
    normal: 0.12
  }[intensity];

  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
  }));

  return (
    <div className={cn(
      "fixed inset-0 pointer-events-none overflow-hidden",
      className
    )}>
      <svg
        className="w-full h-full"
        style={{ opacity }}
      >
        <defs>
          <radialGradient id="neuralParticle" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {particles.map((particle) => (
          <circle
            key={particle.id}
            r={particle.size}
            fill="url(#neuralParticle)"
            className="animate-pulse"
          >
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="translate"
              values={`${particle.x}vw,${particle.y}vh; ${particle.x + 20}vw,${particle.y - 15}vh; ${particle.x}vw,${particle.y}vh`}
              dur={`${particle.duration}s`}
              repeatCount="indefinite"
              begin={`${particle.delay}s`}
            />
            <animate
              attributeName="opacity"
              values="0.2;0.8;0.2"
              dur={`${particle.duration / 2}s`}
              repeatCount="indefinite"
              begin={`${particle.delay}s`}
            />
          </circle>
        ))}

        {/* Subtle neural connection lines */}
        {Array.from({ length: Math.floor(particleCount / 3) }, (_, i) => {
          const x1 = Math.random() * 100;
          const y1 = Math.random() * 100;
          const x2 = Math.random() * 100;
          const y2 = Math.random() * 100;
          
          return (
            <line
              key={`line-${i}`}
              x1={`${x1}vw`}
              y1={`${y1}vh`}
              x2={`${x2}vw`}
              y2={`${y2}vh`}
              stroke="hsl(var(--primary))"
              strokeWidth="0.5"
              opacity="0.15"
            >
              <animate
                attributeName="opacity"
                values="0.05;0.25;0.05"
                dur={`${15 + Math.random() * 10}s`}
                repeatCount="indefinite"
                begin={`${Math.random() * 5}s`}
              />
            </line>
          );
        })}
      </svg>
    </div>
  );
}