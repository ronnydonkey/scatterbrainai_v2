import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Zap, 
  Star,
  Users,
  Lightbulb,
  Crown,
  ArrowRight,
  CheckCircle,
  Lock
} from 'lucide-react';
import { useThoughts } from '@/hooks/api/useThoughts';
import { useInterestProfiler } from '@/hooks/useInterestProfiler';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface IntelligenceLevel {
  level: string;
  name: string;
  description: string;
  icon: React.ComponentType<{className?: string}>;
  features: string[];
  minThoughts: number;
  color: string;
  gradient: string;
}

const INTELLIGENCE_LEVELS: IntelligenceLevel[] = [
  {
    level: 'basic',
    name: 'Getting Started',
    description: 'Building your foundation with encouraging, clear analysis',
    icon: Brain,
    features: [
      'Basic thought analysis',
      'Encouraging feedback',
      'Simple content suggestions',
      'Getting started guidance'
    ],
    minThoughts: 0,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    level: 'enhanced',
    name: 'Enhanced Analysis',
    description: 'Learning your interests and providing personalized insights',
    icon: Lightbulb,
    features: [
      'Interest-aware analysis',
      'Personal connections',
      'Enhanced content suggestions',
      'Growth opportunities',
      'Writing style adaptation'
    ],
    minThoughts: 4,
    color: 'text-green-600',
    gradient: 'from-green-500 to-green-600'
  },
  {
    level: 'adaptive',
    name: 'Adaptive Intelligence',
    description: 'Pattern recognition with strategic, personalized recommendations',
    icon: Target,
    features: [
      'Advanced pattern recognition',
      'Personalized content suite',
      'Strategic insights',
      'Cross-platform optimization',
      'Community recommendations',
      'Thought evolution tracking'
    ],
    minThoughts: 11,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    level: 'genius',
    name: 'Genius Mode',
    description: 'Maximum intelligence with thought leadership and strategic analysis',
    icon: Crown,
    features: [
      'Meta-cognitive analysis',
      'Thought leadership positioning',
      'Sophisticated content strategy',
      'Innovation opportunity detection',
      'Strategic influence expansion',
      'Predictive insights',
      'Expert networking suggestions',
      'Knowledge monetization strategies'
    ],
    minThoughts: 25,
    color: 'text-gold-600',
    gradient: 'from-yellow-500 to-orange-500'
  }
];

interface AdaptiveIntelligenceProps {
  onAnalyze?: (thoughtId: string) => void;
  className?: string;
}

