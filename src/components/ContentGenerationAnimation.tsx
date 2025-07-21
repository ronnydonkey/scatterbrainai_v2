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
import { NeuralAnimation } from './effects/NeuralAnimation';

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
      className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"
    >
      <NeuralAnimation />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Scatterbrain Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">Scatterbrain</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Neural Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Generation</span>
          </h1>
          <p className="text-xl text-gray-600">
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
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <motion.div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ 
                width: `${((currentStageIndex + 1) / stages.length) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-gray-600">
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
      className={`relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 border-0 shadow-xl transition-all duration-500 ${
        isActive 
          ? 'shadow-2xl ring-2 ring-purple-200' 
          : isComplete
          ? 'shadow-2xl ring-2 ring-green-200'
          : 'shadow-lg'
      }`}
    >
      <div className="flex items-start gap-6">
        {/* Status Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
          isComplete 
            ? 'bg-green-100 text-green-600' 
            : isActive 
            ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600' 
            : 'bg-gray-100 text-gray-500'
        }`}>
          {isComplete ? (
            <Check className="w-6 h-6" />
          ) : (
            <Icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {stage.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {stage.description}
          </p>

          {/* Sources */}
          {stage.sources && isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <p className="text-sm font-medium text-gray-600 mb-3">
                Processing sources:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {stage.sources.map((source, index) => (
                  <motion.div
                    key={source}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <ArrowRight className="w-3 h-3 text-purple-600" />
                    {source}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Completed sources summary */}
          {stage.sources && isComplete && (
            <div className="text-sm text-green-600">
              ✓ Processed {stage.sources.length} sources
            </div>
          )}
        </div>
      </div>

      {/* Active stage pulse effect */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-purple-300/50"
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