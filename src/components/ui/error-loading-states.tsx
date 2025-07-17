import { AlertTriangle, Wifi, WifiOff, Zap, RefreshCw, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NeuralThinkingAnimation } from './neural-thinking-animation';

interface ErrorStateProps {
  type: 'network' | 'synthesis' | 'timeout' | 'generic';
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorState({ type, title, message, onRetry, isRetrying }: ErrorStateProps) {
  const getErrorContent = () => {
    switch (type) {
      case 'network':
        return {
          icon: WifiOff,
          title: title || 'Connection Wandered Off',
          message: message || 'Looks like your thoughts are having trouble reaching our neural network. Check your connection and let\'s try again.',
          action: 'Reconnect',
          color: 'text-orange-500'
        };
      case 'synthesis':
        return {
          icon: Brain,
          title: title || 'Synthesis Hit a Snag',
          message: message || 'Our AI is having a momentary brain freeze. Don\'t worry, your thoughts are safe - let\'s give it another shot.',
          action: 'Try Again',
          color: 'text-blue-500'
        };
      case 'timeout':
        return {
          icon: AlertTriangle,
          title: title || 'Taking Longer Than Expected',
          message: message || 'Your thoughts are particularly complex today! This is taking longer than usual, but we\'re still working on it.',
          action: 'Retry',
          color: 'text-yellow-500'
        };
      default:
        return {
          icon: AlertTriangle,
          title: title || 'Something Unexpected Happened',
          message: message || 'We hit an unexpected bump. Your thoughts are safe, and we\'re working to get things back on track.',
          action: 'Try Again',
          color: 'text-red-500'
        };
    }
  };

  const { icon: Icon, title: errorTitle, message: errorMessage, action, color } = getErrorContent();

  return (
    <Card className="max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-8 text-center">
        <div className="mb-6">
          <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-background to-muted/20 flex items-center justify-center mb-4 ${color}`}>
            <Icon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">{errorTitle}</h3>
          <p className="text-muted-foreground leading-relaxed">{errorMessage}</p>
        </div>
        
        {onRetry && (
          <Button 
            onClick={onRetry}
            disabled={isRetrying}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isRetrying ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Working on it...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>{action}</span>
              </div>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface LoadingStateProps {
  type: 'synthesis' | 'gallery' | 'upload' | 'generic';
  message?: string;
  progress?: number;
}

export function LoadingState({ type, message, progress }: LoadingStateProps) {
  const getLoadingContent = () => {
    switch (type) {
      case 'synthesis':
        return {
          animation: <NeuralThinkingAnimation size="lg" />,
          title: 'Finding Your Method',
          message: message || 'Your thoughts are finding their perfect form...',
          details: [
            'Capturing scattered ideas',
            'Connecting patterns',
            'Building insights',
            'Crafting clarity'
          ]
        };
      case 'gallery':
        return {
          animation: <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />,
          title: 'Loading Gallery',
          message: message || 'Gathering your insights...',
          details: []
        };
      case 'upload':
        return {
          animation: <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />,
          title: 'Processing Upload',
          message: message || 'Analyzing your files...',
          details: []
        };
      default:
        return {
          animation: <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />,
          title: 'Loading',
          message: message || 'Just a moment...',
          details: []
        };
    }
  };

  const { animation, title, message: loadingMessage, details } = getLoadingContent();

  return (
    <Card className="max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-8 text-center">
        <div className="mb-6">
          {animation}
        </div>
        
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{loadingMessage}</p>
        
        {progress !== undefined && (
          <div className="mb-4">
            <div className="bg-muted/30 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{progress}% complete</p>
          </div>
        )}
        
        {details.length > 0 && (
          <div className="space-y-2">
            {details.map((detail, index) => (
              <div key={detail} className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                <span>{detail}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OfflineIndicator() {
  return (
    <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <WifiOff className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-700 dark:text-orange-300">
        You're currently offline. Your thoughts are saved locally and will sync when you reconnect.
      </AlertDescription>
    </Alert>
  );
}