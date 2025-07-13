import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeuralIconProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

// Brain Icon Component
export const BrainIcon = ({ size = 24, className, animate = true }: NeuralIconProps) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-cosmic-accent", className)}
      animate={animate ? {
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8]
      } : undefined}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <path
        d="M12 2C10.5 2 9.2 2.8 8.5 4C7.5 3.5 6.3 3.7 5.5 4.5C4.7 5.3 4.5 6.5 5 7.5C3.8 8.2 3 9.5 3 11C3 12.5 3.8 13.8 5 14.5C4.5 15.5 4.7 16.7 5.5 17.5C6.3 18.3 7.5 18.5 8.5 18C9.2 19.2 10.5 20 12 20C13.5 20 14.8 19.2 15.5 18C16.5 18.5 17.7 18.3 18.5 17.5C19.3 16.7 19.5 15.5 19 14.5C20.2 13.8 21 12.5 21 11C21 9.5 20.2 8.2 19 7.5C19.5 6.5 19.3 5.3 18.5 4.5C17.7 3.7 16.5 3.5 15.5 4C14.8 2.8 13.5 2 12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="url(#brainGradient)"
      />
      <circle cx="9" cy="9" r="1" fill="currentColor" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="15" cy="9" r="1" fill="currentColor" opacity="0.6">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="12" cy="13" r="1" fill="currentColor" opacity="0.6">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <defs>
        <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--cosmic-accent))" stopOpacity="0.2" />
          <stop offset="50%" stopColor="hsl(var(--cosmic-glow))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--cosmic-accent))" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
};

// Neural Network Icon
export const NeuralNetworkIcon = ({ size = 24, className, animate = true }: NeuralIconProps) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-cosmic-accent", className)}
      animate={animate ? {
        rotate: [0, 360]
      } : undefined}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {/* Neural connections */}
      <path
        d="M4 8L8 12L4 16"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
        strokeDasharray="2,2"
      >
        <animate attributeName="stroke-dashoffset" values="0;4" dur="2s" repeatCount="indefinite" />
      </path>
      <path
        d="M16 8L20 12L16 16"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
        strokeDasharray="2,2"
      >
        <animate attributeName="stroke-dashoffset" values="4;0" dur="2s" repeatCount="indefinite" />
      </path>
      <path
        d="M8 12L16 12"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
        strokeDasharray="1,1"
      >
        <animate attributeName="stroke-dashoffset" values="0;2" dur="1s" repeatCount="indefinite" />
      </path>
      
      {/* Neural nodes */}
      <circle cx="4" cy="8" r="2" fill="currentColor" opacity="0.8">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="4" cy="16" r="2" fill="currentColor" opacity="0.8">
        <animate attributeName="r" values="2;1;2" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.9">
        <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="20" cy="8" r="2" fill="currentColor" opacity="0.8">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="20" cy="16" r="2" fill="currentColor" opacity="0.8">
        <animate attributeName="r" values="2;1;2" dur="3s" repeatCount="indefinite" />
      </circle>
    </motion.svg>
  );
};

// Synapse Icon
export const SynapseIcon = ({ size = 24, className, animate = true }: NeuralIconProps) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-cosmic-accent", className)}
    >
      <path
        d="M3 12C3 12 6 8 12 12C18 16 21 12 21 12"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="3" cy="12" r="2" fill="currentColor">
        {animate && (
          <animate attributeName="r" values="1.5;3;1.5" dur="2s" repeatCount="indefinite" />
        )}
      </circle>
      <circle cx="21" cy="12" r="2" fill="currentColor">
        {animate && (
          <animate attributeName="r" values="3;1.5;3" dur="2s" repeatCount="indefinite" />
        )}
      </circle>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.7">
        {animate && (
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        )}
      </circle>
      
      {/* Electrical pulse effect */}
      {animate && (
        <circle cx="6" cy="11" r="1" fill="currentColor" opacity="0">
          <animate attributeName="cx" values="3;21" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
    </motion.svg>
  );
};

