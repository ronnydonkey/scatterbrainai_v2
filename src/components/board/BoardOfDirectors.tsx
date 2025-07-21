import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, Star, Gem, Flame, Sparkles, Brain, Users, MessageSquare, 
  Search, Filter, Shuffle, X, Plus, ArrowRight, Zap, Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { ADVISOR_DIRECTORY, CATEGORIES, TIERS, BOARD_TEMPLATES, type Advisor } from '@/data/advisorsDirectory';
import { AdvisorCard } from './AdvisorCard';
import { SynthesisPanel } from './SynthesisPanel';
import { NeuralAmbientBackground } from '@/components/ui/neural-ambient-background';
import { NeuralThinkingAnimation } from '@/components/ui/neural-thinking-animation';

interface BoardOfDirectorsProps {
  userId?: string;
  onBoardChange?: (advisors: Advisor[]) => void;
}

export const BoardOfDirectors: React.FC<BoardOfDirectorsProps> = ({ 
  userId, 
  onBoardChange 
}) => {
  const [selectedAdvisors, setSelectedAdvisors] = useState<Advisor[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTier, setActiveTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userInput, setUserInput] = useState('');
  const [synthesis, setSynthesis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'onboarding' | 'board' | 'synthesis'>('onboarding');
  const [showTemplates, setShowTemplates] = useState(true);

  // Filter advisors based on search, category, and tier
  const filteredAdvisors = ADVISOR_DIRECTORY.filter(advisor => {
    const matchesSearch = advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advisor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advisor.voice.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || advisor.category === activeCategory;
    const matchesTier = activeTier === 'all' || advisor.tier === activeTier;
    
    return matchesSearch && matchesCategory && matchesTier;
  });

  // Add advisor to board
  const addAdvisor = (advisor: Advisor) => {
    if (selectedAdvisors.length >= 8) {
      toast.error('Maximum 8 advisors allowed on your board');
      return;
    }
    if (!selectedAdvisors.find(a => a.id === advisor.id)) {
      const newBoard = [...selectedAdvisors, advisor];
      setSelectedAdvisors(newBoard);
      onBoardChange?.(newBoard);
      toast.success(`${advisor.name} added to your board`);
    }
  };

  // Remove advisor from board
  const removeAdvisor = (advisorId: string) => {
    const newBoard = selectedAdvisors.filter(a => a.id !== advisorId);
    setSelectedAdvisors(newBoard);
    onBoardChange?.(newBoard);
  };

  // Load board template
  const loadTemplate = (template: typeof BOARD_TEMPLATES[0]) => {
    const templateAdvisors = ADVISOR_DIRECTORY.filter(
      advisor => template.advisorIds.includes(advisor.id)
    );
    setSelectedAdvisors(templateAdvisors);
    onBoardChange?.(templateAdvisors);
    setViewMode('board');
    setShowTemplates(false);
    toast.success(`Loaded "${template.name}" board template`);
  };

  // Shuffle advisors for discovery
  const shuffleAdvisors = () => {
    const shuffled = [...ADVISOR_DIRECTORY].sort(() => Math.random() - 0.5);
    if (selectedAdvisors.length === 0) {
      const autoSelected = shuffled.slice(0, 5);
      setSelectedAdvisors(autoSelected);
      onBoardChange?.(autoSelected);
      setViewMode('board');
      toast.success('Surprise board assembled!');
    }
  };

  // Synthesize with board (demo implementation)
  const synthesizeWithBoard = async () => {
    if (!userInput.trim() || selectedAdvisors.length === 0) return;
    
    setIsLoading(true);
    setSynthesis(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Demo synthesis based on selected advisors
      const demoSynthesis = {
        advisors: selectedAdvisors.map(advisor => ({
          name: advisor.name,
          avatar: advisor.avatar,
          tier: advisor.tier,
          insight: generateAdvisorInsight(advisor, userInput)
        })),
        combinedSummary: generateCombinedSummary(selectedAdvisors, userInput),
        keyThemes: extractKeyThemes(selectedAdvisors),
        actionPlan: generateActionPlan(selectedAdvisors, userInput),
        timestamp: new Date().toISOString()
      };
      
      setSynthesis(demoSynthesis);
      setViewMode('synthesis');
      
      toast.success('Board insights generated!');
    } catch (error) {
      console.error('Synthesis error:', error);
      toast.error('Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo insight generation functions
  const generateAdvisorInsight = (advisor: Advisor, input: string): string => {
    const insights = {
      'socrates': `What assumptions are you making about "${input.slice(0, 30)}"? Question your premises first.`,
      'leonardo': `I see patterns between this challenge and my work in art and engineering. Consider multiple perspectives.`,
      'einstein': `Think of this as a thought experiment. What would happen if you approached "${input.slice(0, 30)}" from first principles?`,
      'jobs': `Focus on the user experience. How does this create something people will love and use daily?`,
      'naval': `This is about creating leverage. How can you use code, media, or capital to scale your solution?`,
    };
    
    return insights[advisor.id as keyof typeof insights] || 
           `From my perspective as ${advisor.role}, I believe ${advisor.voice.split('.')[0].toLowerCase()}.`;
  };

  const generateCombinedSummary = (advisors: Advisor[], input: string): string => {
    const themes = advisors.map(a => a.category).filter((v, i, arr) => arr.indexOf(v) === i);
    return `Your advisory board brings together wisdom from ${themes.join(', ')} to address your challenge. The consensus emphasizes systematic thinking, user-centered design, and leveraging unique advantages for sustainable impact.`;
  };

  const extractKeyThemes = (advisors: Advisor[]): string[] => {
    const allSpecialties = advisors.flatMap(a => a.specialty || []);
    return [...new Set(allSpecialties)].slice(0, 5);
  };

  const generateActionPlan = (advisors: Advisor[], input: string): string[] => {
    return [
      'Define the core problem using first-principles thinking',
      'Research existing solutions and identify gaps',
      'Create a minimum viable solution focused on user value',
      'Test with real users and gather feedback',
      'Iterate based on insights and scale systematically'
    ];
  };

  return (
    <div className="min-h-screen relative">
      {/* Neural Background */}
      <NeuralAmbientBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Advisory Board
            </h1>
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Build your dream advisory team with history's greatest minds. Get personalized insights from legendary thinkers and innovators.
          </p>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-center">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="onboarding" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Select</span>
              </TabsTrigger>
              <TabsTrigger value="board" disabled={selectedAdvisors.length === 0} className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Board ({selectedAdvisors.length})</span>
              </TabsTrigger>
              <TabsTrigger value="synthesis" disabled={!synthesis} className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Board Templates */}
              {showTemplates && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      Quick Start Templates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {BOARD_TEMPLATES.map((template) => (
                        <motion.div
                          key={template.id}
                          whileHover={{ scale: 1.02 }}
                          className="p-4 rounded-lg bg-gradient-to-br from-white to-gray-50 border border-gray-200 cursor-pointer"
                          onClick={() => loadTemplate(template)}
                        >
                          <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge className="text-xs">{template.category}</Badge>
                            <ArrowRight className="h-4 w-4 text-purple-600" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowTemplates(false)}
                        className="text-sm"
                      >
                        Or build your own custom board
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Search and Filters */}
              {!showTemplates && (
                <>
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search advisors by name, role, or expertise..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white/50"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Select value={activeCategory} onValueChange={setActiveCategory}>
                            <SelectTrigger className="w-40 bg-white/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select value={activeTier} onValueChange={setActiveTier}>
                            <SelectTrigger className="w-32 bg-white/50">
                              <SelectValue placeholder="All Tiers" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Tiers</SelectItem>
                              {Object.entries(TIERS).map(([key, tier]) => (
                                <SelectItem key={key} value={key}>
                                  {tier.icon} {tier.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button variant="outline" onClick={shuffleAdvisors} className="bg-white/50">
                            <Shuffle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Advisors Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {filteredAdvisors.map((advisor, index) => (
                        <motion.div
                          key={advisor.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <AdvisorCard
                            advisor={advisor}
                            isSelected={selectedAdvisors.some(a => a.id === advisor.id)}
                            onSelect={() => addAdvisor(advisor)}
                            onRemove={() => removeAdvisor(advisor.id)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {viewMode === 'board' && (
            <motion.div
              key="board"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Board Display */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Your Advisory Board ({selectedAdvisors.length}/8)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
                    {selectedAdvisors.map(advisor => (
                      <div key={advisor.id} className="text-center group relative">
                        <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-white shadow-lg">
                          <AvatarFallback className="text-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                            {advisor.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAdvisor(advisor.id)}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="text-xs font-medium truncate">{advisor.name}</div>
                        <div className="text-xs text-gray-500 truncate">{advisor.role}</div>
                      </div>
                    ))}
                  </div>

                  {/* Input Section */}
                  <div className="space-y-4">
                    <Textarea
                      placeholder="What challenge are you facing? What decision do you need help with? Your advisory board is ready to provide insights..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      rows={4}
                      className="resize-none bg-white/50"
                    />
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        {selectedAdvisors.length} advisor{selectedAdvisors.length !== 1 ? 's' : ''} ready to respond
                      </div>
                      <Button 
                        onClick={synthesizeWithBoard}
                        disabled={!userInput.trim() || isLoading}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {isLoading ? (
                          <>
                            <NeuralThinkingAnimation />
                            Consulting Board...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Get Board Insights
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {viewMode === 'synthesis' && synthesis && (
            <motion.div
              key="synthesis"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <SynthesisPanel synthesis={synthesis} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};