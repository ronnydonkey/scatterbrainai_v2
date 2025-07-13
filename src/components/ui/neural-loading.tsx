import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeuralLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const NeuralLoading = ({ size = 'md', className, text }: NeuralLoadingProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const sizes = {
    sm: 32,
    md: 48,
    lg: 64
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg width={sizes[size]} height={sizes[size]} viewBox="0 0 100 100" className="absolute inset-0">
          <defs>
            <radialGradient id="neuralGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--cosmic-accent))" stopOpacity="0.8" />
              <stop offset="70%" stopColor="hsl(var(--cosmic-glow))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="synapseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--cosmic-accent))" />
              <stop offset="50%" stopColor="hsl(var(--cosmic-glow))" />
              <stop offset="100%" stopColor="hsl(var(--cosmic-accent))" />
            </linearGradient>
          </defs>
          
          {/* Central neural core */}
          <circle cx="50" cy="50" r="8" fill="url(#neuralGlow)">
            <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
          </circle>
          
          {/* Neural pathways */}
          <g opacity="0.6">
            {/* Horizontal pathway */}
            <path
              d="M15,50 Q35,30 50,50 Q65,70 85,50"
              stroke="url(#synapseGradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4,4"
            >
              <animate attributeName="stroke-dashoffset" values="0;8" dur="1.5s" repeatCount="indefinite" />
            </path>
            
            {/* Vertical pathway */}
            <path
              d="M50,15 Q30,35 50,50 Q70,65 50,85"
              stroke="url(#synapseGradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4,4"
            >
              <animate attributeName="stroke-dashoffset" values="8;0" dur="1.5s" repeatCount="indefinite" />
            </path>
            
            {/* Diagonal pathways */}
            <path
              d="M25,25 Q40,40 50,50 Q60,60 75,75"
              stroke="url(#synapseGradient)"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="3,3"
              opacity="0.7"
            >
              <animate attributeName="stroke-dashoffset" values="0;6" dur="2s" repeatCount="indefinite" />
            </path>
            <path
              d="M75,25 Q60,40 50,50 Q40,60 25,75"
              stroke="url(#synapseGradient)"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="3,3"
              opacity="0.7"
            >
              <animate attributeName="stroke-dashoffset" values="6;0" dur="2s" repeatCount="indefinite" />
            </path>
          </g>
          
          {/* Neural nodes */}
          <circle cx="15" cy="50" r="3" fill="hsl(var(--cosmic-accent))">
            <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="85" cy="50" r="3" fill="hsl(var(--cosmic-accent))">
            <animate attributeName="r" values="4;2;4" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="15" r="3" fill="hsl(var(--cosmic-glow))">
            <animate attributeName="r" values="2;4;2" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="85" r="3" fill="hsl(var(--cosmic-glow))">
            <animate attributeName="r" values="4;2;4" dur="2.5s" repeatCount="indefinite" />
          </circle>
          
          {/* Signal pulses */}
          <circle r="2" fill="hsl(var(--cosmic-accent))" opacity="0.8">
            <animateMotion dur="3s" repeatCount="indefinite">
              <mpath href="#path1" />
            </animateMotion>
          </circle>
          
          {/* Hidden paths for animation */}
          <defs>
            <path id="path1" d="M15,50 Q35,30 50,50 Q65,70 85,50" />
          </defs>
          
          {/* Electrical sparks */}
          <g opacity="0.4">
            <circle cx="25" cy="40" r="1" fill="hsl(var(--cosmic-accent))">
              <animate attributeName="opacity" values="0;1;0" dur="0.5s" repeatCount="indefinite" begin="0s" />
            </circle>
            <circle cx="70" cy="60" r="1" fill="hsl(var(--cosmic-glow))">
              <animate attributeName="opacity" values="0;1;0" dur="0.7s" repeatCount="indefinite" begin="0.3s" />
            </circle>
            <circle cx="60" cy="30" r="1" fill="hsl(var(--cosmic-accent))">
              <animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite" begin="0.6s" />
            </circle>
          </g>
        </svg>
      </div>
      
      {text && (
        <motion.p 
          className="text-sm text-cosmic-muted font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Synaptic Loading Bar
export const SynapticLoadingBar = ({ progress = 0, className }: { progress?: number; className?: string }) => {
  return (
    <div className={cn("w-full h-3 bg-cosmic-void/20 rounded-full overflow-hidden relative", className)}>
      <div className="absolute inset-0 rounded-full border border-cosmic-accent/20" />
      
      {/* Progress fill with neural pattern */}
      <div 
        className="h-full bg-gradient-to-r from-cosmic-accent to-cosmic-glow relative rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      >
        {/* Neural pulse overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        
        {/* Electrical activity */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full opacity-80">
          <div className="absolute inset-0 bg-white rounded-full animate-ping" />
        </div>
      </div>
      
      {/* Neural sparks along the track */}
      <div className="absolute top-1/2 transform -translate-y-1/2 w-full">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cosmic-accent rounded-full"
            style={{ left: `${i * 20 + 10}%` }}
          >
            <div 
              className="absolute inset-0 bg-cosmic-accent rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Processing Neural Animation
export const ProcessingNeural = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 border-2 border-cosmic-accent/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-cosmic-accent border-t-transparent rounded-full animate-spin" />
        <div className="absolute inset-2 bg-cosmic-accent/20 rounded-full animate-pulse" />
      </div>
      
      <div className="flex space-x-1">
        {Array.from({ length: 3 }, (_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-cosmic-accent rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
      
      <span className="text-sm text-cosmic-muted font-medium">Neural processing...</span>
    </div>
  );
};