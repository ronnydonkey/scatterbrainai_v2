/**
 * Security utilities for input validation and sanitization
 */

// Content length limits for security
export const SECURITY_LIMITS = {
  MAX_THOUGHT_LENGTH: 10000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILE_CONTENT_LENGTH: 50000,
  MAX_FILENAME_LENGTH: 255,
} as const;

// Allowed file types for uploads
export const ALLOWED_FILE_TYPES = [
  'text/plain',
  'text/markdown',
  'application/json',
  'text/csv',
] as const;

export const ALLOWED_FILE_EXTENSIONS = [
  '.txt',
  '.md',
  '.json',
  '.csv',
] as const;

/**
 * Basic XSS sanitization for user content
 * Removes potentially dangerous HTML/script content
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove on* event handlers
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: urls
    .replace(/javascript:/gi, '')
    // Remove data: urls that aren't images
    .replace(/data:(?!image\/)[^;,]+[;,]/gi, '')
    // Limit length
    .slice(0, SECURITY_LIMITS.MAX_THOUGHT_LENGTH);
}

/**
 * Validate file upload security
 */
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > SECURITY_LIMITS.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds limit of ${SECURITY_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  // Check filename length
  if (file.name.length > SECURITY_LIMITS.MAX_FILENAME_LENGTH) {
    return {
      isValid: false,
      error: 'Filename is too long'
    };
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_FILE_EXTENSIONS.includes(extension as any)) {
    return {
      isValid: false,
      error: `File type not allowed. Supported: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`
    };
  }

  // Check MIME type if available
  if (file.type && !ALLOWED_FILE_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: 'File type not supported'
    };
  }

  return { isValid: true };
}

/**
 * Validate and sanitize file content
 */
export function validateFileContent(content: string): { isValid: boolean; content: string; error?: string } {
  if (!content.trim()) {
    return {
      isValid: false,
      content: '',
      error: 'File appears to be empty'
    };
  }

  if (content.length > SECURITY_LIMITS.MAX_FILE_CONTENT_LENGTH) {
    return {
      isValid: false,
      content: '',
      error: `File content exceeds limit of ${SECURITY_LIMITS.MAX_FILE_CONTENT_LENGTH} characters`
    };
  }

  // Sanitize the content
  const sanitizedContent = sanitizeInput(content);

  return {
    isValid: true,
    content: sanitizedContent
  };
}

/**
 * Generic error message sanitization
 * Prevents information disclosure through error messages
 */
export function sanitizeErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred';

  const message = error.message || error.toString();
  
  // List of sensitive patterns to replace with generic messages
  const sensitivePatterns = [
    /database/gi,
    /sql/gi,
    /postgres/gi,
    /supabase/gi,
    /connection/gi,
    /timeout/gi,
    /internal server/gi,
    /stack trace/gi,
    /file not found/gi,
    /permission denied/gi,
  ];

  // Check if message contains sensitive information
  const containsSensitive = sensitivePatterns.some(pattern => pattern.test(message));
  
  if (containsSensitive) {
    return 'A technical error occurred. Please try again later.';
  }

  // Return sanitized message (limit length and remove HTML)
  return sanitizeInput(message).slice(0, 200);
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    // Update the attempts list
    this.attempts.set(identifier, recentAttempts);
    
    // Check if under the limit
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const userAttempts = this.attempts.get(identifier) || [];
    const now = Date.now();
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }
}