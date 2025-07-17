import React, { createContext, useContext, useEffect, useState } from 'react';
import { RateLimiter } from '@/lib/security';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SecurityContextType {
  rateLimiter: RateLimiter;
  checkRateLimit: (action: string) => boolean;
  reportSecurityEvent: (event: string, details?: any) => void;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rateLimiter] = useState(() => new RateLimiter(20, 60000)); // 20 requests per minute

  const checkRateLimit = (action: string): boolean => {
    const identifier = user?.id || 'anonymous';
    const isAllowed = rateLimiter.isAllowed(`${identifier}-${action}`);
    
    if (!isAllowed) {
      const remaining = rateLimiter.getRemainingAttempts(`${identifier}-${action}`);
      toast({
        title: 'Too many requests',
        description: `Please wait before trying again. ${remaining} attempts remaining.`,
        variant: 'destructive',
      });
      
      reportSecurityEvent('rate_limit_exceeded', { action, user: identifier });
    }
    
    return isAllowed;
  };

  const reportSecurityEvent = (event: string, details?: any) => {
    // Log security events (in production, send to monitoring service)
    console.warn(`[SECURITY EVENT] ${event}:`, {
      timestamp: new Date().toISOString(),
      user: user?.id || 'anonymous',
      userAgent: navigator.userAgent,
      url: window.location.href,
      details,
    });

    // In production, you would send this to your security monitoring service:
    // securityMonitoringService.report(event, details);
  };

  // Set up Content Security Policy headers effect
  useEffect(() => {
    // Add security meta tags dynamically if not present
    const addMetaTag = (name: string, content: string) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    addMetaTag('referrer', 'strict-origin-when-cross-origin');
    addMetaTag('X-Content-Type-Options', 'nosniff');
    addMetaTag('X-Frame-Options', 'DENY');
    
    // Monitor for suspicious activity
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect potential DevTools usage (F12, Ctrl+Shift+I, etc.)
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'U')) {
        reportSecurityEvent('devtools_detected', { key: e.key });
      }
    };

    // Monitor for console access attempts
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      // Only report if it looks like potential XSS or malicious activity
      const logStr = args.join(' ').toLowerCase();
      if (logStr.includes('<script') || logStr.includes('javascript:') || logStr.includes('eval(')) {
        reportSecurityEvent('suspicious_console_activity', { content: logStr.slice(0, 100) });
      }
      return originalConsoleLog.apply(console, args);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      console.log = originalConsoleLog; // Restore original console.log
    };
  }, []);

  // Monitor for unusual user behavior
  useEffect(() => {
    let clickCount = 0;
    let lastClickTime = 0;

    const handleClick = () => {
      const now = Date.now();
      
      // Reset counter if more than 1 second has passed
      if (now - lastClickTime > 1000) {
        clickCount = 0;
      }
      
      clickCount++;
      lastClickTime = now;
      
      // Report if user is clicking very rapidly (potential bot behavior)
      if (clickCount > 10) {
        reportSecurityEvent('rapid_clicking_detected', { 
          clickCount, 
          timeWindow: now - lastClickTime 
        });
        clickCount = 0; // Reset to avoid spam
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const value: SecurityContextType = {
    rateLimiter,
    checkRateLimit,
    reportSecurityEvent,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};