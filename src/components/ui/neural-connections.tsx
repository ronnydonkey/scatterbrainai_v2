import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Connection {
  from: THREE.Vector3;
  to: THREE.Vector3;
  strength: number;
  active: boolean;
}

interface NeuralConnectionsProps {
  connections: Connection[];
  pulseSpeed?: number;
}

export function NeuralConnections({ connections, pulseSpeed = 1 }: NeuralConnectionsProps) {
  const linesRef = useRef<THREE.Group>(null);
  const pulsesRef = useRef<THREE.Points>(null);
  const time = useRef(0);

  // Generate pulse particles
  const pulseParticles = useMemo(() => {
    const positions = new Float32Array(connections.length * 3);
    const colors = new Float32Array(connections.length * 3);
    
    connections.forEach((connection, i) => {
      // Start each pulse at the beginning of its connection
      positions[i * 3] = connection.from.x;
      positions[i * 3 + 1] = connection.from.y;
      positions[i * 3 + 2] = connection.from.z;
      
      // Color based on connection strength
      const intensity = connection.strength;
      colors[i * 3] = 0.3 + intensity * 0.7; // R
      colors[i * 3 + 1] = 0.5 + intensity * 0.5; // G
      colors[i * 3 + 2] = 1.0; // B
    });
    
    return { positions, colors };
  }, [connections]);

  useFrame((state, delta) => {
    time.current += delta * pulseSpeed;
    
    if (pulsesRef.current) {
      const positions = pulsesRef.current.geometry.attributes.position.array as Float32Array;
      
      connections.forEach((connection, i) => {
        if (!connection.active) return;
        
        // Calculate pulse position along the connection
        const progress = (Math.sin(time.current * 2 + i * 0.5) + 1) * 0.5;
        const x = connection.from.x + (connection.to.x - connection.from.x) * progress;
        const y = connection.from.y + (connection.to.y - connection.from.y) * progress;
        const z = connection.from.z + (connection.to.z - connection.from.z) * progress;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      });
      
      pulsesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Connection Lines */}
      <group ref={linesRef}>
        {connections.map((connection, i) => {
          const points = [connection.from, connection.to];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          
          return (
            <line key={i} geometry={geometry}>
              <lineBasicMaterial 
                color={connection.active ? "#8B5CF6" : "#4C1D95"} 
                opacity={connection.strength * 0.6 + 0.2}
                transparent
              />
            </line>
          );
        })}
      </group>
      
      {/* Pulse Particles */}
      <points ref={pulsesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connections.length}
            array={pulseParticles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={connections.length}
            array={pulseParticles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </group>
  );
}