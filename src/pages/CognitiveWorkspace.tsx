import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Crown, Eye, Zap, TrendingUp, MessageSquare, 
  Lightbulb, Target, Users, Sparkles, ArrowRight, Wand2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { EnhancedThoughtCapture } from '@/components/EnhancedThoughtCapture';
import { BoardOfDirectors } from '@/components/board/BoardOfDirectors';
import { EnhancedInsightGallery } from '@/components/gallery/EnhancedInsightGallery';
import { ContentMultiplier } from '@/components/content/ContentMultiplier';
import { NeuralAmbientBackground } from '@/components/ui/neural-ambient-background';
import { useAuth } from '@/hooks/useAuth';
import { type Advisor } from '@/data/advisorsDirectory';

interface CognitiveWorkspaceProps {
  // Optional props for customization
}

export default function CognitiveWorkspace() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'capture' | 'board' | 'gallery' | 'content'>('capture');
  const [advisoryBoard, setAdvisoryBoard] = useState<Advisor[]>([]);
  const [recentInsights, setRecentInsights] = useState<any[]>([]);
  const [workspaceStats, setWorkspaceStats] = useState({
    totalThoughts: 0,
    boardSize: 0,
    insightsGenerated: 0,
    streakDays: 0
  });

  // Load user data and stats
  useEffect(() => {
    loadWorkspaceData();
  }, [user]);

  const loadWorkspaceData = async () => {
    // Simulate loading workspace data
    // In real implementation, this would fetch from your API
    setTimeout(() => {
      setWorkspaceStats({
        totalThoughts: 47,
        boardSize: advisoryBoard.length,
        insightsGenerated: 156,
        streakDays: 12
      });
    }, 1000);
  };

  const handleThoughtCapture = async (thought: string, advisors?: Advisor[]) => {
    // Process thought with advisory board
    toast.success('Thought captured and processed!');
    
    // Update stats
    setWorkspaceStats(prev => ({
      ...prev,
      totalThoughts: prev.totalThoughts + 1,
      insightsGenerated: prev.insightsGenerated + (advisors?.length || 1)
    }));

    // Add to recent insights (mock)
    const newInsight = {
      id: Date.now().toString(),
      title: `Insight from ${new Date().toLocaleDateString()}`,
      content: thought.substring(0, 100) + '...',
      timestamp: new Date().toISOString(),
      topics: ['Recent'],
      mood: 'positive' as const,
      complexity: Math.floor(Math.random() * 10) + 1,
      advisors: advisors?.map(a => ({
        name: a.name,
        avatar: a.avatar,
        tier: a.tier,
        insight: `${a.name}'s perspective on your thought...`
      }))
    };
    
    setRecentInsights(prev => [newInsight, ...prev.slice(0, 4)]);
  };

  const handleBoardUpdate = (board: Advisor[]) => {
    setAdvisoryBoard(board);
    setWorkspaceStats(prev => ({ ...prev, boardSize: board.length }));
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "purple" }: any) => (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-2 bg-${color}-100 rounded-lg`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ icon: Icon, title, description, onClick, color }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="bg-white/80 backdrop-blur-sm border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
        onClick={onClick}
      >
        <CardContent className="p-6 text-center">
          <div className={`p-3 bg-${color}-100 rounded-xl mx-auto mb-4 w-fit`}>
            <Icon className={`h-8 w-8 text-${color}-600`} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
          <ArrowRight className="h-4 w-4 text-gray-400 mx-auto mt-3" />
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen relative">
      <NeuralAmbientBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-10 w-10 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cognitive Workspace
            </h1>
            <Brain className="h-10 w-10 text-purple-600" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Where thoughts become insights. Capture ideas, consult your advisory board, and discover patterns in your thinking.
          </p>
        </motion.div>

        {/* Workspace Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={MessageSquare}
            title="Thoughts Captured"
            value={workspaceStats.totalThoughts}
            subtitle="this month"
            color="blue"
          />
          <StatCard
            icon={Crown}
            title="Advisory Board"
            value={workspaceStats.boardSize}
            subtitle="advisors selected"
            color="purple"
          />
          <StatCard
            icon={Lightbulb}
            title="Insights Generated"
            value={workspaceStats.insightsGenerated}
            subtitle="total insights"
            color="yellow"
          />
          <StatCard
            icon={TrendingUp}
            title="Thinking Streak"
            value={workspaceStats.streakDays}
            subtitle="days in a row"
            color="green"
          />
        </div>

        {/* Main Navigation */}
        <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as any)} className="w-full">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="capture" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Capture
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="board" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Board
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Gallery
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Overview */}
          {activeSection === 'capture' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 mt-6"
            >
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <QuickActionCard
                  icon={Zap}
                  title="Quick Capture"
                  description="Capture thoughts with text, voice, or upload"
                  onClick={() => {/* Scroll to capture */}}
                  color="blue"
                />
                <QuickActionCard
                  icon={Wand2}
                  title="Content Studio"
                  description="Transform thoughts into multiple formats"
                  onClick={() => setActiveSection('content')}
                  color="orange"
                />
                <QuickActionCard
                  icon={Users}
                  title="Consult Board"
                  description="Get insights from your advisory board"
                  onClick={() => setActiveSection('board')}
                  color="purple"
                />
                <QuickActionCard
                  icon={TrendingUp}
                  title="View Patterns"
                  description="Analyze your thinking patterns"
                  onClick={() => setActiveSection('gallery')}
                  color="green"
                />
              </div>

              {/* Recent Insights Preview */}
              {recentInsights.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Recent Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recentInsights.slice(0, 4).map((insight) => (
                        <div key={insight.id} className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">{insight.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{insight.content}</p>
                          {insight.advisors && (
                            <div className="flex gap-1">
                              {insight.advisors.slice(0, 3).map((advisor: any, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {advisor.avatar} {advisor.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Thought Capture */}
              <EnhancedThoughtCapture
                onThoughtCapture={handleThoughtCapture}
                advisoryBoard={advisoryBoard}
                onBoardUpdate={handleBoardUpdate}
                showAdvisoryIntegration={true}
              />
            </motion.div>
          )}

          <TabsContent value="content" className="mt-6">
            <ContentMultiplier
              originalThought=""
              advisoryBoard={advisoryBoard}
              onContentGenerated={(content) => {
                toast.success(`Generated ${content.length} content formats!`);
              }}
            />
          </TabsContent>

          <TabsContent value="board" className="mt-6">
            <BoardOfDirectors 
              userId={user?.id}
              onBoardChange={handleBoardUpdate}
            />
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <EnhancedInsightGallery
              insights={recentInsights}
              onInsightUpdate={(insight) => {
                setRecentInsights(prev => 
                  prev.map(i => i.id === insight.id ? insight : i)
                );
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}