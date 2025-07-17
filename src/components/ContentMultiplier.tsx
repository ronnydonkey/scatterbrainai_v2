
import React, { useState } from 'react';
import { Zap, Loader, Sparkles, Check, Copy, Code, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContentGenerationAnimation } from './ContentGenerationAnimation';

interface ContentMultiplierProps {
  originalInsight: {
    originalInput: string;
    id: string;
  };
  onGenerate?: (content: any) => void;
}

export const ContentMultiplier: React.FC<ContentMultiplierProps> = ({ 
  originalInsight, 
  onGenerate 
}) => {
  const [selectedFormats, setSelectedFormats] = useState(['blog_post', 'twitter_thread']);
  const [targetAudience, setTargetAudience] = useState('entrepreneurs');
  const [tone, setTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const { toast } = useToast();

  const contentFormats = [
    { id: 'blog_post', name: 'Blog Post', icon: '📝', time: '2-3 min read' },
    { id: 'newsletter', name: 'Newsletter', icon: '📧', time: '5 min read' },
    { id: 'twitter_thread', name: 'Twitter Thread', icon: '🐦', time: '10-15 tweets' },
    { id: 'linkedin_article', name: 'LinkedIn Article', icon: '💼', time: '3-4 min read' },
    { id: 'instagram_carousel', name: 'Instagram Carousel', icon: '📸', time: '5-8 slides' },
    { id: 'youtube_script', name: 'YouTube Script', icon: '🎥', time: '5-10 min video' }
  ];

  const toggleFormat = (formatId: string) => {
    setSelectedFormats(prev => 
      prev.includes(formatId) 
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleGenerate = async () => {
    if (selectedFormats.length === 0) {
      toast({
        title: "No formats selected",
        description: "Please select at least one content format to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Starting content generation with:', {
        originalInput: originalInsight.originalInput,
        contentTypes: selectedFormats,
        targetAudience,
        tone
      });

      const { data, error } = await supabase.functions.invoke('content-multiply', {
        body: {
          originalInput: originalInsight.originalInput,
          contentTypes: selectedFormats,
          targetAudience,
          tone,
          brandVoice: 'helpful and informative'
        }
      });

      console.log('Content generation response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from content generation');
      }

      setGeneratedContent(data);
      onGenerate?.(data);
      
      toast({
        title: "Content Generated! ✨",
        description: `Successfully created ${selectedFormats.length} content format${selectedFormats.length > 1 ? 's' : ''}.`,
      });
    } catch (error) {
      console.error('Content generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Full Screen Content Generation Animation */}
      <ContentGenerationAnimation
        isVisible={isGenerating}
        selectedFormats={selectedFormats}
        onComplete={() => setIsGenerating(false)}
      />

      <div className="space-y-8">
        <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-8 border border-border/50">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Zap className="w-6 h-6 text-primary" />
            10x Your Content
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Transform this insight into a complete content ecosystem. Select formats and we'll create everything you need.
          </p>

          {/* Format Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {contentFormats.map(format => (
              <button
                key={format.id}
                onClick={() => toggleFormat(format.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-105 ${
                  selectedFormats.includes(format.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card/50 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{format.icon}</span>
                  <span className="font-semibold text-foreground">{format.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">{format.time}</p>
              </button>
            ))}
          </div>

          {/* Audience & Tone Settings */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Target Audience
              </label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
                  <SelectItem value="developers">Developers</SelectItem>
                  <SelectItem value="creators">Content Creators</SelectItem>
                  <SelectItem value="professionals">Business Professionals</SelectItem>
                  <SelectItem value="general">General Audience</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tone & Style
              </label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual & Friendly</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                  <SelectItem value="analytical">Data-Driven</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={selectedFormats.length === 0 || isGenerating}
            className="w-full py-4 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 mr-3 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-3" />
                Generate {selectedFormats.length} Content Format{selectedFormats.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>

        {/* Generated Content Display */}
        {generatedContent && (
          <GeneratedContentSuite 
            contentSuite={generatedContent} 
          />
        )}
      </div>
    </>
  );
};

interface GeneratedContentSuiteProps {
  contentSuite: any;
}

const GeneratedContentSuite: React.FC<GeneratedContentSuiteProps> = ({ 
  contentSuite
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const { toast } = useToast();

  console.log('Rendering content suite:', contentSuite);

  // Handle different response structures from the edge function
  const contentData = contentSuite.contentSuite || contentSuite.content || contentSuite;
  
  if (!contentData) {
    console.log('No content data found in:', contentSuite);
    return (
      <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-8 border border-border/50">
        <p className="text-muted-foreground">No content generated yet.</p>
      </div>
    );
  }

  const contentTabs = Object.entries(contentData).map(([type, content]) => ({
    type,
    content,
    label: formatTypeLabel(type),
    icon: getTypeIcon(type)
  }));

  if (contentTabs.length === 0) {
    return (
      <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-8 border border-border/50">
        <p className="text-muted-foreground">No content formats generated.</p>
      </div>
    );
  }

  return (
    <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-8 border border-border/50">
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
        <FileText className="w-6 h-6 text-green-500" />
        Your Content Suite
      </h2>

      {/* Content Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border">
        {contentTabs.map((tab, index) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(index)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
              activeTab === index
                ? 'bg-primary text-primary-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Content Display */}
      {contentTabs[activeTab] && (
        <ContentFormatDisplay 
          content={contentTabs[activeTab].content}
          type={contentTabs[activeTab].type}
        />
      )}
    </div>
  );
};

interface ContentFormatDisplayProps {
  content: any;
  type: string;
}

const ContentFormatDisplay: React.FC<ContentFormatDisplayProps> = ({ 
  content, 
  type
}) => {
  const [copied, setCopied] = useState('');
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const getContentText = (content: any, type: string) => {
    console.log('Processing content for type:', type, content);

    if (typeof content === 'string') {
      return content;
    }

    switch (type) {
      case 'blog_post':
        if (content.formatting?.plainText) return content.formatting.plainText;
        if (content.content) return content.content;
        break;
      case 'twitter_thread':
        if (content.tweets && Array.isArray(content.tweets)) {
          return content.tweets.map((tweet: any, i: number) => 
            `${i + 1}/${content.totalTweets || content.tweets.length} ${tweet.content || tweet}`
          ).join('\n\n');
        }
        if (content.content) return content.content;
        break;
      case 'newsletter':
        if (content.formatting?.plainText) return content.formatting.plainText;
        if (content.content) return content.content;
        break;
      case 'linkedin_article':
        if (content.formatting?.plainText) return content.formatting.plainText;
        if (content.content) {
          if (typeof content.content === 'string') return content.content;
          // Build from structured content
          let article = '';
          if (content.content.hook) article += content.content.hook + '\n\n';
          if (content.content.introduction) article += content.content.introduction + '\n\n';
          if (content.content.mainSections) {
            content.content.mainSections.forEach((section: any) => {
              if (section.heading) article += section.heading + '\n\n';
              if (section.content) article += section.content + '\n\n';
            });
          }
          if (content.content.personalStory) article += content.content.personalStory + '\n\n';
          if (content.content.conclusion) article += content.content.conclusion + '\n\n';
          if (content.content.callToAction) article += content.content.callToAction;
          return article;
        }
        break;
      default:
        if (content.content) return content.content;
        break;
    }
    
    // Fallback: try to extract any text content
    if (content.text) return content.text;
    if (content.body) return content.body;
    
    // Last resort: stringify the object
    return JSON.stringify(content, null, 2);
  };

  const contentText = getContentText(content, type);

  return (
    <div className="space-y-6">
      {/* Content Preview */}
      <div className="bg-card/50 rounded-lg p-6 border border-border">
        <h3 className="text-xl font-bold text-foreground mb-2">
          {content.title || `${formatTypeLabel(type)} Content`}
        </h3>
        {content.subtitle && (
          <p className="text-muted-foreground mb-4">{content.subtitle}</p>
        )}
        
        {content.metadata && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            {content.metadata.readingTime && <span>📖 {content.metadata.readingTime}</span>}
            {content.metadata.wordCount && <span>📝 {content.metadata.wordCount} words</span>}
            {content.metadata.targetAudience && <span>🎯 {content.metadata.targetAudience}</span>}
            {content.engagementScore && <span>⚡ {Math.round(content.engagementScore * 100)}% engagement</span>}
          </div>
        )}

        {/* Content Preview */}
        <div className="bg-background/50 rounded-lg p-4 max-h-96 overflow-y-auto border border-border">
          <pre className="whitespace-pre-wrap text-sm text-foreground font-inter">
            {contentText}
          </pre>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => copyToClipboard(contentText, 'Content')}
          variant="outline"
        >
          {copied === 'Content' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied === 'Content' ? 'Copied!' : 'Copy Content'}
        </Button>
        
        <Button
          onClick={() => {
            toast({
              title: "Feature coming soon!",
              description: "Content scheduling will be available in the next update.",
            });
          }}
          variant="default"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Post
        </Button>
      </div>
    </div>
  );
};

function formatTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'blog_post': 'Blog Post',
    'newsletter': 'Newsletter',
    'twitter_thread': 'Twitter Thread',
    'linkedin_article': 'LinkedIn Article',
    'instagram_carousel': 'Instagram Carousel',
    'youtube_script': 'YouTube Script'
  };
  return labels[type] || type.replace('_', ' ').split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    'blog_post': '📝',
    'newsletter': '📧',
    'twitter_thread': '🐦',
    'linkedin_article': '💼',
    'instagram_carousel': '📸',
    'youtube_script': '🎥'
  };
  return icons[type] || '📄';
}
