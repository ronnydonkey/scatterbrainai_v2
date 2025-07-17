import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface NeuralBrainVisualizationProps {
  className?: string;
  insightCount?: number;
}

export const NeuralBrainVisualization: React.FC<NeuralBrainVisualizationProps> = ({
  className,
  insightCount = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Neural network nodes representing thoughts/insights
    const nodes: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      connections: number[];
      pulse: number;
      brightness: number;
    }> = [];

    // Brain regions based on your taxonomy
    const brainRegions = [
      { name: 'frontal', centerX: 0.7, centerY: 0.4, color: '#ff6b6b' }, // Red-orange
      { name: 'parietal', centerX: 0.5, centerY: 0.3, color: '#4ecdc4' }, // Teal
      { name: 'temporal', centerX: 0.3, centerY: 0.6, color: '#45b7d1' }, // Blue
      { name: 'occipital', centerX: 0.2, centerY: 0.4, color: '#96ceb4' }, // Green
      { name: 'cerebellum', centerX: 0.15, centerY: 0.8, color: '#ffeaa7' }, // Yellow
    ];

    // Create nodes based on insight count
    const nodeCount = Math.max(8, Math.min(insightCount * 2, 25));
    
    for (let i = 0; i < nodeCount; i++) {
      const region = brainRegions[i % brainRegions.length];
      const angle = (i / nodeCount) * Math.PI * 2;
      const distance = Math.random() * 60 + 20;
      
      nodes.push({
        x: region.centerX * 400 + Math.cos(angle) * distance,
        y: region.centerY * 200 + Math.sin(angle) * distance,
        radius: Math.random() * 3 + 2,
        color: region.color,
        connections: [],
        pulse: Math.random() * Math.PI * 2,
        brightness: 0.3 + Math.random() * 0.7
      });
    }

    // Create connections between nearby nodes
    nodes.forEach((node, i) => {
      nodes.forEach((otherNode, j) => {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
          );
          if (distance < 80 && node.connections.length < 3) {
            node.connections.push(j);
          }
        }
      });
    });

    let time = 0;

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

      // Draw brain outline (simplified)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Brain shape outline
      ctx.ellipse(200, 100, 180, 90, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Draw connections with flowing energy
      nodes.forEach((node, i) => {
        node.connections.forEach(connectionIndex => {
          const targetNode = nodes[connectionIndex];
          if (!targetNode) return;

          const gradient = ctx.createLinearGradient(node.x, node.y, targetNode.x, targetNode.y);
          const alpha = 0.3 + 0.3 * Math.sin(time * 2 + i);
          
          gradient.addColorStop(0, `${node.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
          gradient.addColorStop(1, `${targetNode.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1 + Math.sin(time * 3 + i) * 0.5;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          
          // Curved connection line
          const midX = (node.x + targetNode.x) / 2;
          const midY = (node.y + targetNode.y) / 2 - 20;
          ctx.quadraticCurveTo(midX, midY, targetNode.x, targetNode.y);
          ctx.stroke();

          // Flowing particles along connections
          const progress = (time * 2 + i) % 1;
          const particleX = node.x + (targetNode.x - node.x) * progress;
          const particleY = node.y + (targetNode.y - node.y) * progress - 20 * Math.sin(Math.PI * progress);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(particleX, particleY, 1, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // Draw nodes with pulsing effect
      nodes.forEach((node, i) => {
        const pulseSize = 1 + 0.3 * Math.sin(time * 4 + node.pulse);
        const radius = node.radius * pulseSize;
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 3);
        glowGradient.addColorStop(0, `${node.color}40`);
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Main node
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(node.x - radius * 0.3, node.y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Sparks and floating particles
      for (let i = 0; i < 5; i++) {
        const sparkX = Math.random() * 400;
        const sparkY = Math.random() * 200;
        const sparkLife = (time * 3 + i) % 1;
        const alpha = Math.sin(sparkLife * Math.PI);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 1 + sparkLife * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [insightCount]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Overlay content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            Neural Highway
          </div>
          <div className="text-lg text-muted-foreground">
            {insightCount} thoughts connected
          </div>
        </div>
      </div>
    </div>
  );
};