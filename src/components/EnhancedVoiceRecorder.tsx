
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { type AudioProcessingResult } from '@/hooks/useEnhancedVoiceRecording';

interface EnhancedVoiceRecorderProps {
  onTranscription?: (text: string) => void;
  onRecordingComplete?: (result: AudioProcessingResult) => Promise<void>;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  onError?: (error: string) => void;
  maxDuration?: number;
  size?: 'sm' | 'md' | 'lg';
  showWaveform?: boolean;
  autoStop?: boolean;
  className?: string;
}

export const EnhancedVoiceRecorder: React.FC<EnhancedVoiceRecorderProps> = ({
  onTranscription,
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  onRecordingStateChange,
  onError,
  maxDuration = 300000,
  size = 'md',
  showWaveform = false,
  autoStop = false,
  className = ""
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const maxDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      
      // Setup audio analysis for visual feedback
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      analyserRef.current = analyser;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Create audio URL and duration for AudioProcessingResult
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = Date.now() - (mediaRecorder as any).startTime || 0;
        
        const result: AudioProcessingResult = {
          audioBlob,
          duration,
          audioUrl,
          waveformData: showWaveform && analyserRef.current ? 
            Array.from(new Uint8Array(analyserRef.current.frequencyBinCount)) : undefined
        };

        // Call both callbacks if they exist
        if (onRecordingComplete) {
          await onRecordingComplete(result);
        } else {
          // Fallback to transcription if onRecordingComplete is not provided
          await processAudio(audioBlob);
        }
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        analyserRef.current = null;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      // Store start time for duration calculation
      (mediaRecorder as any).startTime = Date.now();
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      onRecordingStateChange?.(true);
      onRecordingStart?.();
      
      // Setup auto-stop if maxDuration is set
      if (autoStop && maxDuration > 0) {
        maxDurationTimeoutRef.current = setTimeout(() => {
          stopRecording();
        }, maxDuration);
      }
      
      // Start audio level monitoring
      updateAudioLevel();
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
      
    } catch (error: any) {
      const errorMessage = "Please allow microphone access to use voice recording.";
      onError?.(errorMessage);
      toast({
        title: "Microphone access denied",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Clear auto-stop timeout
      if (maxDurationTimeoutRef.current) {
        clearTimeout(maxDurationTimeoutRef.current);
        maxDurationTimeoutRef.current = null;
      }
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      onRecordingStateChange?.(false);
      onRecordingStop?.();
    }
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current || !isRecording) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255); // Normalize to 0-1
    
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const { data, error } = await supabase.functions.invoke('transcribe-voice', {
        body: formData,
      });

      if (error) throw error;

      if (data?.transcription) {
        onTranscription?.(data.transcription);
        toast({
          title: "Transcription complete",
          description: "Your voice has been converted to text successfully.",
        });
      } else {
        throw new Error('No transcription received');
      }
    } catch (error: any) {
      const errorMessage = error.message || "Could not transcribe your voice. Please try again.";
      onError?.(errorMessage);
      toast({
        title: "Transcription failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (maxDurationTimeoutRef.current) {
        clearTimeout(maxDurationTimeoutRef.current);
      }
    };
  }, []);

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-12 w-12';
      case 'lg': return 'h-20 w-20';
      default: return 'h-16 w-16';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-8 w-8';
      default: return 'h-6 w-6';
    }
  };

  const buttonContent = () => {
    if (isProcessing) {
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
          {size === 'lg' && <span className="text-xs">Processing...</span>}
        </div>
      );
    } else if (isRecording) {
      return (
        <div className="flex flex-col items-center gap-2">
          <Square className={getIconSize()} />
          {size === 'lg' && <span className="text-xs">Stop</span>}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center gap-2">
          <Mic className={getIconSize()} />
          {size === 'lg' && <span className="text-xs">Record</span>}
        </div>
      );
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        variant={isRecording ? "destructive" : "outline"}
        className={`${getButtonSize()} rounded-full flex items-center justify-center transition-all duration-200 ${
          isRecording ? 'animate-pulse' : ''
        } ${size === 'lg' ? 'p-4' : 'p-2'}`}
      >
        {buttonContent()}
      </Button>
      
      {isRecording && (
        <div className="absolute -top-1 -right-1 w-3 h-3">
          <div 
            className="w-full h-full rounded-full bg-red-500 transition-all duration-100"
            style={{ 
              opacity: 0.7 + (audioLevel * 0.3),
              transform: `scale(${0.8 + (audioLevel * 0.4)})` 
            }}
          />
        </div>
      )}

      {showWaveform && isRecording && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="w-1 bg-synaptic-400 rounded-full transition-all duration-100"
                style={{
                  height: `${8 + (audioLevel * 16)}px`,
                  opacity: 0.6 + (audioLevel * 0.4),
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
