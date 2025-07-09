import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GeneratedContent {
  id: string;
  title: string;
  ai_generated_content: string;
  content_type: string;
  engagement_prediction: number;
  voice_authenticity_score: number;
  estimated_word_count: number;
  target_keywords: string[];
}

export const ContentGenerator = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    topic: '',
    contentType: '',
    keywords: '',
    tone: 'professional',
    voiceProfile: {
      style: 'informative',
      personality: 'friendly',
      expertise_level: 'intermediate'
    }
  });

  const handleGenerate = async () => {
    if (!user || !formData.topic.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a topic for content generation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get user's organization ID from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('User profile not found');
      }

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          topic: formData.topic,
          contentType: formData.contentType || 'blog_post',
          targetKeywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
          tone: formData.tone,
          voiceProfile: formData.voiceProfile,
          organizationId: profile.organization_id,
          userId: user.id
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedContent(data.suggestion);
        toast({
          title: "Content Generated!",
          description: "Your AI-powered content is ready",
        });
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedContent?.ai_generated_content) return;
    
    try {
      await navigator.clipboard.writeText(generatedContent.ai_generated_content);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>AI Content Generator</span>
          </CardTitle>
          <CardDescription>
            Generate authentic, voice-preserved content using Claude AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                placeholder="Enter your content topic..."
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select 
                value={formData.contentType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog_post">Blog Post</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="reddit_comment">Reddit Comment</SelectItem>
                  <SelectItem value="reddit_post">Reddit Post</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Target Keywords</Label>
              <Input
                id="keywords"
                placeholder="keyword1, keyword2, keyword3..."
                value={formData.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select 
                value={formData.tone} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading || !formData.topic.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{generatedContent.title}</CardTitle>
                <CardDescription>Generated content with AI optimization</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center space-x-2"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">
                Engagement: {Math.round(generatedContent.engagement_prediction)}%
              </Badge>
              <Badge variant="secondary">
                Voice Score: {Math.round(generatedContent.voice_authenticity_score)}%
              </Badge>
              <Badge variant="outline">
                {generatedContent.estimated_word_count} words
              </Badge>
              <Badge variant="outline">
                {generatedContent.content_type.replace('_', ' ')}
              </Badge>
            </div>

            {generatedContent.target_keywords.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Target Keywords:</Label>
                <div className="flex flex-wrap gap-1">
                  {generatedContent.target_keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium">Generated Content:</Label>
              <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {generatedContent.ai_generated_content}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};