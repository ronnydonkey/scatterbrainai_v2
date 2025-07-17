import { Brain, Lightbulb, Sparkles, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  type: 'gallery' | 'thoughts' | 'search' | 'archived' | 'generic';
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ type, title, message, action, secondaryAction }: EmptyStateProps) {
  const getEmptyContent = () => {
    switch (type) {
      case 'gallery':
        return {
          illustration: (
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/20 rounded-full animate-pulse" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary/30 rounded-full animate-pulse delay-1000" />
            </div>
          ),
          title: title || 'Your Gallery Awaits',
          message: message || 'Ready to transform scattered thoughts into organized insights? Your first synthesis is just a thought away.',
          defaultAction: 'Start Thinking',
          defaultSecondary: 'Try Demo'
        };
      case 'thoughts':
        return {
          illustration: (
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <Lightbulb className="w-12 h-12 text-blue-500" />
              </div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
            </div>
          ),
          title: title || 'Ideas Waiting to Spark',
          message: message || 'This is where your thoughts come to life. Start capturing ideas, voice memos, or random musings.',
          defaultAction: 'Capture Thought',
          defaultSecondary: 'Voice Recording'
        };
      case 'search':
        return {
          illustration: (
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-muted/50 to-muted/20 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-12 h-12 text-muted-foreground" />
            </div>
          ),
          title: title || 'No Matches Found',
          message: message || 'Try adjusting your search terms or exploring different keywords to find what you\'re looking for.',
          defaultAction: 'Clear Search',
          defaultSecondary: 'Browse All'
        };
      case 'archived':
        return {
          illustration: (
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-full flex items-center justify-center mb-4">
              <Brain className="w-12 h-12 text-orange-500 opacity-50" />
            </div>
          ),
          title: title || 'Bad Idea Vault is Empty',
          message: message || 'No archived insights here yet. When you need to set an idea aside, it\'ll appear in this vault.',
          defaultAction: 'Back to Gallery',
          defaultSecondary: 'Create Insight'
        };
      default:
        return {
          illustration: (
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-12 h-12 text-primary" />
            </div>
          ),
          title: title || 'Nothing Here Yet',
          message: message || 'This space is ready for your content.',
          defaultAction: 'Get Started',
          defaultSecondary: null
        };
    }
  };

  const { illustration, title: emptyTitle, message: emptyMessage, defaultAction, defaultSecondary } = getEmptyContent();

  return (
    <div className="text-center py-12 px-4 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {illustration}
        
        <h3 className="text-2xl font-semibold text-foreground mb-3">{emptyTitle}</h3>
        <p className="text-muted-foreground leading-relaxed mb-8">{emptyMessage}</p>
        
        <div className="space-y-3">
          {action && (
            <Button 
              onClick={action.onClick}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          )}
          
          {!action && defaultAction && (
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 w-full">
              <Plus className="w-4 h-4 mr-2" />
              {defaultAction}
            </Button>
          )}
          
          {secondaryAction && (
            <Button 
              variant="outline" 
              onClick={secondaryAction.onClick}
              className="border-primary/30 text-primary hover:bg-primary/10 w-full"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              {secondaryAction.label}
            </Button>
          )}
          
          {!secondaryAction && defaultSecondary && (
            <Button 
              variant="outline" 
              className="border-primary/30 text-primary hover:bg-primary/10 w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {defaultSecondary}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <Card className="bg-card/50 backdrop-blur-xl border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
            <div className="w-20 h-4 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="w-3/4 h-5 bg-muted rounded animate-pulse" />
          <div className="w-full h-4 bg-muted rounded animate-pulse" />
          <div className="w-5/6 h-4 bg-muted rounded animate-pulse" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="w-16 h-6 bg-muted rounded-full animate-pulse" />
          <div className="w-20 h-8 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}