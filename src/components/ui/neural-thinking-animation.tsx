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
    sm: { width: 120, height: 120, particles: 12 },
    md: { width: 200, height: 200, particles: 16 },
    lg: { width: 300, height: 300, particles: 20 }
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
    startX: Math.random() * config.width,
    startY: Math.random() * config.height,
    delay: Math.random() * 3000,
  }));

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        className="overflow-visible"
      >
        {/* Background Neural Network */}
        <defs>
          <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
          
          <linearGradient id="pathwayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Central Brain Silhouette */}
        <g transform={`translate(${config.width/2 - 40}, ${config.height/2 - 35})`}>
          <path
            d="M20 15C25 5, 35 5, 40 10C45 5, 55 5, 60 15C65 20, 65 30, 60 35C65 40, 65 50, 55 55C50 60, 40 60, 35 55C30 60, 20 60, 15 55C5 50, 5 40, 10 35C5 30, 5 20, 10 15C15 10, 20 15, 20 15Z"
            fill="url(#brainGlow)"
            className={cn(
              "transition-all duration-1000",
              currentPhase === 3 && "animate-pulse"
            )}
            style={{
              filter: intensity === 'intense' ? 'url(#glow)' : 'none'
            }}
          />
          
          {/* Brain Regions */}
          {/* Frontal Lobe */}
          <circle
            cx="20"
            cy="25"
            r="8"
            fill="hsl(var(--primary))"
            opacity={currentPhase >= 0 ? 0.7 : 0.2}
            className="transition-all duration-500"
          />
          
          {/* Temporal Lobe */}
          <circle
            cx="40"
            cy="35"
            r="6"
            fill="hsl(var(--accent))"
            opacity={currentPhase >= 1 ? 0.7 : 0.2}
            className="transition-all duration-500"
          />
          
          {/* Parietal Lobe */}
          <circle
            cx="55"
            cy="25"
            r="7"
            fill="#F59E0B"
            opacity={currentPhase >= 2 ? 0.8 : 0.2}
            className="transition-all duration-500"
          />
        </g>

        {/* Neural Pathways */}
        <g className="neural-pathways">
          {/* Connecting pathways between brain regions */}
          <path
            d={`M${config.width/2 - 20} ${config.height/2 - 10} Q${config.width/2} ${config.height/2 - 20} ${config.width/2 + 20} ${config.height/2 - 10}`}
            stroke="url(#pathwayGradient)"
            strokeWidth="2"
            fill="none"
            className={cn(
              "transition-all duration-1000",
              currentPhase >= 1 && "animate-pulse"
            )}
            opacity={currentPhase >= 1 ? 0.8 : 0.3}
          />
          
          <path
            d={`M${config.width/2 - 15} ${config.height/2 + 5} Q${config.width/2 + 10} ${config.height/2 + 15} ${config.width/2 + 35} ${config.height/2 + 5}`}
            stroke="url(#pathwayGradient)"
            strokeWidth="2"
            fill="none"
            className={cn(
              "transition-all duration-1000",
              currentPhase >= 2 && "animate-pulse"
            )}
            opacity={currentPhase >= 2 ? 0.8 : 0.3}
          />
        </g>

        {/* Floating Thought Particles */}
        {particles.map((particle) => (
          <circle
            key={particle.id}
            r="2"
            fill="hsl(var(--primary))"
            className="animate-pulse"
            style={{
              filter: 'drop-shadow(0 0 4px hsl(var(--primary)))'
            }}
          >
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="translate"
              values={`${particle.startX},${particle.startY}; ${config.width/2},${config.height/2}; ${particle.startX},${particle.startY}`}
              dur="4s"
              repeatCount="indefinite"
              begin={`${particle.delay}ms`}
            />
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="2s"
              repeatCount="indefinite"
              begin={`${particle.delay}ms`}
            />
          </circle>
        ))}

        {/* Synthesis Burst Effect */}
        {currentPhase === 3 && (
          <g>
            {Array.from({ length: 8 }, (_, i) => (
              <line
                key={i}
                x1={config.width/2}
                y1={config.height/2}
                x2={config.width/2 + Math.cos(i * Math.PI / 4) * 40}
                y2={config.height/2 + Math.sin(i * Math.PI / 4) * 40}
                stroke="#F59E0B"
                strokeWidth="2"
                opacity="0"
                className="animate-pulse"
              >
                <animate
                  attributeName="opacity"
                  values="0;0.8;0"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </line>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}