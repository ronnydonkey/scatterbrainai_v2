import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sanitizeErrorMessage } from '@/lib/security';

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
    
    // Log the actual error for debugging (server-side logging would be better)
    console.error(`[${new Date().toISOString()}] Error in ${contextStr}:`, {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack?.slice(0, 500), // Limit stack trace length
    });
    
    let errorType: 'network' | 'synthesis' | 'timeout' | 'auth' | 'validation' | 'generic' = 'generic';
    
    // Determine error type based on error characteristics
    if (error.name === 'NetworkError' || error.message?.includes('fetch') || error.message?.includes('network')) {
      errorType = 'network';
    } else if (error.message?.includes('timeout') || error.code === 'TIMEOUT') {
      errorType = 'timeout';  
    } else if (error.message?.includes('auth') || error.code === 'UNAUTHENTICATED') {
      errorType = 'auth';
    } else if (error.message?.includes('validation') || error.code === 'VALIDATION_ERROR') {
      errorType = 'validation';
    } else if (contextStr.includes('synthesis') || contextStr.includes('analyze')) {
      errorType = 'synthesis';
    }

    // Use sanitized error message for user display
    const sanitizedMessage = sanitizeErrorMessage(error);

    // Show user-friendly toast with generic messages
    toast({
      title: getErrorTitle(errorType),
      description: getErrorDescription(errorType),
      variant: "destructive",
      duration: 5000,
    });

    return { errorType, errorMessage: sanitizedMessage };
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
    case 'synthesis': return '🧠 Processing Error';
    case 'timeout': return '⏰ Request Timeout';
    case 'auth': return '🔐 Authentication Required';
    case 'validation': return '📝 Input Validation Error';
    default: return '⚠️ Unexpected Error';
  }
}

function getErrorDescription(type: string): string {
  switch (type) {
    case 'network': return 'Please check your internet connection and try again';
    case 'synthesis': return 'Unable to process your request. Please try again later';
    case 'timeout': return 'The request is taking longer than expected. Please try again';
    case 'auth': return 'Please sign in to continue using this feature';
    case 'validation': return 'Please check your input and try again';
    default: return 'An unexpected error occurred. Please try again later';
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