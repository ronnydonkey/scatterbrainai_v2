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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start recording
  const startRecording = useCallback(async () => {
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
  }, []);

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
        .upload(`voice-memos/${user.id}/${fileName}`, audioBlob, {
          contentType: 'audio/webm',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('thought-attachments')
        .getPublicUrl(uploadData.path);

      // Process with AI transcription (mock for now - would integrate with Whisper API)
      const transcript = await transcribeAudio(audioBlob);
      const confidence = calculateConfidence(transcript);

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

      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('User organization not found');
      }

      const thoughtData = {
        user_id: user.id,
        organization_id: profile.organization_id,
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

// Mock transcription function (would integrate with Whisper API)
const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock responses based on audio duration
  const duration = audioBlob.size / 1000; // Rough estimate
  
  if (duration < 2) {
    return "Quick thought captured.";
  } else if (duration < 5) {
    return "I just had an interesting idea about neural networks and how they might relate to human creativity.";
  } else {
    return "I've been thinking about the intersection of AI and human consciousness. There's something fascinating about how neural networks mirror the way our brains form connections between seemingly unrelated concepts. This could be the basis for a new content series exploring the parallels between artificial and biological intelligence.";
  }
};

// Calculate transcription confidence
const calculateConfidence = (transcript: string): number => {
  // Simple heuristic based on transcript quality
  if (!transcript || transcript.length < 5) return 0.2;
  if (transcript.includes("...") || transcript.length < 20) return 0.5;
  if (transcript.split(' ').length > 10) return 0.9;
  return 0.7;
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
  
  return title;
};