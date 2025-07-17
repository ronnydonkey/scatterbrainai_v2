
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useOfflineInsights } from '@/hooks/api/useOfflineInsights';
import { useVoiceCapture } from '@/hooks/api/useVoiceCapture';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ThoughtCaptureProps {
  onCapture?: (thought: string) => void;
  placeholder?: string;
  className?: string;
}

export const ThoughtCapture: React.FC<ThoughtCaptureProps> = ({
  onCapture,
  placeholder = "What's on your mind?",
  className = ""
}) => {
  const [thought, setThought] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { saveInsight } = useOfflineInsights();
  const { isRecording, isProcessing: voiceProcessing, captures, startRecording, stopRecording } = useVoiceCapture();

  // Watch for completed voice captures and add their transcripts to the thought
  useEffect(() => {
    const latestCapture = captures[0]; // Most recent capture
    if (latestCapture && latestCapture.status === 'completed' && latestCapture.transcript) {
      setThought(prev => {
        const newText = prev + (prev ? ' ' : '') + latestCapture.transcript;
        return newText;
      });
    }
  }, [captures]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thought.trim() || isProcessing) return;

    console.log('ThoughtCapture: Processing thought:', thought.substring(0, 50));
    setIsProcessing(true);

    try {
      // First, analyze the thought
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-thought', {
        body: { content: thought }
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        throw new Error('Failed to analyze thought');
      }

      console.log('ThoughtCapture: Analysis completed:', analysisData);

      // Save the insight immediately after analysis
      const insightId = await saveInsight(thought, analysisData);
      console.log('ThoughtCapture: Insight saved with ID:', insightId);

      // Call the onCapture callback if provided
      if (onCapture) {
        onCapture(thought);
      }

      // Clear the input
      setThought('');
      
      toast({
        title: "Thought captured! 🧠",
        description: "Your insight has been analyzed and saved to your gallery.",
      });

    } catch (error) {
      console.error('ThoughtCapture: Failed to process thought:', error);
      toast({
        title: "Failed to capture thought",
        description: "Please try again. Your thought wasn't lost.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [thought]);

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[100px] max-h-[200px] resize-none bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-12"
            disabled={isProcessing}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 ${isRecording ? 'text-red-400' : 'text-gray-400'} hover:text-white`}
            onClick={handleVoiceToggle}
            disabled={isProcessing || voiceProcessing}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {thought.length > 0 && `${thought.length} characters`}
            {isRecording && <span className="ml-2 text-red-400">Recording...</span>}
            {voiceProcessing && <span className="ml-2 text-blue-400">Processing voice...</span>}
          </div>
          
          <Button
            type="submit"
            disabled={!thought.trim() || isProcessing}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Capture Thought
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
