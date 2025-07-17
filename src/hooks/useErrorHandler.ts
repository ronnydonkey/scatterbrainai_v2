
import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
}

export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, context?: ErrorContext) => {
    console.error('Error occurred:', {
      error,
      context,
      timestamp: new Date().toISOString(),
    });

    let message = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    // Show user-friendly toast
    toast.error(message, {
      description: context?.action ? `Failed to ${context.action}` : undefined,
    });

    return message;
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
};
