import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface ThoughtNode {
  id: string;
  position: THREE.Vector3;
  size: number;
  color: string;
  stage: 'spark' | 'developing' | 'ready' | 'published';
  title: string;
  importance: number;
  connections: string[];
}

interface NeuralNodeProps {
  node: ThoughtNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: (node: ThoughtNode) => void;
  onHover?: (node: ThoughtNode | null) => void;
}

export function NeuralNode({ 
  node, 
  isSelected = false, 
  isHovered = false, 
  onClick, 
  onHover 
}: NeuralNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  const stageColors = {
    spark: '#F59E0B',      // Orange
    developing: '#3B82F6',  // Blue
    ready: '#10B981',       // Green
    published: '#8B5CF6'    // Purple
  };

  const nodeColor = stageColors[node.stage];
  
  useFrame((state, delta) => {
    time.current += delta;
    
    if (meshRef.current) {
      // Gentle pulsing for active thoughts
      const pulseScale = 1 + Math.sin(time.current * 2) * 0.1 * node.importance;
      meshRef.current.scale.setScalar(pulseScale);
      
      // Hover effects
      if (isHovered) {
        meshRef.current.scale.multiplyScalar(1.2);
      }
    }
    
    if (glowRef.current && glowRef.current.material) {
      // Glow intensity based on importance and selection
      const glowIntensity = (node.importance * 0.3 + 0.2) * (isSelected ? 2 : 1);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = glowIntensity;
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    onClick?.(node);
  };

  const handlePointerEnter = () => {
    onHover?.(node);
  };

  const handlePointerLeave = () => {
    onHover?.(null);
  };

  return (
    <group position={node.position}>
      {/* Glow effect */}
      <Sphere ref={glowRef} args={[node.size * 1.5, 16, 16]}>
        <meshBasicMaterial 
          color={nodeColor}
          transparent
          opacity={0.2}
        />
      </Sphere>
      
      {/* Main node */}
      <Sphere 
        ref={meshRef}
        args={[node.size, 32, 32]}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <meshStandardMaterial 
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.6}
        />
      </Sphere>
      
      {/* Node label (shown on hover) */}
      {isHovered && (
        <Text
          position={[0, node.size + 0.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="bottom"
          maxWidth={3}
        >
          {node.title}
        </Text>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <Ring 
          args={[node.size * 1.2, node.size * 1.4, 32]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial 
            color="#FFFFFF"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </Ring>
      )}
    </group>
  );
}

// Ring component for selection indicator
function Ring({ args, rotation, children }: any) {
  const geometry = useMemo(() => {
    const [innerRadius, outerRadius, segments] = args;
    return new THREE.RingGeometry(innerRadius, outerRadius, segments);
  }, [args]);

  return (
    <mesh geometry={geometry} rotation={rotation}>
      {children}
    </mesh>
  );
}

interface BrainLobeProps {
  position: THREE.Vector3;
  size: number;
  color: string;
  opacity?: number;
}

export function BrainLobe({ position, size, color, opacity = 0.3 }: BrainLobeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle breathing effect
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      meshRef.current.scale.setScalar(breathe);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 64, 64]}>
        <meshStandardMaterial 
          color={color}
          transparent
          opacity={opacity}
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>
    </group>
  );
}