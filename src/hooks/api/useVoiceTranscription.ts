import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  duration?: number;
}

export const useVoiceTranscription = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<TranscriptionResult | null> => {
    setIsTranscribing(true);
    setError(null);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove data URL prefix
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      // Call the transcribe-voice edge function
      const { data, error: transcribeError } = await supabase.functions.invoke('transcribe-voice', {
        body: { audio: base64Audio }
      });

      if (transcribeError) {
        throw new Error(transcribeError.message || 'Transcription failed');
      }

      if (!data?.text) {
        throw new Error('No transcription text received');
      }

      return {
        text: data.text,
        confidence: data.confidence,
        duration: data.duration
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to transcribe audio';
      setError(errorMessage);
      
      toast({
        title: "Transcription Error",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setIsTranscribing(false);
  }, []);

  return {
    transcribeAudio,
    isTranscribing,
    error,
    reset
  };
};