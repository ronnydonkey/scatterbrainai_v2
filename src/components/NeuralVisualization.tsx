import { Suspense, useState, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Html
} from '@react-three/drei';
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
  content: string;
  tags: string[];
  createdAt: Date;
}

interface NeuralVisualizationProps {
  thoughts?: ThoughtNode[];
  onNodeSelect?: (node: ThoughtNode) => void;
  onNodeHover?: (node: ThoughtNode | null) => void;
  viewMode?: '3d-brain' | '2d-network' | 'timeline' | 'clusters';
  searchTerm?: string;
  filters?: {
    stage?: string[];
    dateRange?: [Date, Date];
    tags?: string[];
  };
}

// Generate sample thought data
function generateSampleThoughts(): ThoughtNode[] {
  const thoughts: ThoughtNode[] = [];
  const stages: Array<'spark' | 'developing' | 'ready' | 'published'> = 
    ['spark', 'developing', 'ready', 'published'];
  
  const titles = [
    'AI Content Strategy', 'Neural Network Marketing', 'Creative Automation',
    'Brand Voice Analysis', 'Trend Prediction Model', 'Content Performance AI',
    'Social Media Intelligence', 'Creative Process Optimization', 'Audience Insights',
    'Viral Content Patterns', 'Engagement Algorithms', 'Creative Workflow AI'
  ];

  for (let i = 0; i < 50; i++) {
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const importance = Math.random();
    
    thoughts.push({
      id: `thought-${i}`,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 20
      ),
      size: 0.2 + importance * 0.3,
      color: stage === 'spark' ? '#F59E0B' : 
             stage === 'developing' ? '#3B82F6' :
             stage === 'ready' ? '#10B981' : '#8B5CF6',
      stage,
      title: titles[Math.floor(Math.random() * titles.length)],
      importance,
      connections: [],
      content: `This is a detailed thought about ${titles[Math.floor(Math.random() * titles.length)]}`,
      tags: ['ai', 'creativity', 'marketing'].slice(0, Math.floor(Math.random() * 3) + 1),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    });
  }

  // Generate connections
  thoughts.forEach((thought, i) => {
    const numConnections = Math.floor(Math.random() * 5);
    for (let j = 0; j < numConnections; j++) {
      const targetIndex = Math.floor(Math.random() * thoughts.length);
      if (targetIndex !== i) {
        thought.connections.push(thoughts[targetIndex].id);
      }
    }
  });

  return thoughts;
}

// Scene component with all 3D elements
function NeuralScene({ 
  thoughts, 
  onNodeSelect, 
  onNodeHover, 
  viewMode = '3d-brain',
  searchTerm = '',
  filters = {}
}: NeuralVisualizationProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const { camera } = useThree();

  // Filter thoughts based on search and filters
  const filteredThoughts = useMemo(() => {
    return thoughts?.filter(thought => {
      // Search filter
      if (searchTerm && !thought.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Stage filter
      if (filters.stage?.length && !filters.stage.includes(thought.stage)) {
        return false;
      }
      
      // Date filter
      if (filters.dateRange) {
        const [start, end] = filters.dateRange;
        if (thought.createdAt < start || thought.createdAt > end) {
          return false;
        }
      }
      
      // Tags filter
      if (filters.tags?.length) {
        const hasMatchingTag = filters.tags.some(tag => 
          thought.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }
      
      return true;
    }) || [];
  }, [thoughts, searchTerm, filters]);

  // Generate connections between filtered thoughts
  const connections = useMemo(() => {
    const conns: Array<{
      from: THREE.Vector3;
      to: THREE.Vector3;
      strength: number;
      active: boolean;
    }> = [];

    filteredThoughts.forEach(thought => {
      thought.connections.forEach(connId => {
        const targetThought = filteredThoughts.find(t => t.id === connId);
        if (targetThought) {
          conns.push({
            from: thought.position.clone(),
            to: targetThought.position.clone(),
            strength: (thought.importance + targetThought.importance) / 2,
            active: thought.stage === 'developing' || targetThought.stage === 'developing'
          });
        }
      });
    });

    return conns;
  }, [filteredThoughts]);

  const handleNodeClick = useCallback((node: ThoughtNode) => {
    setSelectedNode(node.id);
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  const handleNodeHover = useCallback((node: ThoughtNode | null) => {
    setHoveredNode(node?.id || null);
    onNodeHover?.(node);
  }, [onNodeHover]);

  // Brain lobes for context
  const brainLobes = useMemo(() => [
    { position: new THREE.Vector3(-3, 2, 0), size: 4, color: '#4C1D95', name: 'Creative' },
    { position: new THREE.Vector3(3, 2, 0), size: 4, color: '#1E40AF', name: 'Analytical' },
    { position: new THREE.Vector3(0, -1, 2), size: 3, color: '#059669', name: 'Memory' },
    { position: new THREE.Vector3(0, 1, -3), size: 3.5, color: '#DC2626', name: 'Emotional' }
  ], []);

  console.log('NeuralScene render - filteredThoughts:', filteredThoughts.length);

  return (
    <>
      {/* Basic lighting only */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* Simple test mesh to verify Canvas works */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
    </>
  );
}

export default function NeuralVisualization(props: NeuralVisualizationProps) {
  const sampleThoughts = useMemo(() => generateSampleThoughts(), []);
  const thoughts = props.thoughts || sampleThoughts;

  console.log('NeuralVisualization render - thoughts count:', thoughts.length);

  return (
    <div className="w-full h-full relative">
      <Canvas
        className="neural-canvas"
        camera={{ position: [0, 5, 15], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        onCreated={() => console.log('Canvas created successfully')}
        onError={(error) => console.error('Canvas error:', error)}
      >
        <Suspense fallback={
          <Html center>
            <div style={{ color: 'white' }}>Loading Neural Network...</div>
          </Html>
        }>
          <NeuralScene {...props} thoughts={thoughts} />
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border/20">
          <div className="text-sm text-muted-foreground">
            {thoughts.length} thoughts • {props.searchTerm ? 'Filtered' : 'All'}
          </div>
        </div>
      </div>
      
      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border/20">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>🖱️ Drag to rotate • Scroll to zoom</div>
            <div>⌨️ WASD to navigate • Click nodes to inspect</div>
          </div>
        </div>
      </div>
    </div>
  );
}