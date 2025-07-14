import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Ring } from '@react-three/drei';
import * as THREE from 'three';

interface NeuralLoadingProps {
  position?: [number, number, number];
  scale?: number;
}

export function NeuralLoading({ position = [0, 0, 0], scale = 1 }: NeuralLoadingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
    
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 2;
    }
    
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y += delta * 1.5;
    }
    
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += delta * 1.8;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Central core */}
      <Sphere args={[0.3, 32, 32]}>
        <meshStandardMaterial 
          color="#8B5CF6" 
          emissive="#4C1D95" 
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </Sphere>
      
      {/* Rotating rings */}
      <Ring ref={ring1Ref} args={[0.8, 1, 64]}>
        <meshStandardMaterial 
          color="#60A5FA" 
          transparent 
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </Ring>
      
      <Ring ref={ring2Ref} args={[1.2, 1.4, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial 
          color="#34D399" 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </Ring>
      
      <Ring ref={ring3Ref} args={[1.6, 1.8, 64]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial 
          color="#F59E0B" 
          transparent 
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </Ring>
      
      {/* Orbital particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Sphere 
          key={i} 
          args={[0.05, 8, 8]} 
          position={[
            Math.cos((i / 8) * Math.PI * 2) * 2,
            Math.sin((i / 8) * Math.PI * 2) * 0.5,
            Math.sin((i / 8) * Math.PI * 2) * 2
          ]}
        >
          <meshStandardMaterial 
            color="#EC4899" 
            emissive="#BE185D" 
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
    </group>
  );
}