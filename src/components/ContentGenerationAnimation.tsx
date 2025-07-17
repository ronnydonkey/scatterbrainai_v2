import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Search, 
  FileText, 
  Zap, 
  Globe, 
  BookOpen, 
  Target, 
  Sparkles,
  Check,
  ArrowRight
} from 'lucide-react';

interface ContentGenerationAnimationProps {
  isVisible: boolean;
  selectedFormats: string[];
  onComplete?: () => void;
}

interface ProcessingStage {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  sources?: string[];
  status: 'pending' | 'active' | 'complete';
  duration: number;
}

const formatIcons = {
  blog_post: FileText,
  newsletter: FileText,
  twitter_thread: Globe,
  linkedin_article: Target,
  instagram_carousel: FileText,
  youtube_script: FileText
};

export const ContentGenerationAnimation: React.FC<ContentGenerationAnimationProps> = ({
  isVisible,
  selectedFormats,
  onComplete
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stages, setStages] = useState<ProcessingStage[]>([]);

  useEffect(() => {
    if (isVisible) {
      const initialStages: ProcessingStage[] = [
        {
          id: 'analysis',
          title: 'Analyzing Core Insights',
          description: 'Extracting key themes and patterns from your thoughts',
          icon: Brain,
          status: 'active',
          duration: 2000,
          sources: ['Original thought pattern', 'Semantic analysis', 'Concept mapping']
        },
        {
          id: 'research',
          title: 'Gathering Research Sources',
          description: 'Finding relevant data and supporting information',
          icon: Search,
          status: 'pending',
          duration: 3000,
          sources: [
            '🔴 Reddit - Community discussions & sentiment',
            '🔴 Reddit - Niche subreddit trends & insights', 
            '📊 Google Trends - Search patterns',
            '🔍 Perplexity - Real-time research',
            '📰 Industry publications',
            '💼 Expert insights & case studies'
          ]
        },
        {
          id: 'strategy',
          title: 'Content Strategy Planning',
          description: 'Tailoring content approach for each format',
          icon: Target,
          status: 'pending',
          duration: 2500,
          sources: [
            'Audience analysis',
            'Platform best practices',
            'Engagement optimization',
            'Voice & tone guidelines'
          ]
        },
        {
          id: 'generation',
          title: 'Generating Content Suite',
          description: `Creating ${selectedFormats.length} content format${selectedFormats.length > 1 ? 's' : ''}`,
          icon: Sparkles,
          status: 'pending',
          duration: 4000,
          sources: selectedFormats.map(format => 
            format.replace('_', ' ').split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')
          )
        }
      ];

      setStages(initialStages);
      setCurrentStageIndex(0);

      // Auto-progress through stages
      let stageTimer: NodeJS.Timeout;
      const progressStages = (index: number) => {
        if (index < initialStages.length) {
          setStages(prev => prev.map((stage, i) => ({
            ...stage,
            status: i < index ? 'complete' : i === index ? 'active' : 'pending'
          })));

          stageTimer = setTimeout(() => {
            if (index === initialStages.length - 1) {
              // Complete final stage
              setStages(prev => prev.map(stage => ({
                ...stage,
                status: 'complete'
              })));
              
              // Wait a moment then complete
              setTimeout(() => {
                onComplete?.();
              }, 1000);
            } else {
              progressStages(index + 1);
            }
          }, initialStages[index].duration);
        }
      };

      progressStages(0);

      return () => {
        if (stageTimer) clearTimeout(stageTimer);
      };
    }
  }, [isVisible, selectedFormats, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      {/* Background Neural Network Animation - matching the style */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Neural pathways background */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.8)" />
              <stop offset="50%" stopColor="rgba(139, 92, 246, 0.4)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Network connections */}
          {[...Array(15)].map((_, i) => (
            <motion.line
              key={i}
              x1={Math.random() * 100 + '%'}
              y1={Math.random() * 100 + '%'}
              x2={Math.random() * 100 + '%'}
              y2={Math.random() * 100 + '%'}
              stroke="rgba(139, 92, 246, 0.3)"
              strokeWidth="1"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.7, 0] }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
          {/* Neural nodes */}
          {[...Array(20)].map((_, i) => (
            <motion.circle
              key={i}
              cx={Math.random() * 100 + '%'}
              cy={Math.random() * 100 + '%'}
              r="2"
              fill="url(#nodeGlow)"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1, 1.5, 0] }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            />
          ))}
        </svg>
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              boxShadow: '0 0 6px rgba(59, 130, 246, 0.8)'
            }}
            animate={{
              x: [0, Math.random() * 200 - 100, 0],
              y: [0, Math.random() * 200 - 100, 0],
              opacity: [0, 1, 0.5, 1, 0]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent mb-4">
            Neural Content Generation
          </h1>
          <p className="text-xl text-gray-300">
            Transforming your insights into a complete content ecosystem
          </p>
        </motion.div>

        {/* Processing Stages */}
        <div className="space-y-8">
          {stages.map((stage, index) => (
            <StageCard
              key={stage.id}
              stage={stage}
              isActive={index === currentStageIndex}
              isComplete={stage.status === 'complete'}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12"
        >
          <div className="w-full bg-gray-700/50 rounded-full h-2 mb-4">
            <motion.div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ 
                width: `${((currentStageIndex + 1) / stages.length) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-gray-400">
            Stage {currentStageIndex + 1} of {stages.length}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

interface StageCardProps {
  stage: ProcessingStage;
  isActive: boolean;
  isComplete: boolean;
}

const StageCard: React.FC<StageCardProps> = ({ stage, isActive, isComplete }) => {
  const Icon = stage.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ 
        opacity: isActive || isComplete ? 1 : 0.4,
        x: 0,
        scale: isActive ? 1.02 : 1
      }}
      className={`relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-500 ${
        isActive 
          ? 'border-primary/50 shadow-lg shadow-primary/20' 
          : isComplete
          ? 'border-green-500/50 shadow-lg shadow-green-500/20'
          : 'border-white/20'
      }`}
    >
      <div className="flex items-start gap-6">
        {/* Status Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
          isComplete 
            ? 'bg-green-500/20 text-green-400' 
            : isActive 
            ? 'bg-primary/20 text-primary' 
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {isComplete ? (
            <Check className="w-6 h-6" />
          ) : (
            <Icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          <h3 className="text-xl font-semibold text-white mb-2">
            {stage.title}
          </h3>
          <p className="text-gray-300 mb-4">
            {stage.description}
          </p>

          {/* Sources */}
          {stage.sources && isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <p className="text-sm font-medium text-gray-400 mb-3">
                Processing sources:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {stage.sources.map((source, index) => (
                  <motion.div
                    key={source}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 rounded-lg px-3 py-2"
                  >
                    <ArrowRight className="w-3 h-3 text-primary" />
                    {source}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Completed sources summary */}
          {stage.sources && isComplete && (
            <div className="text-sm text-green-400">
              ✓ Processed {stage.sources.length} sources
            </div>
          )}
        </div>
      </div>

      {/* Active stage pulse effect */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-primary/30"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );
};