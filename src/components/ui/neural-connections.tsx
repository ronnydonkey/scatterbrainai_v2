import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface NeuralConnectionsProps {
  className?: string;
  density?: 'low' | 'medium' | 'high';
  animated?: boolean;
}

export const NeuralConnections = ({ 
  className, 
  density = 'medium', 
  animated = true 
}: NeuralConnectionsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getNodeCount = () => {
    switch (density) {
      case 'low': return 6;
      case 'medium': return 12;
      case 'high': return 20;
      default: return 12;
    }
  };

  const nodeCount = getNodeCount();
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: i,
    x: Math.random() * (dimensions.width - 20) + 10,
    y: Math.random() * (dimensions.height - 20) + 10,
    pulse: Math.random() * 2 + 1, // Pulse duration
  }));

  const connections = nodes.reduce((acc, node, i) => {
    // Connect each node to 2-4 nearby nodes
    const nearbyNodes = nodes
      .filter((other, j) => {
        if (i === j) return false;
        const distance = Math.sqrt(
          Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2)
        );
        return distance < Math.min(dimensions.width, dimensions.height) * 0.3;
      })
      .slice(0, Math.floor(Math.random() * 3) + 2);

    nearbyNodes.forEach(targetNode => {
      acc.push({
        from: node,
        to: targetNode,
        id: `${node.id}-${targetNode.id}`,
      });
    });

    return acc;
  }, [] as Array<{ from: typeof nodes[0]; to: typeof nodes[0]; id: string }>);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return <div ref={containerRef} className={cn("absolute inset-0 pointer-events-none", className)} />;
  }

  return (
    <div ref={containerRef} className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
        style={{ zIndex: -1 }}
      >
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--cosmic-accent))" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(var(--cosmic-glow))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--cosmic-accent))" stopOpacity="0.3" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Neural connections */}
        {connections.map((connection, i) => (
          <motion.line
            key={connection.id}
            x1={connection.from.x}
            y1={connection.from.y}
            x2={connection.to.x}
            y2={connection.to.y}
            stroke="url(#connectionGradient)"
            strokeWidth="1"
            strokeDasharray="2,4"
            opacity="0.4"
            initial={{ pathLength: 0 }}
            animate={animated ? { 
              pathLength: [0, 1, 0],
              opacity: [0.2, 0.6, 0.2]
            } : { pathLength: 1 }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Neural nodes */}
        {nodes.map((node, i) => (
          <g key={node.id}>
            {/* Node glow */}
            <circle
              cx={node.x}
              cy={node.y}
              r="6"
              fill="hsl(var(--cosmic-accent))"
              opacity="0.2"
              filter="url(#glow)"
            >
              {animated && (
                <animate
                  attributeName="r"
                  values="4;8;4"
                  dur={`${node.pulse}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
            
            {/* Node core */}
            <circle
              cx={node.x}
              cy={node.y}
              r="2"
              fill="hsl(var(--cosmic-accent))"
              opacity="0.8"
            >
              {animated && (
                <animate
                  attributeName="r"
                  values="1.5;3;1.5"
                  dur={`${node.pulse * 1.5}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>

            {/* Signal pulse */}
            {animated && Math.random() > 0.7 && (
              <circle
                cx={node.x}
                cy={node.y}
                r="1"
                fill="hsl(var(--cosmic-glow))"
                opacity="0"
              >
                <animate
                  attributeName="r"
                  values="1;10;1"
                  dur="3s"
                  repeatCount="indefinite"
                  begin={`${Math.random() * 3}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0;0.8;0"
                  dur="3s"
                  repeatCount="indefinite"
                  begin={`${Math.random() * 3}s`}
                />
              </circle>
            )}
          </g>
        ))}

        {/* Traveling signals */}
        {animated && connections.slice(0, 3).map((connection, i) => (
          <circle
            key={`signal-${connection.id}`}
            r="2"
            fill="hsl(var(--cosmic-glow))"
            opacity="0.8"
          >
            <animateMotion
              dur={`${3 + Math.random() * 2}s`}
              repeatCount="indefinite"
              begin={`${i * 1.5}s`}
            >
              <mpath>
                <path d={`M${connection.from.x},${connection.from.y} L${connection.to.x},${connection.to.y}`} />
              </mpath>
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur={`${3 + Math.random() * 2}s`}
              repeatCount="indefinite"
              begin={`${i * 1.5}s`}
            />
          </circle>
        ))}
      </svg>
    </div>
  );
};

// Card Neural Border Component
export const NeuralBorder = ({ children, className, active = false }: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) => {
  return (
    <div className={cn("relative group", className)}>
      {/* Neural border effect */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <div className={cn(
          "absolute inset-0 border-2 rounded-lg transition-all duration-500",
          active 
            ? "border-cosmic-accent/60 shadow-lg shadow-cosmic-accent/20" 
            : "border-cosmic-accent/20 group-hover:border-cosmic-accent/40"
        )}>
          {/* Animated neural pathway around border */}
          <svg className="absolute inset-0 w-full h-full" style={{ filter: 'blur(0.5px)' }}>
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="6"
              fill="none"
              stroke="hsl(var(--cosmic-glow))"
              strokeWidth="1"
              strokeDasharray="4,8"
              opacity="0.5"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;12"
                dur="4s"
                repeatCount="indefinite"
              />
            </rect>
          </svg>
        </div>
        
        {/* Corner neural nodes */}
        <div className="absolute top-0 left-0 w-2 h-2 -translate-x-1 -translate-y-1">
          <div className="w-full h-full bg-cosmic-accent rounded-full animate-pulse" />
        </div>
        <div className="absolute top-0 right-0 w-2 h-2 translate-x-1 -translate-y-1">
          <div className="w-full h-full bg-cosmic-glow rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        <div className="absolute bottom-0 left-0 w-2 h-2 -translate-x-1 translate-y-1">
          <div className="w-full h-full bg-cosmic-glow rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-0 right-0 w-2 h-2 translate-x-1 translate-y-1">
          <div className="w-full h-full bg-cosmic-accent rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};