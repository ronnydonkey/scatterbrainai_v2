import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Twitter, Linkedin, Mail, FileText, Copy, Share2, Download,
  Zap, Sparkles, Crown, Clock, BarChart3, Users, Eye, Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { NeuralThinkingAnimation } from '@/components/ui/neural-thinking-animation';
import { NeuralAmbientBackground } from '@/components/ui/neural-ambient-background';
import { type Advisor } from '@/data/advisorsDirectory';

interface ContentFormat {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  maxLength: number;
  color: string;
  gradient: string;
}

interface GeneratedContent {
  format: string;
  content: string;
  hashtags?: string[];
  cta?: string;
  tone: string;
  wordCount: number;
  readTime?: string;
  engagement?: {
    expectedViews: number;
    expectedEngagement: string;
  };
}

interface ContentMultiplierProps {
  originalThought: string;
  advisoryBoard?: Advisor[];
  userVoice?: {
    tone: string;
    expertise: string[];
    audience: string;
  };
  onContentGenerated?: (content: GeneratedContent[]) => void;
}

const CONTENT_FORMATS: ContentFormat[] = [
  {
    id: 'tweet',
    name: 'Twitter/X Post',
    icon: Twitter,
    description: 'Concise, engaging social media post',
    maxLength: 280,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Article',
    icon: Linkedin,
    description: 'Professional thought leadership content',
    maxLength: 3000,
    color: 'blue',
    gradient: 'from-blue-600 to-blue-700'
  },
  {
    id: 'newsletter',
    name: 'Newsletter Section',
    icon: Mail,
    description: 'Email newsletter segment',
    maxLength: 1200,
    color: 'green',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 'blog',
    name: 'Blog Post',
    icon: FileText,
    description: 'Comprehensive blog article',
    maxLength: 5000,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600'
  }
];

