import { useState, useEffect, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Sphere, Line } from "@react-three/drei";
import { Vector3 } from "three";
import { Search, Brain, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useThoughts } from "@/hooks/api/useThoughts";
import { motion } from "framer-motion";
import * as THREE from "three";

// Brain regions with their 3D positions and colors
const BRAIN_REGIONS = {
  frontalLobe: {
    position: [0, 2, 1] as [number, number, number],
    color: "#8B5CF6", // Purple for creativity/planning
    label: "Frontal Lobe",
    description: "Planning & Creativity"
  },
  parietalLobe: {
    position: [-2, 1, 0] as [number, number, number],
    color: "#06B6D4", // Cyan for processing
    label: "Parietal Lobe", 
    description: "Processing & Analysis"
  },
  temporalLobe: {
    position: [2, 0, 0] as [number, number, number],
    color: "#F59E0B", // Amber for memory
    label: "Temporal Lobe",
    description: "Memory & Learning"
  },
  occipitalLobe: {
    position: [0, -1, -1] as [number, number, number],
    color: "#EF4444", // Red for insights
    label: "Occipital Lobe",
    description: "Insights & Vision"
  },
  brainStem: {
    position: [0, -2, 0] as [number, number, number],
    color: "#10B981", // Green for core thoughts
    label: "Brain Stem",
    description: "Core Thoughts"
  }
};

// Auto-categorize thoughts into brain regions based on content
const categorizeMood = (mood: string | null, content: string): keyof typeof BRAIN_REGIONS => {
  const lowerContent = content.toLowerCase();
  const lowerMood = mood?.toLowerCase() || "";
  
  // Frontal Lobe: Planning, creativity, goals, ideas
  if (lowerContent.includes("plan") || lowerContent.includes("goal") || 
      lowerContent.includes("idea") || lowerContent.includes("create") ||
      lowerMood.includes("inspired") || lowerMood.includes("creative")) {
    return "frontalLobe";
  }
  
  // Temporal Lobe: Memory, learning, experiences
  if (lowerContent.includes("remember") || lowerContent.includes("learn") ||
      lowerContent.includes("experience") || lowerContent.includes("past") ||
      lowerMood.includes("nostalgic") || lowerMood.includes("reflective")) {
    return "temporalLobe";
  }
  
  // Parietal Lobe: Analysis, processing, problem-solving
  if (lowerContent.includes("analyze") || lowerContent.includes("process") ||
      lowerContent.includes("solve") || lowerContent.includes("understand") ||
      lowerMood.includes("focused") || lowerMood.includes("analytical")) {
    return "parietalLobe";
  }
  
  // Occipital Lobe: Insights, realizations, vision
  if (lowerContent.includes("realize") || lowerContent.includes("insight") ||
      lowerContent.includes("vision") || lowerContent.includes("see") ||
      lowerMood.includes("enlightened") || lowerMood.includes("clear")) {
    return "occipitalLobe";
  }
  
  // Default to brain stem for fundamental thoughts
  return "brainStem";
};