// Neural Pulse Loader
export const NeuralPulseLoader = ({ size = 40, className }: NeuralIconProps) => {
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 40 40" className="animate-pulse">
        <defs>
          <radialGradient id="neuralPulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--cosmic-accent))" stopOpacity="0.8" />
            <stop offset="70%" stopColor="hsl(var(--cosmic-glow))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Center core */}
        <circle cx="20" cy="20" r="3" fill="hsl(var(--cosmic-accent))">
          <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
        </circle>
        
        {/* Pulse rings */}
        <circle cx="20" cy="20" r="8" fill="none" stroke="hsl(var(--cosmic-accent))" strokeWidth="1" opacity="0.6">
          <animate attributeName="r" values="5;15;5" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="20" cy="20" r="12" fill="none" stroke="hsl(var(--cosmic-glow))" strokeWidth="1" opacity="0.4">
          <animate attributeName="r" values="8;20;8" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="4s" repeatCount="indefinite" />
        </circle>
        
        {/* Neural connections */}
        <g opacity="0.5">
          <line x1="20" y1="8" x2="20" y2="32" stroke="hsl(var(--cosmic-accent))" strokeWidth="1" strokeDasharray="2,2">
            <animate attributeName="stroke-dashoffset" values="0;4" dur="2s" repeatCount="indefinite" />
          </line>
          <line x1="8" y1="20" x2="32" y2="20" stroke="hsl(var(--cosmic-accent))" strokeWidth="1" strokeDasharray="2,2">
            <animate attributeName="stroke-dashoffset" values="4;0" dur="2s" repeatCount="indefinite" />
          </line>
        </g>
      </svg>
    </div>
  );
};

// Connection Lines Component
interface ConnectionLinesProps {
  startElement: string;
  endElement: string;
  className?: string;
}

export const ConnectionLines = ({ startElement, endElement, className }: ConnectionLinesProps) => {
  return (
    <svg className={cn("absolute inset-0 pointer-events-none z-0", className)} style={{ zIndex: -1 }}>
      <defs>
        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--cosmic-accent))" stopOpacity="0.6" />
          <stop offset="50%" stopColor="hsl(var(--cosmic-glow))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--cosmic-accent))" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      
      {/* Neural pathway */}
      <path
        d="M20,20 Q60,10 120,40 T200,30"
        stroke="url(#connectionGradient)"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4,4"
        opacity="0.4"
      >
        <animate attributeName="stroke-dashoffset" values="0;8" dur="3s" repeatCount="indefinite" />
      </path>
      
      {/* Signal pulse */}
      <circle r="3" fill="hsl(var(--cosmic-accent))" opacity="0.8">
        <animateMotion dur="3s" repeatCount="indefinite">
          <mpath href="#connectionPath" />
        </animateMotion>
      </circle>
    </svg>
  );
};

// Thought Cluster Visualization
export const ThoughtCluster = ({ thoughts = 5, className }: { thoughts?: number; className?: string }) => {
  const nodes = Array.from({ length: thoughts }, (_, i) => ({
    id: i,
    x: 50 + (Math.cos((i * 2 * Math.PI) / thoughts) * 30),
    y: 50 + (Math.sin((i * 2 * Math.PI) / thoughts) * 30),
  }));

  return (
    <div className={cn("relative w-24 h-24", className)}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="thoughtGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--cosmic-accent))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--cosmic-glow))" stopOpacity="0.3" />
          </radialGradient>
        </defs>
        
        {/* Connections between nodes */}
        {nodes.map((node, i) => 
          nodes.slice(i + 1).map((otherNode, j) => (
            <line
              key={`${i}-${j}`}
              x1={node.x}
              y1={node.y}
              x2={otherNode.x}
              y2={otherNode.y}
              stroke="hsl(var(--cosmic-accent))"
              strokeWidth="0.5"
              opacity="0.3"
              strokeDasharray="1,1"
            >
              <animate 
                attributeName="stroke-dashoffset" 
                values="0;2" 
                dur={`${2 + Math.random()}s`} 
                repeatCount="indefinite" 
              />
            </line>
          ))
        )}
        
        {/* Central node */}
        <circle
          cx="50"
          cy="50"
          r="4"
          fill="url(#thoughtGradient)"
        >
          <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" />
        </circle>
        
        {/* Surrounding nodes */}
        {nodes.map((node, i) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r="2"
            fill="hsl(var(--cosmic-accent))"
            opacity="0.7"
          >
            <animate 
              attributeName="r" 
              values="1.5;3;1.5" 
              dur={`${2 + i * 0.5}s`} 
              repeatCount="indefinite" 
            />
          </circle>
        ))}
      </svg>
    </div>
  );
};