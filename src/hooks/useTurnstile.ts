import { useEffect, useRef, useState } from 'react';

interface TurnstileInstance {
  reset: () => void;
  remove: () => void;
}

export const useTurnstile = (siteKey: string, onVerify: (token: string) => void) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<TurnstileInstance | null>(null);

  useEffect(() => {
    const loadTurnstile = () => {
      if (window.turnstile) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => setError('Failed to load Turnstile');
      document.head.appendChild(script);
    };

    loadTurnstile();
  }, []);

  useEffect(() => {
    if (isLoaded && containerRef.current && window.turnstile && !widgetRef.current) {
      try {
        const widget = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          'error-callback': () => setError('Turnstile verification failed'),
        });
        widgetRef.current = widget;
      } catch (err) {
        setError('Failed to render Turnstile widget');
      }
    }
  }, [isLoaded, siteKey, onVerify]);

  const reset = () => {
    if (widgetRef.current && window.turnstile) {
      window.turnstile.reset(widgetRef.current);
    }
  };

  return {
    containerRef,
    isLoaded,
    error,
    reset,
  };
};

// Extend window type for TypeScript
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: any) => any;
      reset: (widget: any) => void;
    };
  }
}