// Thought Node Component with sparking animation for new thoughts
const ThoughtNode = ({ thought, position, region, isNew = false }: { 
  thought: any, 
  position: [number, number, number],
  region: keyof typeof BRAIN_REGIONS,
  isNew?: boolean
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [sparkles, setSparkles] = useState(isNew);
  
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
    }
    
    // Sparkling effect for new thoughts
    if (isNew) {
      const timer = setTimeout(() => setSparkles(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [position, isNew]);

  return (
    <group>
      <Sphere
        ref={meshRef}
        args={[0.1, 16, 16]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.5 : sparkles ? [1.2, 1.2, 1.2] : 1}
      >
        <meshStandardMaterial 
          color={BRAIN_REGIONS[region].color}
          emissive={sparkles ? "#FFFFFF" : hovered ? BRAIN_REGIONS[region].color : "#000000"}
          emissiveIntensity={sparkles ? 0.8 : hovered ? 0.3 : 0.1}
        />
      </Sphere>
      
      {/* Sparkling particles for new thoughts */}
      {sparkles && (
        <>
          {[...Array(8)].map((_, i) => (
            <Sphere
              key={i}
              args={[0.02, 8, 8]}
              position={[
                position[0] + (Math.random() - 0.5) * 0.5,
                position[1] + (Math.random() - 0.5) * 0.5,
                position[2] + (Math.random() - 0.5) * 0.5
              ]}
            >
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1} />
            </Sphere>
          ))}
        </>
      )}
      
      {hovered && (
        <Text
          position={[position[0], position[1] + 0.3, position[2]]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {thought.title || thought.content.substring(0, 30) + "..."}
        </Text>
      )}
    </group>
  );
};

// Neural Connection Component with brainwave animation
const NeuralConnection = ({ start, end, strength = 1, animated = false }: {
  start: [number, number, number],
  end: [number, number, number],
  strength?: number,
  animated?: boolean
}) => {
  const points = [new Vector3(...start), new Vector3(...end)];
  
  return (
    <Line
      points={points}
      color={animated ? "#4F46E5" : "#6366F1"}
      lineWidth={strength * (animated ? 3 : 2)}
      transparent
      opacity={0.3 + (strength * 0.4)}
    />
  );
};

// Brain Region Component with pulsing effect
const BrainRegion = ({ region, data, thoughtCount }: { 
  region: keyof typeof BRAIN_REGIONS, 
  data: typeof BRAIN_REGIONS[keyof typeof BRAIN_REGIONS],
  thoughtCount: number
}) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (meshRef.current && thoughtCount > 0) {
      // Gentle pulsing based on thought activity
      const animate = () => {
        if (meshRef.current) {
          const scale = 1 + Math.sin(Date.now() * 0.002) * 0.1;
          meshRef.current.scale.set(scale, scale, scale);
        }
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, [thoughtCount]);
  
  return (
    <group>
      <Sphere
        ref={meshRef}
        position={data.position}
        args={[0.5, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={data.color}
          transparent
          opacity={thoughtCount > 0 ? 0.3 : 0.1}
          wireframe={hovered}
        />
      </Sphere>
      
      <Text
        position={[data.position[0], data.position[1] + 0.7, data.position[2]]}
        fontSize={0.12}
        color={data.color}
        anchorX="center"
        anchorY="middle"
      >
        {data.label}
      </Text>
      
      <Text
        position={[data.position[0], data.position[1] + 0.5, data.position[2]]}
        fontSize={0.06}
        color="#888"
        anchorX="center"
        anchorY="middle"
      >
        {data.description}
      </Text>
      
      {thoughtCount > 0 && (
        <Text
          position={[data.position[0], data.position[1] - 0.7, data.position[2]]}
          fontSize={0.08}
          color={data.color}
          anchorX="center"
          anchorY="middle"
        >
          {thoughtCount} thoughts
        </Text>
      )}
    </group>
  );
};

// Main Neural Network Scene
const NeuralNetworkScene = ({ thoughts }: { thoughts: any[] }) => {
  // Categorize thoughts by brain region
  const categorizedThoughts = thoughts.reduce((acc, thought) => {
    const region = categorizeMood(thought.mood, thought.content);
    if (!acc[region]) acc[region] = [];
    acc[region].push(thought);
    return acc;
  }, {} as Record<keyof typeof BRAIN_REGIONS, any[]>);

  // Generate positions for thoughts within each region
  const thoughtPositions = Object.entries(categorizedThoughts).reduce((acc, [region, regionThoughts]) => {
    const basePos = BRAIN_REGIONS[region as keyof typeof BRAIN_REGIONS].position;
    const thoughts = regionThoughts as any[];
    thoughts.forEach((thought, index) => {
      // Scatter thoughts around the region center in a neural cluster pattern
      const angle = (index / thoughts.length) * 2 * Math.PI;
      const radius = 0.3 + (index % 3) * 0.15;
      const height = Math.sin(angle * 3) * 0.2;
      const position: [number, number, number] = [
        basePos[0] + Math.cos(angle) * radius,
        basePos[1] + height,
        basePos[2] + Math.sin(angle) * radius * 0.5
      ];
      acc[thought.id] = { position, region: region as keyof typeof BRAIN_REGIONS };
    });
    return acc;
  }, {} as Record<string, { position: [number, number, number], region: keyof typeof BRAIN_REGIONS }>);

  // Determine which thoughts are "new" (created in last 24 hours)
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const newThoughts = thoughts.filter(thought => 
    new Date(thought.created_at).getTime() > dayAgo
  );

  return (
    <>
      {/* Lighting setup for dramatic neural effect */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} color="#4F46E5" />
      <pointLight position={[-10, 5, -5]} intensity={0.4} color="#8B5CF6" />
      <pointLight position={[10, -5, 5]} intensity={0.3} color="#06B6D4" />

      {/* Brain Regions */}
      {Object.entries(BRAIN_REGIONS).map(([region, data]) => {
        const thoughtCount = categorizedThoughts[region as keyof typeof BRAIN_REGIONS]?.length || 0;
        return (
          <BrainRegion 
            key={region} 
            region={region as keyof typeof BRAIN_REGIONS} 
            data={data}
            thoughtCount={thoughtCount}
          />
        );
      })}

      {/* Thought Nodes */}
      {thoughts.map((thought) => {
        const thoughtData = thoughtPositions[thought.id];
        if (!thoughtData) return null;
        
        const isNew = newThoughts.includes(thought);
        
        return (
          <ThoughtNode
            key={thought.id}
            thought={thought}
            position={thoughtData.position}
            region={thoughtData.region}
            isNew={isNew}
          />
        );
      })}

      {/* Inter-region neural highways */}
      {Object.entries(BRAIN_REGIONS).map(([region1, data1]) => {
        return Object.entries(BRAIN_REGIONS).map(([region2, data2]) => {
          if (region1 >= region2) return null; // Avoid duplicates
          
          const count1 = categorizedThoughts[region1 as keyof typeof BRAIN_REGIONS]?.length || 0;
          const count2 = categorizedThoughts[region2 as keyof typeof BRAIN_REGIONS]?.length || 0;
          
          if (count1 > 0 && count2 > 0) {
            const strength = Math.min(count1, count2) / Math.max(count1, count2, 1);
            return (
              <NeuralConnection
                key={`highway-${region1}-${region2}`}
                start={data1.position}
                end={data2.position}
                strength={strength}
                animated={strength > 0.5}
              />
            );
          }
          return null;
        });
      })}

      {/* Neural connections between related thoughts */}
      {thoughts.map((thought) => {
        const thoughtData = thoughtPositions[thought.id];
        if (!thoughtData) return null;

        // Find related thoughts (same tags, similar content, or same mood)
        const relatedThoughts = thoughts.filter(t => {
          if (t.id === thought.id) return false;
          
          // Strong connection: shared tags
          if (t.tags?.some(tag => thought.tags?.includes(tag))) return true;
          
          // Medium connection: same mood
          if (t.mood === thought.mood && thought.mood) return true;
          
          // Weak connection: similar keywords
          const getKeywords = (content: string) => 
            content.toLowerCase().split(' ').filter(word => word.length > 4);
          const thoughtKeywords = getKeywords(thought.content);
          const otherKeywords = getKeywords(t.content);
          const sharedKeywords = thoughtKeywords.filter(kw => otherKeywords.includes(kw));
          
          return sharedKeywords.length > 1;
        });

        return relatedThoughts.slice(0, 3).map((relatedThought) => {
          const relatedData = thoughtPositions[relatedThought.id];
          if (!relatedData) return null;

          // Calculate connection strength
          let strength = 0.3; // Base strength
          if (relatedThought.tags?.some(tag => thought.tags?.includes(tag))) strength += 0.4;
          if (relatedThought.mood === thought.mood) strength += 0.2;
          
          const isActive = newThoughts.includes(thought) || newThoughts.includes(relatedThought);
          
          return (
            <NeuralConnection
              key={`${thought.id}-${relatedThought.id}`}
              start={thoughtData.position}
              end={relatedData.position}
              strength={strength}
              animated={isActive}
            />
          );
        });
      })}

      {/* Camera controls with smooth movement */}
      <OrbitControls 
        enableZoom={true} 
        enablePan={true} 
        enableRotate={true}
        autoRotate={thoughts.length > 5}
        autoRotateSpeed={0.5}
        maxDistance={12}
        minDistance={3}
      />
    </>
  );
};

const InsightGallery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const { data: thoughts = [], isLoading } = useThoughts();

  const filters = ["All", "Frontal Lobe", "Parietal Lobe", "Temporal Lobe", "Occipital Lobe", "Brain Stem"];

  const filteredThoughts = thoughts.filter(thought => {
    if (selectedFilter === "All") return true;
    const region = categorizeMood(thought.mood, thought.content);
    return BRAIN_REGIONS[region].label === selectedFilter;
  });

  const searchedThoughts = filteredThoughts.filter(thought =>
    thought.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thought.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thought.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-purple-500/20 backdrop-blur-xl bg-slate-900/50">
        <div className="text-center space-y-3">
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Brain className="w-10 h-10 text-purple-400" />
            Neural Highway System
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Zap className="w-8 h-8 text-yellow-400" />
            </motion.div>
          </motion.h1>
          <p className="text-gray-300 text-lg">
            Your living thought network • {thoughts.length} neural pathways mapped • {Object.keys(BRAIN_REGIONS).filter(region => 
              thoughts.some(t => categorizeMood(t.mood, t.content) === region)
            ).length}/{Object.keys(BRAIN_REGIONS).length} brain regions active
          </p>
        </div>

        <div className="flex gap-4 items-center max-w-6xl mx-auto mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Navigate your neural pathways..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (
              <Badge
                key={filter}
                variant={selectedFilter === filter ? "default" : "secondary"}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedFilter === filter 
                    ? "bg-purple-600 hover:bg-purple-700 text-white" 
                    : "bg-slate-700/50 hover:bg-purple-600/20 text-gray-300 hover:text-white"
                }`}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Neural Network Visualization */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Brain className="w-16 h-16 text-purple-400 mx-auto" />
              </motion.div>
              <p className="text-gray-300 text-lg">Mapping neural pathways...</p>
              <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : thoughts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center">
                <Brain className="w-16 h-16 text-purple-400" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-purple-400/30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-white">Neural Network Awaiting Input</h3>
              <p className="text-gray-300 max-w-md text-lg">
                Start capturing thoughts to watch your digital brain come alive with sparkling neural connections, 
                growing from medulla oblongata to frontal cortex.
              </p>
            </div>
            
            <Button className="group bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-3 text-lg">
              <Sparkles className="w-5 h-5 mr-3 group-hover:animate-pulse" />
              Spark Your First Neural Pathway
            </Button>
          </div>
        ) : (
          <Canvas
            camera={{ position: [6, 4, 6], fov: 60 }}
            style={{ 
              background: 'radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.1) 0%, rgba(0, 0, 0, 0.9) 50%, #000000 100%)'
            }}
          >
            <Suspense fallback={null}>
              <NeuralNetworkScene thoughts={searchedThoughts} />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* Neural Activity Stats */}
      {thoughts.length > 0 && (
        <motion.div 
          className="p-4 border-t border-purple-500/20 bg-slate-900/80 backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-center gap-8 text-sm">
            {Object.entries(BRAIN_REGIONS).map(([region, data]) => {
              const count = thoughts.filter(t => categorizeMood(t.mood, t.content) === region).length;
              const percentage = thoughts.length > 0 ? Math.round((count / thoughts.length) * 100) : 0;
              
              return (
                <div key={region} className="flex items-center gap-3 text-gray-300">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full animate-pulse" 
                      style={{ backgroundColor: data.color }}
                    />
                    <span className="font-medium">{data.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{count}</div>
                    <div className="text-xs text-gray-400">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InsightGallery;