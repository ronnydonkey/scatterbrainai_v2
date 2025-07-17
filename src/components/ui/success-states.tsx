import { CheckCircle, Sparkles, Share2, Download, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SuccessStateProps {
  type: 'synthesis' | 'save' | 'share' | 'upload' | 'generic';
  title?: string;
  message?: string;
  onAction?: () => void;
  actionLabel?: string;
  autoHide?: boolean;
  duration?: number;
}

export function SuccessState({ 
  type, 
  title, 
  message, 
  onAction, 
  actionLabel,
  autoHide = false,
  duration = 3000 
}: SuccessStateProps) {
  const getSuccessContent = () => {
    switch (type) {
      case 'synthesis':
        return {
          icon: Sparkles,
          title: title || 'Method Found! ✨',
          message: message || 'Your scattered thoughts have been transformed into clear, actionable insights.',
          action: actionLabel || 'View Insights',
          color: 'text-green-500',
          bgColor: 'from-green-500/10 to-green-500/5'
        };
      case 'save':
        return {
          icon: CheckCircle,
          title: title || 'Safely Stored! 💾',
          message: message || 'Your insight has been added to your personal gallery.',
          action: actionLabel || 'View Gallery',
          color: 'text-blue-500',
          bgColor: 'from-blue-500/10 to-blue-500/5'
        };
      case 'share':
        return {
          icon: Share2,
          title: title || 'Shared Successfully! 🚀',
          message: message || 'Your insight is now ready to inspire others.',
          action: actionLabel || 'Share More',
          color: 'text-purple-500',
          bgColor: 'from-purple-500/10 to-purple-500/5'
        };
      case 'upload':
        return {
          icon: CheckCircle,
          title: title || 'Upload Complete! 📁',
          message: message || 'Your files have been processed and are ready for analysis.',
          action: actionLabel || 'Start Analysis',
          color: 'text-green-500',
          bgColor: 'from-green-500/10 to-green-500/5'
        };
      default:
        return {
          icon: CheckCircle,
          title: title || 'Success! 🎉',
          message: message || 'Operation completed successfully.',
          action: actionLabel || 'Continue',
          color: 'text-green-500',
          bgColor: 'from-green-500/10 to-green-500/5'
        };
    }
  };

  const { icon: Icon, title: successTitle, message: successMessage, action, color, bgColor } = getSuccessContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className={`max-w-md mx-auto bg-gradient-to-br ${bgColor} backdrop-blur-sm border-border/50 shadow-lg`}>
        <CardContent className="p-6 text-center">
          <motion.div 
            className="mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-background to-muted/20 flex items-center justify-center ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </motion.div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">{successTitle}</h3>
          <p className="text-muted-foreground text-sm mb-4">{successMessage}</p>
          
          {onAction && (
            <Button 
              onClick={onAction}
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {action}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ToastSuccessProps {
  type: 'synthesis' | 'save' | 'share' | 'copy';
  title: string;
  description?: string;
}

export function getSuccessToast({ type, title, description }: ToastSuccessProps) {
  const icons = {
    synthesis: '🧠',
    save: '💾',
    share: '🚀',
    copy: '📋'
  };

  return {
    title: `${icons[type]} ${title}`,
    description: description || 'Operation completed successfully',
    duration: 3000,
  };
}