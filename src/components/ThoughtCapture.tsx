
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Brain, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EnhancedVoiceRecorder } from "./EnhancedVoiceRecorder";
import { FileUpload } from "./FileUpload";
import { NeuralThinkingAnimation } from "./ui/neural-thinking-animation";
import { SimpleNeuralLoading } from "./ui/simple-neural-loading";
import { sanitizeInput, SECURITY_LIMITS, sanitizeErrorMessage } from "@/lib/security";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useSecurityContext } from "./SecurityProvider";

interface ThoughtCaptureProps {
  onInsightGenerated?: (insight: any) => void;
  className?: string;
}

export const ThoughtCapture: React.FC<ThoughtCaptureProps> = ({ 
  onInsightGenerated,
  className = ""
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const { checkRateLimit } = useSecurityContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    // Check rate limit first
    if (!checkRateLimit('thought-submission')) {
      return;
    }

    const sanitizedInput = sanitizeInput(input.trim());
    
    if (!sanitizedInput) {
      toast({
        title: "No input provided",
        description: "Please enter some text or record a voice memo first.",
        variant: "destructive",
      });
      return;
    }

    if (sanitizedInput.length > SECURITY_LIMITS.MAX_THOUGHT_LENGTH) {
      toast({
        title: "Input too long",
        description: `Please limit your thought to ${SECURITY_LIMITS.MAX_THOUGHT_LENGTH} characters.`,
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to capture thoughts.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Store the thought with sanitized content
      const { data: thoughtData, error: thoughtError } = await supabase
        .from('thoughts')
        .insert({
          content: sanitizedInput,
          user_id: user.id,
          organization_id: user.user_metadata?.organization_id
        })
        .select()
        .single();

      if (thoughtError) throw thoughtError;

      // Generate insights
      const { data: insightData, error: insightError } = await supabase.functions
        .invoke('analyze-thought', {
          body: { 
            content: sanitizedInput,
            thoughtId: thoughtData.id
          }
        });

      if (insightError) throw insightError;

      toast({
        title: "✨ Insight Generated!",
        description: "Your thought has been analyzed and insights are ready.",
      });

      if (onInsightGenerated && insightData) {
        onInsightGenerated(insightData);
      }

      setInput('');
    } catch (error: any) {
      const sanitizedError = sanitizeErrorMessage(error);
      handleError(error, 'thought-capture');
      
      toast({
        title: "Unable to process thought",
        description: sanitizedError,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscription = (transcription: string) => {
    const sanitizedTranscription = sanitizeInput(transcription);
    setInput(prev => {
      const newContent = prev + (prev ? ' ' : '') + sanitizedTranscription;
      return newContent.slice(0, SECURITY_LIMITS.MAX_THOUGHT_LENGTH);
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileContent = (content: string) => {
    const sanitizedContent = sanitizeInput(content);
    setInput(prev => {
      const newContent = prev + (prev ? '\n\n' : '') + sanitizedContent;
      return newContent.slice(0, SECURITY_LIMITS.MAX_THOUGHT_LENGTH);
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="p-6 bg-gradient-to-br from-background via-background to-muted/20 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Capture Your Thoughts</h3>
          </div>
          
          <div className="flex gap-2 mb-4">
            <EnhancedVoiceRecorder 
              onTranscription={handleVoiceTranscription}
              onRecordingStateChange={setIsRecording}
              className="flex-1"
            />
            
            <FileUpload 
              onFileContent={handleFileContent}
              className="flex-shrink-0"
            />
          </div>

          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What's on your mind? Share your thoughts, ideas, or questions..."
              className="min-h-[120px] max-h-[300px] resize-none bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all duration-200"
              disabled={isLoading}
            />
            
            {isRecording && (
              <div className="absolute bottom-2 right-2">
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Recording...
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Press Cmd/Ctrl + Enter to submit
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !input.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <SimpleNeuralLoading size="sm" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Insights</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {isLoading && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex flex-col items-center space-y-4">
            <NeuralThinkingAnimation />
            <div className="text-center">
              <h4 className="font-medium text-foreground">Processing your thoughts...</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI is analyzing patterns and generating insights
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
