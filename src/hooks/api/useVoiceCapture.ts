import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { VoiceCapture, CreateThoughtParams, ApiError } from '@/types/api';
import { thoughtsKeys } from './useThoughts';

// Voice capture hook with neural processing
export const useVoiceCapture = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [captures, setCaptures] = useState<VoiceCapture[]>([]);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Detect mobile Safari
  const isMobile = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.userAgent.includes('Safari') && /Android/.test(navigator.userAgent));

  // Start recording
  const startRecording = useCallback(async () => {
    // Mobile Safari requires user interaction to start audio
    if (isMobile && !userHasInteracted) {
      setUserHasInteracted(true);
      toast({
        title: "Tap to start recording",
        description: "On mobile devices, tap the record button to begin.",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const captureId = `capture-${Date.now()}`;
      const startTime = Date.now();

      const newCapture: VoiceCapture = {
        id: captureId,
        audioBlob: new Blob(),
        duration: 0,
        status: 'recording',
      };

      setCaptures(prev => [newCapture, ...prev]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const duration = Date.now() - startTime;

        setCaptures(prev => 
          prev.map(c => 
            c.id === captureId 
              ? { ...c, audioBlob, duration, status: 'processing' }
              : c
          )
        );

        // Process the audio
        processVoiceCapture(captureId, audioBlob, duration);
        
        // Stop all tracks to free up the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }

    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to capture voice memos.",
        variant: "destructive",
      });
    }
  }, [isMobile, userHasInteracted]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [isRecording]);

  // Process voice capture with AI
  const processVoiceCapture = async (captureId: string, audioBlob: Blob, duration: number) => {
    if (!user) return;

    setIsProcessing(true);

    try {
      // Upload audio to Supabase storage
      const fileName = `voice-memo-${captureId}-${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('thought-attachments')
        .upload(`${user.id}/voice-memos/${fileName}`, audioBlob, {
          contentType: 'audio/webm',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('thought-attachments')
        .getPublicUrl(uploadData.path);

      // Process with AI transcription using Whisper API
      const audioBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(audioBlob);
      });

      const transcriptionResult = await supabase.functions.invoke('transcribe-voice', {
        body: { audio: audioBase64 }
      });

      if (transcriptionResult.error) {
        throw new Error(`Transcription failed: ${transcriptionResult.error.message}`);
      }

      const { text: transcript, confidence } = transcriptionResult.data;

      // Update capture with results
      setCaptures(prev => 
        prev.map(c => 
          c.id === captureId 
            ? { 
                ...c, 
                status: 'completed',
                transcript,
                confidence,
              }
            : c
        )
      );

      // Auto-create thought if transcript is good quality
      if (transcript && confidence > 0.7) {
        createThoughtFromVoice({
          content: transcript,
          title: generateTitle(transcript),
          voiceData: {
            duration,
            transcript,
            confidence,
            audioUrl: publicUrl,
          },
        });
      }

      toast({
        title: "Voice memo processed! 🎙️",
        description: confidence > 0.7 
          ? "Thought has been automatically captured."
          : "Transcript available for review.",
      });

    } catch (error) {
      console.error('Voice processing error:', error);
      
      setCaptures(prev => 
        prev.map(c => 
          c.id === captureId 
            ? { ...c, status: 'error' }
            : c
        )
      );

      toast({
        title: "Voice processing failed",
        description: "Unable to process the audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Create thought from voice mutation
  const { mutate: createThoughtFromVoice } = useMutation({
    mutationFn: async (params: CreateThoughtParams) => {
      if (!user) throw new Error('Authentication required');

      // Get user's organization using the helper function
      const { data: orgId, error: orgError } = await supabase
        .rpc('get_user_organization_id');

      if (orgError || !orgId) {
        throw new Error('User organization not found');
      }

      const thoughtData = {
        user_id: user.id,
        organization_id: orgId,
        content: params.content,
        title: params.title,
        tags: params.tags || [],
        context: params.context,
        mood: params.mood,
        attachments: params.voiceData ? [params.voiceData] : [],
      };

      const { data, error } = await supabase
        .from('thoughts')
        .insert(thoughtData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate thoughts cache
      queryClient.invalidateQueries({ queryKey: thoughtsKeys.all });
    },
  });

  // Clear capture
  const clearCapture = useCallback((captureId: string) => {
    setCaptures(prev => prev.filter(c => c.id !== captureId));
  }, []);

  // Clear all captures
  const clearAllCaptures = useCallback(() => {
    setCaptures([]);
  }, []);

  return {
    isRecording,
    isProcessing,
    captures,
    startRecording,
    stopRecording,
    clearCapture,
    clearAllCaptures,
    canRecord: !!navigator.mediaDevices?.getUserMedia,
  };
};

// Generate title from transcript
const generateTitle = (transcript: string): string => {
  // Extract first few words as title
  const words = transcript.split(' ').slice(0, 6);
  let title = words.join(' ');
  
  // Add ellipsis if truncated
  if (words.length === 6 && transcript.split(' ').length > 6) {
    title += '...';
  }
  
  return title || 'Voice Memo';
};