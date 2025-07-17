import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface NeuralThinkingAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  intensity?: 'subtle' | 'normal' | 'intense';
}

export function NeuralThinkingAnimation({ 
  size = 'md', 
  className,
  intensity = 'normal'
}: NeuralThinkingAnimationProps) {
  const [currentPhase, setCurrentPhase] = useState(0);

  const sizeConfig = {
    sm: { size: 120, particles: 8 },
    md: { size: 200, particles: 12 },
    lg: { size: 300, particles: 16 }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setCurrentPhase(prev => (prev + 1) % 4);
    }, 1500);

    return () => clearInterval(phaseInterval);
  }, []);

  // Generate particle positions
  const particles = Array.from({ length: config.particles }, (_, i) => ({
    id: i,
    startX: Math.random() * 160 + 20,
    startY: Math.random() * 160 + 20,
    delay: Math.random() * 2,
  }));

  return (
    <div className={cn("relative inline-block", className)}>
      <div 
        className="relative rounded-full flex items-center justify-center"
        style={{ 
          width: config.size, 
          height: config.size,
          background: 'radial-gradient(circle, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 70%, transparent 100%)'
        }}
      >
        <svg
          width={config.size}
          height={config.size}
          viewBox="0 0 200 200"
          className="absolute inset-0"
        >
          <defs>
            <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.8)" />
              <stop offset="70%" stopColor="rgba(59, 130, 246, 0.6)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </radialGradient>
            
            <filter id="neuralGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="particleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Brain silhouette with neural pathways */}
          <g transform="translate(50, 60)">
            <path
              d="M50 10C65 10 80 20 85 35C90 25 95 28 98 40C101 52 98 64 95 75C98 86 95 97 90 105C85 118 70 125 55 125C40 125 25 118 20 105C15 97 12 86 15 75C12 64 15 52 18 40C21 28 26 25 31 35C36 20 50 10 50 10Z"
              fill="none"
              stroke="rgba(139, 92, 246, 0.8)"
              strokeWidth="2"
              filter="url(#neuralGlow)"
              className={`${currentPhase === 2 ? 'animate-pulse' : ''}`}
            />
            
            {/* Neural pathways within brain */}
            <path d="M25 45 Q50 35 75 45" fill="none" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="1.5" filter="url(#neuralGlow)" className={`${currentPhase === 0 ? 'opacity-100' : 'opacity-40'}`} />
            <path d="M30 65 Q50 55 70 65" fill="none" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="1.5" filter="url(#neuralGlow)" className={`${currentPhase === 1 ? 'opacity-100' : 'opacity-40'}`} />
            <path d="M35 85 Q50 75 65 85" fill="none" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="1.5" filter="url(#neuralGlow)" className={`${currentPhase === 2 ? 'opacity-100' : 'opacity-40'}`} />
            
            {/* Brain regions - neural nodes */}
            <circle cx="35" cy="45" r="4" fill="url(#brainGlow)" filter="url(#particleGlow)" className={`${currentPhase === 0 ? 'animate-pulse opacity-100' : 'opacity-60'}`} />
            <circle cx="65" cy="45" r="4" fill="url(#brainGlow)" filter="url(#particleGlow)" className={`${currentPhase === 1 ? 'animate-pulse opacity-100' : 'opacity-60'}`} />
            <circle cx="50" cy="65" r="5" fill="url(#brainGlow)" filter="url(#particleGlow)" className={`${currentPhase === 2 ? 'animate-pulse opacity-100' : 'opacity-60'}`} />
            <circle cx="40" cy="85" r="3" fill="url(#brainGlow)" filter="url(#particleGlow)" className={`${currentPhase === 0 ? 'animate-pulse opacity-100' : 'opacity-60'}`} />
            <circle cx="60" cy="85" r="3" fill="url(#brainGlow)" filter="url(#particleGlow)" className={`${currentPhase === 1 ? 'animate-pulse opacity-100' : 'opacity-60'}`} />
          </g>

          {/* External neural pathways */}
          <g>
            <path d="M60 80 Q100 60 140 80" fill="none" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="2" filter="url(#neuralGlow)" className={`${currentPhase === 0 ? 'opacity-100' : 'opacity-30'}`} />
            <path d="M60 120 Q100 140 140 120" fill="none" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="2" filter="url(#neuralGlow)" className={`${currentPhase === 1 ? 'opacity-100' : 'opacity-30'}`} />
            <path d="M80 60 Q100 100 120 140" fill="none" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#neuralGlow)" className={`${currentPhase === 2 ? 'opacity-100' : 'opacity-30'}`} />
            <path d="M120 60 Q100 100 80 140" fill="none" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" filter="url(#neuralGlow)" className={`${currentPhase === 0 ? 'opacity-100' : 'opacity-30'}`} />
          </g>

          {/* Thought particles */}
          {particles.map((particle, index) => (
            <circle
              key={index}
              r="1.5"
              fill="rgba(251, 191, 36, 0.8)"
              filter="url(#particleGlow)"
              className="animate-pulse"
            >
              <animateMotion
                dur={`${4 + index}s`}
                repeatCount="indefinite"
                path={`M${particle.startX} ${particle.startY} Q${particle.startX + 50} ${particle.startY - 30} ${particle.startX + 100} ${particle.startY + 20} Q${particle.startX + 150} ${particle.startY + 70} ${particle.startX + 200} ${particle.startY + 50}`}
                begin={`${particle.delay}s`}
              />
            </circle>
          ))}

        {/* Synthesis burst effect */}
        {currentPhase === 3 && (
          <g>
            {Array.from({ length: 8 }, (_, i) => (
              <line
                key={i}
                x1="100"
                y1="100"
                x2={100 + Math.cos(i * Math.PI / 4) * 60}
                y2={100 + Math.sin(i * Math.PI / 4) * 60}
                stroke="rgba(251, 191, 36, 0.8)"
                strokeWidth="2"
                filter="url(#neuralGlow)"
                className="animate-pulse"
              >
                <animate
                  attributeName="opacity"
                  values="0;0.9;0"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </line>
            ))}
          </g>
        )}
        </svg>
      </div>
    </div>
  );
}