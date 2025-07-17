import React, { useState } from 'react';
import { Share2, Copy, Twitter, ExternalLink, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface ShareInsightProps {
  insight: any;
  isDemo?: boolean;
}

export function ShareInsight({ insight, isDemo }: ShareInsightProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Format insight for sharing
  const formatInsightForSharing = (format: 'text' | 'tweet') => {
    const response = insight.response?.insights;
    if (!response) return '';

    let content = '';
    
    if (format === 'tweet') {
      // Tweet-optimized format (shorter)
      const keyTheme = response.keyThemes?.[0]?.theme || 'Insight';
      const firstAction = response.actionItems?.[0] || '';
      const firstQuote = response.quotes?.[0] || '';
      
      content = `🧠 ${keyTheme}\n\n`;
      if (firstAction) content += `Next step: ${firstAction}\n\n`;
      if (firstQuote) content += `💡 "${firstQuote}"\n\n`;
      content += `Created with @ScatterbrainAI ✨`;
      
      // Ensure it's under 280 characters
      if (content.length > 270) {
        content = `🧠 ${keyTheme}\n\n${firstAction ? `Next: ${firstAction.substring(0, 50)}...\n\n` : ''}Created with @ScatterbrainAI ✨`;
      }
    } else {
      // Full text format
      content = `✨ INSIGHT SYNTHESIS ✨\n\n`;
      
      // Key themes
      if (response.keyThemes?.length > 0) {
        content += `🎯 KEY THEMES:\n`;
        response.keyThemes.forEach((theme: any) => {
          content += `• ${theme.theme}\n`;
        });
        content += '\n';
      }
      
      // Summary
      if (response.summary) {
        content += `📝 SUMMARY:\n${response.summary}\n\n`;
      }
      
      // Action items
      if (response.actionItems?.length > 0) {
        content += `🎯 ACTION ITEMS:\n`;
        response.actionItems.forEach((action: string, index: number) => {
          content += `${index + 1}. ${action}\n`;
        });
        content += '\n';
      }
      
      // Quotes
      if (response.quotes?.length > 0) {
        content += `💡 KEY QUOTES:\n`;
        response.quotes.forEach((quote: string) => {
          content += `"${quote}"\n`;
        });
        content += '\n';
      }
      
      // Attribution
      content += `---\nCreated with Scatterbrain - A method for your madness\nGet your own insights at scatterbrainai.com`;
    }
    
    return content;
  };

  const generateShareableLink = () => {
    if (isDemo) {
      return `${window.location.origin}/shared-insight/demo-${insight.id}`;
    }
    return `${window.location.origin}/shared-insight/${insight.id}`;
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive",
      });
    }
  };

  const SharePreview = ({ format, content }: { format: string; content: string }) => (
    <div className="space-y-4">
      <div className="bg-card/30 border border-border/50 rounded-lg p-4">
        <div className="text-sm text-muted-foreground mb-2">Preview ({format}):</div>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {content}
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={() => copyToClipboard(content, format)}
          className="flex-1"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy {format}
        </Button>
        {format === 'Tweet' && (
          <Button 
            variant="outline"
            onClick={() => {
              const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
              window.open(tweetUrl, '_blank');
            }}
          >
            <Twitter className="w-4 h-4 mr-2" />
            Tweet
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          title="Share insight"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Insight
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="formatted" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="formatted">Formatted Text</TabsTrigger>
            <TabsTrigger value="tweet">Tweet Format</TabsTrigger>
            <TabsTrigger value="link">Shareable Link</TabsTrigger>
          </TabsList>
          
          <TabsContent value="formatted" className="space-y-4">
            <SharePreview 
              format="Formatted Text" 
              content={formatInsightForSharing('text')} 
            />
          </TabsContent>
          
          <TabsContent value="tweet" className="space-y-4">
            <SharePreview 
              format="Tweet" 
              content={formatInsightForSharing('tweet')} 
            />
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-card/30 border border-border/50 rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-2">Shareable Link:</div>
                <div className="font-mono text-sm bg-background/50 p-2 rounded border break-all">
                  {generateShareableLink()}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {isDemo ? 
                    'Note: Demo insights are public previews' : 
                    'This creates a public view of your insight'
                  }
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => copyToClipboard(generateShareableLink(), 'Link')}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(generateShareableLink(), '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="border-t border-border/50 pt-4 mt-6">
          <div className="text-xs text-muted-foreground text-center">
            💡 Sharing helps spread the word about Scatterbrain's unique approach to organizing thoughts
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}