export const AdaptiveIntelligence: React.FC<AdaptiveIntelligenceProps> = ({ 
  onAnalyze, 
  className = "" 
}) => {
  const { user } = useAuth();
  const { data: thoughts } = useThoughts();
  const { profile, hasProfile } = useInterestProfiler();
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

  const thoughtCount = thoughts?.length || 0;
  
  // Determine current intelligence level
  const currentLevel = INTELLIGENCE_LEVELS
    .slice()
    .reverse()
    .find(level => thoughtCount >= level.minThoughts) || INTELLIGENCE_LEVELS[0];
  
  const nextLevel = INTELLIGENCE_LEVELS.find(level => level.minThoughts > thoughtCount);
  
  // Calculate progress to next level
  const progress = nextLevel 
    ? Math.min((thoughtCount / nextLevel.minThoughts) * 100, 100)
    : 100;

  const thoughtsToNext = nextLevel ? nextLevel.minThoughts - thoughtCount : 0;

  // Trigger adaptive analysis for a thought
  const triggerAdaptiveAnalysis = async (thoughtId: string) => {
    if (!user) return;

    setAnalyzing(thoughtId);
    
    try {
      const { data, error } = await supabase.functions.invoke('adaptive-analysis', {
        body: {
          thoughtId,
          content: thoughts?.find(t => t.id === thoughtId)?.content || '',
          userId: user.id
        }
      });

      if (error) throw error;

      if (data.success) {
        setLastAnalysis(data);
        toast({
          title: `🧠 ${currentLevel.name} Analysis Complete!`,
          description: `Intelligence Level: ${data.intelligence_level} | Features: ${data.adaptive_features.length}`,
        });
        
        if (onAnalyze) {
          onAnalyze(thoughtId);
        }
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Adaptive analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze thought",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Intelligence Level */}
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${currentLevel.gradient} opacity-5`} />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${currentLevel.gradient}`}>
                <currentLevel.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className={`${currentLevel.color} text-xl`}>
                  {currentLevel.name}
                </CardTitle>
                <CardDescription>
                  {currentLevel.description}
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`${currentLevel.color} border-current`}
            >
              Level {INTELLIGENCE_LEVELS.indexOf(currentLevel) + 1}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress to next level */}
          {nextLevel && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress to {nextLevel.name}</span>
                <span className="text-muted-foreground">
                  {thoughtCount}/{nextLevel.minThoughts} thoughts
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Add {thoughtsToNext} more thought{thoughtsToNext !== 1 ? 's' : ''} to unlock {nextLevel.name}!
              </p>
            </div>
          )}

          {/* Current level features */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Active Intelligence Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentLevel.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Personalization status */}
          {hasProfile && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  🎯 Personalization Active
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Analysis is tailored to your {profile.primaryInterests[0]?.category} interests
                {profile.primaryInterests.length > 1 && ` and ${profile.primaryInterests.length - 1} other area${profile.primaryInterests.length > 2 ? 's' : ''}`}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intelligence Level Progression */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Intelligence Progression
          </CardTitle>
          <CardDescription>
            Your AI becomes smarter as you add more thoughts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {INTELLIGENCE_LEVELS.map((level, index) => {
              const isUnlocked = thoughtCount >= level.minThoughts;
              const isCurrent = level.level === currentLevel.level;
              
              return (
                <div 
                  key={level.level}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                    isCurrent 
                      ? `border-current ${level.color} bg-gradient-to-r ${level.gradient} bg-opacity-5` 
                      : isUnlocked 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    isCurrent 
                      ? `bg-gradient-to-br ${level.gradient}` 
                      : isUnlocked 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                  }`}>
                    {isUnlocked ? (
                      <level.icon className="h-4 w-4 text-white" />
                    ) : (
                      <Lock className="h-4 w-4 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${isCurrent ? level.color : isUnlocked ? 'text-green-700' : 'text-gray-500'}`}>
                        {level.name}
                      </h4>
                      {isCurrent && (
                        <Badge variant="outline" className="text-xs">
                          ACTIVE
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${isCurrent ? 'text-gray-700' : isUnlocked ? 'text-green-600' : 'text-gray-400'}`}>
                      {level.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isUnlocked 
                        ? `Unlocked with ${level.minThoughts}+ thoughts`
                        : `Requires ${level.minThoughts} thoughts (${level.minThoughts - thoughtCount} more needed)`
                      }
                    </p>
                  </div>
                  
                  {isCurrent && (
                    <Sparkles className={`h-5 w-5 ${level.color} animate-pulse`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent adaptive analysis results */}
      {lastAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Latest Adaptive Analysis
            </CardTitle>
            <CardDescription>
              Results from your {lastAnalysis.intelligence_level} level analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Intelligence Level:</span>
                <p className="text-muted-foreground capitalize">{lastAnalysis.intelligence_level}</p>
              </div>
              <div>
                <span className="font-medium">Thought Count:</span>
                <p className="text-muted-foreground">{lastAnalysis.thought_count}</p>
              </div>
              <div>
                <span className="font-medium">Active Features:</span>
                <p className="text-muted-foreground">{lastAnalysis.adaptive_features?.length || 0}</p>
              </div>
              <div>
                <span className="font-medium">Progress:</span>
                <p className="text-muted-foreground">{lastAnalysis.progression_status?.level}</p>
              </div>
            </div>
            
            {lastAnalysis.progression_status?.unlockSoon && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  🚀 {lastAnalysis.progression_status.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Try adaptive analysis button */}
      {thoughts && thoughts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Try Adaptive Analysis
            </CardTitle>
            <CardDescription>
              Experience your current intelligence level on a recent thought
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {thoughts.slice(0, 3).map((thought) => (
                <div key={thought.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {thought.title || thought.content.slice(0, 50) + '...'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(thought.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => triggerAdaptiveAnalysis(thought.id)}
                    disabled={analyzing === thought.id}
                    className="ml-3"
                  >
                    {analyzing === thought.id ? (
                      <Brain className="h-4 w-4 animate-pulse" />
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};