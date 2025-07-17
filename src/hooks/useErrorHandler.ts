import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ApiError {
  message: string;
  code?: string;
  retry?: boolean;
}

export function useErrorHandler() {
  const { toast } = useToast();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((error: any, context: string | object = 'operation') => {
    const contextStr = typeof context === 'string' ? context : JSON.stringify(context);
    console.error(`Error in ${contextStr}:`, error);
    
    let errorMessage = 'Something unexpected happened';
    let errorType: 'network' | 'synthesis' | 'timeout' | 'generic' = 'generic';
    
    // Determine error type and message
    if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
      errorType = 'network';
      errorMessage = 'Connection wandered off';
    } else if (error.message?.includes('timeout') || error.code === 'TIMEOUT') {
      errorType = 'timeout';  
      errorMessage = 'Taking longer than expected';
    } else if (contextStr.includes('synthesis') || contextStr.includes('analyze')) {
      errorType = 'synthesis';
      errorMessage = 'AI synthesis hit a snag';
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Show user-friendly toast
    toast({
      title: getErrorTitle(errorType),
      description: getErrorDescription(errorType),
      variant: "destructive",
      duration: 5000,
    });

    return { errorType, errorMessage };
  }, [toast]);

  const retryOperation = useCallback(async (operation: () => Promise<any>, maxRetries: number = 3) => {
    setIsRetrying(true);
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        setIsRetrying(false);
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    setIsRetrying(false);
    throw lastError;
  }, []);

  const handleAsyncError = useCallback(async (error: any, context: string | object = 'operation') => {
    return handleError(error, context);
  }, [handleError]);

  return { handleError, handleAsyncError, retryOperation, isRetrying };
}

function getErrorTitle(type: string): string {
  switch (type) {
    case 'network': return '🌐 Connection Issue';
    case 'synthesis': return '🧠 Synthesis Hiccup';
    case 'timeout': return '⏰ Taking Longer Than Expected';
    default: return '⚠️ Something Went Wrong';
  }
}

function getErrorDescription(type: string): string {
  switch (type) {
    case 'network': return 'Check your connection and try again';
    case 'synthesis': return 'Our AI is having a moment. Let\'s try again';
    case 'timeout': return 'Complex thoughts take time. Please wait or retry';
    default: return 'We\'re working to fix this. Please try again';
  }
}

// Hook for checking online status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}