import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Lightbulb, Plus, Calendar, TrendingUp, BarChart3, Star, Brain, CheckCircle,
  ArrowRight, Crown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useThoughtFlow } from '@/context/ThoughtFlowContext';
import { toast } from 'sonner';

export default function CleanInsightGallery() {
  const navigate = useNavigate();
  const { originalThought, selectedInsights, setSelectedInsights } = useThoughtFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [generatedInsights, setGeneratedInsights] = useState<any[]>([]);

  // Generate insights based on original thought
  useEffect(() => {
    if (originalThought) {
      // Simulate AI generating insights from the original thought
      const generated = [
        {
          id: 'g1',
          title: 'Strategic Implications',
          preview: `Exploring the strategic dimensions of "${originalThought.slice(0, 50)}..." - how this could reshape industry dynamics and competitive advantages.`,
          category: 'Strategy',
          isGenerated: true,
          confidence: 0.92
        },
        {
          id: 'g2', 
          title: 'Historical Parallels',
          preview: `Similar patterns emerged during past technological shifts. Your thought echoes themes from the industrial revolution's transformation of work.`,
          category: 'History',
          isGenerated: true,
          confidence: 0.87
        },
        {
          id: 'g3',
          title: 'Future Scenarios',
          preview: `Three possible futures emerge from this idea: decentralized networks, hybrid ecosystems, or consolidated platforms. Each has unique implications.`,
          category: 'Futurism',
          isGenerated: true,
          confidence: 0.89
        },
        {
          id: 'g4',
          title: 'Psychological Dimensions',
          preview: `The human element in your thought reveals deep needs for autonomy, mastery, and purpose - core drivers of motivation and behavior change.`,
          category: 'Psychology',
          isGenerated: true,
          confidence: 0.85
        }
      ];
      setGeneratedInsights(generated);
    }
  }, [originalThought]);

  // Demo insights data
  const existingInsights = [
    {
      id: '1',
      title: 'The Future of Remote Work',
      preview: 'Exploring how distributed teams will shape innovation and collaboration in the next decade...',
      date: '2 days ago',
      category: 'Business',
      starred: true
    },
    {
      id: '2', 
      title: 'Learning in Public',
      preview: 'The power of sharing your journey as you learn - building audience and accelerating growth...',
      date: '1 week ago',
      category: 'Personal Growth',
      starred: false
    },
    {
      id: '3',
      title: 'Design Thinking Process',
      preview: 'Breaking down complex problems through human-centered design methodology...',
      date: '2 weeks ago',
      category: 'Design',
      starred: true
    }
  ];

  const filters = ['All', 'Strategy', 'History', 'Futurism', 'Psychology', 'Business', 'Personal Growth', 'Design'];

  // Combine generated and existing insights
  const allInsights = [...generatedInsights, ...existingInsights];

  const filteredInsights = allInsights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || insight.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-display mb-4">Insight Gallery</h1>
        <p className="text-subtitle max-w-2xl mx-auto">
          Explore your thoughts, discover patterns, and track your intellectual journey over time.
        </p>
      </motion.div>

      {/* Original Thought Display */}
      {originalThought && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Card className="glass-card border-0 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="text-small font-medium text-gray-700 mb-1">Your original thought:</p>
                  <p className="text-body text-gray-900">{originalThought}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-input pl-10"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {filters.map(filter => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter)}
                    className={activeFilter === filter ? "btn-primary" : "btn-secondary"}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights Grid */}
      {filteredInsights.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInsights.map((insight, index) => {
              const isSelected = selectedInsights.includes(insight.id);
              const isGenerated = insight.isGenerated;
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    if (isGenerated) {
                      if (isSelected) {
                        setSelectedInsights(selectedInsights.filter(id => id !== insight.id));
                      } else {
                        setSelectedInsights([...selectedInsights, insight.id]);
                      }
                    }
                  }}
                >
                  <Card className={`modern-card h-full cursor-pointer transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-blue-300 bg-blue-50' : ''
                  } ${isGenerated ? 'border-purple-200' : ''}`}>
                    <CardContent className="modern-card-content">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-2">
                          <Badge className={`text-xs ${
                            isGenerated ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {insight.category}
                          </Badge>
                          {isGenerated && (
                            <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs">
                              AI Generated
                            </Badge>
                          )}
                        </div>
                        {isSelected ? (
                          <CheckCircle className="h-5 w-5 text-blue-600 fill-current" />
                        ) : insight.starred ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        ) : null}
                      </div>
                      
                      <h3 className="text-body font-semibold mb-2 line-clamp-2">
                        {insight.title}
                      </h3>
                      
                      <p className="text-caption text-gray-600 mb-4 line-clamp-3">
                        {insight.preview}
                      </p>
                      
                      {isGenerated && insight.confidence && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Confidence</span>
                            <span>{Math.round(insight.confidence * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                              style={{ width: `${insight.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-small text-gray-500">
                          {isGenerated ? (
                            <>
                              <Lightbulb className="h-3 w-3" />
                              <span>Just now</span>
                            </>
                          ) : (
                            <>
                              <Calendar className="h-3 w-3" />
                              {insight.date}
                            </>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={isSelected ? "text-blue-600" : "text-gray-600"}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isGenerated) {
                              // View existing insight
                            }
                          }}
                        >
                          {isGenerated ? (isSelected ? 'Selected' : 'Select') : 'View'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        // Empty State
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="glass-card border-0">
            <CardContent className="modern-card-content text-center py-16">
              <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-title mb-4">Your Gallery Awaits</h3>
              <p className="text-caption text-gray-600 mb-8 max-w-md mx-auto">
                Ready to transform scattered thoughts into organized insights? Your first synthesis is just a thought away.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/')}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start Thinking
                </Button>
                <Button variant="outline" className="btn-secondary">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Try Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats */}
      {filteredInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mt-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card border-0 text-center">
              <CardContent className="modern-card-content">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-title">{allInsights.length}</p>
                <p className="text-caption text-gray-600">Total Insights</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 text-center">
              <CardContent className="modern-card-content">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-title">{existingInsights.filter(i => i.starred).length}</p>
                <p className="text-caption text-gray-600">Starred</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 text-center">
              <CardContent className="modern-card-content">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-title">12</p>
                <p className="text-caption text-gray-600">Day Streak</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Flow Continuation */}
      {selectedInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <Card className="glass-card border-0 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="modern-card-content">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <h3 className="text-title mb-2">
                    {selectedInsights.length} Insight{selectedInsights.length !== 1 ? 's' : ''} Selected
                  </h3>
                  <p className="text-caption text-gray-600">
                    Ready to get perspectives from history's greatest minds?
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    toast.success('Taking your insights to the advisory board...');
                    navigate('/board');
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Crown className="h-4 w-4" />
                  Consult Advisory Board
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}