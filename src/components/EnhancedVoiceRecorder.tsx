
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedVoiceRecorderProps {
  onTranscription: (text: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  className?: string;
}

export const EnhancedVoiceRecorder: React.FC<EnhancedVoiceRecorderProps> = ({
  onTranscription,
  onRecordingStateChange,
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
        await processAudio(audioBlob);
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        analyserRef.current = null;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      onRecordingStateChange?.(true);
      
      // Start audio level monitoring
      updateAudioLevel();
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
      
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice recording.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      onRecordingStateChange?.(false);
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
        onTranscription(data.transcription);
        toast({
          title: "Transcription complete",
          description: "Your voice has been converted to text successfully.",
        });
      } else {
        throw new Error('No transcription received');
      }
    } catch (error: any) {
      toast({
        title: "Transcription failed",
        description: error.message || "Could not transcribe your voice. Please try again.",
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
    };
  }, []);

  const buttonContent = () => {
    if (isProcessing) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          <span>Processing...</span>
        </>
      );
    } else if (isRecording) {
      return (
        <>
          <Square className="h-4 w-4" />
          <span>Stop Recording</span>
        </>
      );
    } else {
      return (
        <>
          <Mic className="h-4 w-4" />
          <span>Record Voice</span>
        </>
      );
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        variant={isRecording ? "destructive" : "outline"}
        className={`flex items-center gap-2 transition-all duration-200 ${
          isRecording ? 'animate-pulse' : ''
        }`}
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
    </div>
  );
};
