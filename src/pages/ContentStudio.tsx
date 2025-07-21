import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wand2, Brain, Crown, Zap, FileText, History, Settings,
  Twitter, Linkedin, Mail, BarChart3, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { ContentMultiplier } from '@/components/content/ContentMultiplier';
import { NeuralAmbientBackground } from '@/components/ui/neural-ambient-background';
import { useAuth } from '@/hooks/useAuth';
import { type Advisor } from '@/data/advisorsDirectory';

interface ContentHistory {
  id: string;
  originalThought: string;
  timestamp: string;
  formats: Array<{
    type: string;
    content: string;
    engagement?: {
      views: number;
      clicks: number;
      shares: number;
    };
  }>;
}

export default function ContentStudio() {
  const { user } = useAuth();
  const [currentThought, setCurrentThought] = useState('');
  const [advisoryBoard, setAdvisoryBoard] = useState<Advisor[]>([]);
  const [contentHistory, setContentHistory] = useState<ContentHistory[]>([]);
  const [activeTab, setActiveTab] = useState('create');
  const [studioStats, setStudioStats] = useState({
    totalContent: 0,
    totalViews: 0,
    totalEngagement: 0,
    topPerformingFormat: 'Twitter'
  });

  // Load user's advisory board and content history
  useEffect(() => {
    loadStudioData();
  }, [user]);

  const loadStudioData = async () => {
    // Simulate loading data
    setTimeout(() => {
      setStudioStats({
        totalContent: 23,
        totalViews: 15400,
        totalEngagement: 1250,
        topPerformingFormat: 'LinkedIn'
      });

      // Mock content history
      setContentHistory([
        {
          id: '1',
          originalThought: 'The intersection of AI and creativity is fascinating...',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          formats: [
            { type: 'twitter', content: 'The intersection of AI and creativity...', engagement: { views: 1200, clicks: 45, shares: 12 } },
            { type: 'linkedin', content: 'Here\'s something fascinating about AI...', engagement: { views: 850, clicks: 78, shares: 23 } }
          ]
        }
      ]);
    }, 1000);
  };

  const handleContentGenerated = (generatedContent: any[]) => {
    const newHistory: ContentHistory = {
      id: Date.now().toString(),
      originalThought: currentThought,
      timestamp: new Date().toISOString(),
      formats: generatedContent.map(content => ({
        type: content.format,
        content: content.content,
        engagement: {
          views: content.engagement?.expectedViews || 0,
          clicks: 0,
          shares: 0
        }
      }))
    };

    setContentHistory(prev => [newHistory, ...prev]);
    setStudioStats(prev => ({
      ...prev,
      totalContent: prev.totalContent + generatedContent.length
    }));

    toast.success('Content saved to your studio!');
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

  const formatTypeIcons = {
    twitter: Twitter,
    linkedin: Linkedin,
    newsletter: Mail,
    blog: FileText
  };

  const formatTypeColors = {
    twitter: 'bg-blue-100 text-blue-800',
    linkedin: 'bg-blue-100 text-blue-800',
    newsletter: 'bg-green-100 text-green-800',
    blog: 'bg-purple-100 text-purple-800'
  };

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
            <Wand2 className="h-10 w-10 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Content Studio
            </h1>
            <Wand2 className="h-10 w-10 text-purple-600" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform one thought into multiple professional content formats. Powered by AI and your advisory board insights.
          </p>
        </motion.div>

        {/* Studio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            title="Content Created"
            value={studioStats.totalContent}
            subtitle="pieces this month"
            color="blue"
          />
          <StatCard
            icon={BarChart3}
            title="Total Views"
            value={studioStats.totalViews.toLocaleString()}
            subtitle="across all platforms"
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            title="Engagement"
            value={studioStats.totalEngagement.toLocaleString()}
            subtitle="likes, shares, comments"
            color="purple"
          />
          <StatCard
            icon={Crown}
            title="Top Format"
            value={studioStats.topPerformingFormat}
            subtitle="best performing"
            color="yellow"
          />
        </div>

        {/* Main Studio Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-lg grid-cols-3 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Create
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History ({contentHistory.length})
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="create" className="mt-6">
            {/* Input Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Your Original Thought
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={currentThought}
                  onChange={(e) => setCurrentThought(e.target.value)}
                  placeholder="Enter your thought, idea, or insight here. This will be transformed into multiple content formats..."
                  rows={4}
                  className="resize-none text-base leading-relaxed"
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    {currentThought.length} characters
                    {advisoryBoard.length > 0 && (
                      <span className="ml-2">• {advisoryBoard.length} advisor{advisoryBoard.length !== 1 ? 's' : ''} will contribute</span>
                    )}
                  </div>
                  {currentThought.trim() && (
                    <Badge variant="secondary" className="text-green-700 bg-green-100">
                      Ready to multiply
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Content Multiplier */}
            <ContentMultiplier
              originalThought={currentThought}
              advisoryBoard={advisoryBoard}
              onContentGenerated={handleContentGenerated}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="space-y-4">
              {contentHistory.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No content history yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start creating content to see your history here.
                    </p>
                    <Button onClick={() => setActiveTab('create')}>
                      Create Your First Content
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                contentHistory.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-gray-900 mb-2">
                              {item.originalThought.substring(0, 100)}...
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                              {new Date(item.timestamp).toLocaleDateString()} • {item.formats.length} formats
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {item.formats.map((format, idx) => {
                            const Icon = formatTypeIcons[format.type as keyof typeof formatTypeIcons] || FileText;
                            const colorClass = formatTypeColors[format.type as keyof typeof formatTypeColors] || 'bg-gray-100 text-gray-800';
                            
                            return (
                              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Icon className="h-4 w-4" />
                                  <Badge className={`text-xs ${colorClass}`}>
                                    {format.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                                  {format.content.substring(0, 150)}...
                                </p>
                                {format.engagement && (
                                  <div className="text-xs text-gray-500 space-y-1">
                                    <div>👁️ {format.engagement.views} views</div>
                                    <div>👆 {format.engagement.clicks} clicks</div>
                                    <div>📤 {format.engagement.shares} shares</div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Content Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Analytics Coming Soon
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Detailed performance analytics, engagement metrics, and optimization insights will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}