export const ContentMultiplier: React.FC<ContentMultiplierProps> = ({
  originalThought,
  advisoryBoard = [],
  userVoice = {
    tone: 'professional',
    expertise: ['technology', 'business'],
    audience: 'professionals'
  },
  onContentGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['tweet', 'linkedin']);
  const [activeTab, setActiveTab] = useState('tweet');
  const [customizations, setCustomizations] = useState({
    tone: userVoice.tone,
    audience: userVoice.audience,
    includeHashtags: true,
    includeCTA: true,
    advisorPerspective: advisoryBoard.length > 0
  });

  // Content generation engine
  const generateContent = async () => {
    if (!originalThought.trim()) {
      toast.error('Please provide a thought to transform');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const generated: GeneratedContent[] = selectedFormats.map(formatId => {
        const format = CONTENT_FORMATS.find(f => f.id === formatId)!;
        return generateFormatContent(originalThought, format, customizations);
      });

      setGeneratedContent(generated);
      onContentGenerated?.(generated);
      
      toast.success(`Generated ${generated.length} content formats!`);
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  // Format-specific content generators
  const generateFormatContent = (thought: string, format: ContentFormat, options: any): GeneratedContent => {
    const advisorInsight = advisoryBoard.length > 0 && options.advisorPerspective 
      ? ` As ${advisoryBoard[0].name} might say: "${advisoryBoard[0].voice.split('.')[0].toLowerCase()}."`
      : '';

    switch (format.id) {
      case 'tweet':
        return generateTweet(thought, advisorInsight, options);
      case 'linkedin':
        return generateLinkedIn(thought, advisorInsight, options);
      case 'newsletter':
        return generateNewsletter(thought, advisorInsight, options);
      case 'blog':
        return generateBlogPost(thought, advisorInsight, options);
      default:
        return generateTweet(thought, advisorInsight, options);
    }
  };

  const generateTweet = (thought: string, advisorInsight: string, options: any): GeneratedContent => {
    const core = thought.substring(0, 200);
    const hashtags = options.includeHashtags ? ['#innovation', '#mindset', '#growth'] : [];
    const hashtagText = hashtags.length > 0 ? `\n\n${hashtags.join(' ')}` : '';
    
    return {
      format: 'tweet',
      content: `${core}${advisorInsight}${hashtagText}`,
      hashtags,
      tone: options.tone,
      wordCount: core.split(' ').length,
      engagement: {
        expectedViews: 1200,
        expectedEngagement: '3.2%'
      }
    };
  };

  const generateLinkedIn = (thought: string, advisorInsight: string, options: any): GeneratedContent => {
    const hook = "Here's something that's been on my mind lately...";
    const body = `${thought}\n\n${advisorInsight}`;
    const cta = options.includeCTA ? "\n\nWhat's your take on this? Share your thoughts in the comments." : '';
    const content = `${hook}\n\n${body}${cta}`;
    
    return {
      format: 'linkedin',
      content,
      cta: options.includeCTA ? "What's your take on this?" : undefined,
      tone: options.tone,
      wordCount: content.split(' ').length,
      readTime: '2 min',
      engagement: {
        expectedViews: 850,
        expectedEngagement: '5.8%'
      }
    };
  };

  const generateNewsletter = (thought: string, advisorInsight: string, options: any): GeneratedContent => {
    const subject = "💭 Thought for the Week";
    const content = `**${subject}**\n\n${thought}\n\n${advisorInsight}\n\n*This insight was generated using AI-powered advisory board analysis.*`;
    
    return {
      format: 'newsletter',
      content,
      tone: options.tone,
      wordCount: content.split(' ').length,
      readTime: '3 min',
      engagement: {
        expectedViews: 2400,
        expectedEngagement: '12.5%'
      }
    };
  };

  const generateBlogPost = (thought: string, advisorInsight: string, options: any): GeneratedContent => {
    const title = "Reflections on Innovation and Growth";
    const intro = "In today's rapidly evolving landscape, certain thoughts and insights stand out as particularly relevant.";
    const body = `## The Core Insight\n\n${thought}\n\n## Expert Perspective\n\n${advisorInsight}\n\n## Key Takeaways\n\n• Embrace continuous learning\n• Challenge conventional thinking\n• Apply insights to real-world scenarios`;
    const content = `# ${title}\n\n${intro}\n\n${body}`;
    
    return {
      format: 'blog',
      content,
      tone: options.tone,
      wordCount: content.split(' ').length,
      readTime: '8 min',
      engagement: {
        expectedViews: 450,
        expectedEngagement: '8.3%'
      }
    };
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  const getFormatIcon = (formatId: string) => {
    const format = CONTENT_FORMATS.find(f => f.id === formatId);
    return format ? format.icon : FileText;
  };

  const getFormatColor = (formatId: string) => {
    const format = CONTENT_FORMATS.find(f => f.id === formatId);
    return format ? format.gradient : 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen relative">
      <NeuralAmbientBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wand2 className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Content Multiplier
            </h1>
            <Wand2 className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform one thought into multiple professional content formats. From tweets to blog posts, powered by your advisory board.
          </p>
        </motion.div>

        {/* Control Panel */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Content Generation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Format Selection */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Select Content Formats</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CONTENT_FORMATS.map((format) => {
                  const Icon = format.icon;
                  const isSelected = selectedFormats.includes(format.id);
                  
                  return (
                    <motion.div
                      key={format.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                          ${isSelected 
                            ? `border-${format.color}-400 bg-${format.color}-50` 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                          }
                        `}
                        onClick={() => {
                          setSelectedFormats(prev =>
                            isSelected 
                              ? prev.filter(f => f !== format.id)
                              : [...prev, format.id]
                          );
                        }}
                      >
                        <Icon className={`h-6 w-6 mb-2 ${isSelected ? `text-${format.color}-600` : 'text-gray-500'}`} />
                        <h5 className="font-medium text-sm text-gray-900">{format.name}</h5>
                        <p className="text-xs text-gray-600 mt-1">{format.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Customization Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Content Style</h4>
                <div className="space-y-2">
                  <select 
                    value={customizations.tone}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, tone: e.target.value }))}
                    className="w-full p-2 border border-gray-200 rounded-md bg-white"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="inspirational">Inspirational</option>
                    <option value="analytical">Analytical</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={customizations.includeHashtags}
                      onChange={(e) => setCustomizations(prev => ({ ...prev, includeHashtags: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Include hashtags</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={customizations.includeCTA}
                      onChange={(e) => setCustomizations(prev => ({ ...prev, includeCTA: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Include call-to-action</span>
                  </label>
                  {advisoryBoard.length > 0 && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={customizations.advisorPerspective}
                        onChange={(e) => setCustomizations(prev => ({ ...prev, advisorPerspective: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Include advisor perspective</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Advisory Board Info */}
            {advisoryBoard.length > 0 && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-purple-600" />
                  Your Advisory Board ({advisoryBoard.length})
                </h4>
                <div className="flex gap-2">
                  {advisoryBoard.slice(0, 4).map((advisor, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {advisor.avatar} {advisor.name}
                    </Badge>
                  ))}
                  {advisoryBoard.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{advisoryBoard.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={generateContent}
              disabled={!originalThought || selectedFormats.length === 0 || isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <NeuralThinkingAnimation />
                  Generating Content...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate {selectedFormats.length} Content Format{selectedFormats.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content */}
        {generatedContent.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                Generated Content ({generatedContent.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  {generatedContent.map((content) => {
                    const Icon = getFormatIcon(content.format);
                    return (
                      <TabsTrigger key={content.format} value={content.format} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {CONTENT_FORMATS.find(f => f.id === content.format)?.name.split(' ')[0]}
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {generatedContent.map((content) => (
                  <TabsContent key={content.format} value={content.format} className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Content Preview */}
                      <div className="relative">
                        <Textarea
                          value={content.content}
                          readOnly
                          rows={content.format === 'blog' ? 15 : content.format === 'newsletter' ? 10 : 6}
                          className="font-mono text-sm bg-gray-50 resize-none"
                        />
                        <Button
                          onClick={() => copyContent(content.content)}
                          className="absolute top-2 right-2"
                          size="sm"
                          variant="outline"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Content Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg text-center">
                          <BarChart3 className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                          <p className="text-sm font-medium text-gray-900">{content.wordCount}</p>
                          <p className="text-xs text-gray-600">Words</p>
                        </div>
                        
                        {content.readTime && (
                          <div className="p-3 bg-gray-50 rounded-lg text-center">
                            <Clock className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                            <p className="text-sm font-medium text-gray-900">{content.readTime}</p>
                            <p className="text-xs text-gray-600">Read Time</p>
                          </div>
                        )}
                        
                        {content.engagement && (
                          <>
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                              <Eye className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                              <p className="text-sm font-medium text-gray-900">{content.engagement.expectedViews}</p>
                              <p className="text-xs text-gray-600">Est. Views</p>
                            </div>
                            
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                              <Users className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                              <p className="text-sm font-medium text-gray-900">{content.engagement.expectedEngagement}</p>
                              <p className="text-xs text-gray-600">Engagement</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => copyContent(content.content)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Content
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </motion.div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};