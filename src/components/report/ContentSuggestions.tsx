
import React, { useState } from 'react';
import { Smartphone, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface ContentSuggestionsProps {
  report: any;
}

export const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({ report }) => {
  const isMobile = useIsMobile();
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      toast.success('Copied to clipboard!');
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card className="mb-8 bg-white/10 border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Content Ready to Share
        </CardTitle>
        <p className="text-gray-300">Social posts, emails, presentations</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {report.contentSuggestions?.socialPosts && (
            <div>
              <h4 className="font-semibold mb-3">Social Media Posts</h4>
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                {Object.entries(report.contentSuggestions.socialPosts).map(([platform, content]: [string, any]) => {
                  const copyKey = `content-${platform}`;
                  return (
                    <div key={platform} className="p-4 bg-white/5 rounded-lg">
                      <h5 className="font-medium mb-2 capitalize">{platform}</h5>
                      <p className="text-sm text-gray-300 mb-3">{content?.content || 'No content available'}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={`border-white/20 text-white hover:bg-white/10 transition-all duration-200 ${
                          copiedStates[copyKey] ? 'bg-green-600/20 border-green-400' : ''
                        }`}
                        onClick={() => copyToClipboard(content?.content || '', copyKey)}
                      >
                        {copiedStates[copyKey] ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
