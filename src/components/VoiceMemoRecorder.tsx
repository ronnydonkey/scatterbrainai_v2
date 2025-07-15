import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEnhancedVoiceRecording, type AudioProcessingResult } from '@/hooks/useEnhancedVoiceRecording';
import { useVoiceTranscription } from '@/hooks/api/useVoiceTranscription';
import { cn } from '@/lib/utils';

interface VoiceMemoRecorderProps {
  onTranscriptionComplete?: (text: string) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onError?: (error: string) => void;
  className?: string;
  maxDuration?: number;
  placeholder?: string;
}

export const VoiceMemoRecorder: React.FC<VoiceMemoRecorderProps> = ({
  onTranscriptionComplete,
  onRecordingStart,
  onRecordingStop,
  onError,
  className,
  maxDuration = 300000, // 5 minutes
  placeholder = "Record your thoughts..."
}) => {
  console.log('VoiceMemoRecorder: Component rendering');
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [audioLevels, setAudioLevels] = useState<number[]>([0, 0, 0, 0, 0]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const { transcribeAudio } = useVoiceTranscription();

  // Audio analysis function
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteFrequencyData(dataArray);
    
    // Convert to audio levels for 5 bars
    const newLevels: number[] = [];
    const segmentSize = Math.floor(bufferLength / 5);
    
    for (let i = 0; i < 5; i++) {
      const start = i * segmentSize;
      const end = start + segmentSize;
      let sum = 0;
      
      for (let j = start; j < end; j++) {
        sum += dataArray[j];
      }
      
      const average = sum / segmentSize;
      // Convert to height (4-20px range)
      const height = Math.max(4, Math.min(20, (average / 255) * 16 + 4));
      newLevels.push(height);
    }
    
    setAudioLevels(newLevels);
    
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, [isRecording]);

  // Clean up audio analysis
  const cleanupAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevels([0, 0, 0, 0, 0]);
  }, []);

  const startRecording = async () => {
    try {
      console.log('VoiceMemoRecorder: Starting recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up Web Audio API for real-time analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Start analyzing audio
      analyzeAudio();
      
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        console.log('VoiceMemoRecorder: Recording stopped, processing...');
        
        // Clean up audio analysis
        cleanupAudioAnalysis();
        
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedChunks(chunks);
        
        try {
          setIsProcessing(true);
          const transcriptionResult = await transcribeAudio(audioBlob);
          
          if (transcriptionResult?.text) {
            console.log('VoiceMemoRecorder: Transcription received:', transcriptionResult.text);
            setTranscriptionText(transcriptionResult.text);
            onTranscriptionComplete?.(transcriptionResult.text);
          } else {
            throw new Error('No transcription received');
          }
        } catch (error: any) {
          console.error('VoiceMemoRecorder: Transcription error:', error);
          setError(error.message || 'Failed to transcribe audio');
          onError?.(error.message || 'Failed to transcribe audio');
        } finally {
          setIsProcessing(false);
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setError(null);
      setTranscriptionText('');
      onRecordingStart?.();
      
    } catch (error: any) {
      console.error('VoiceMemoRecorder: Error starting recording:', error);
      setError(error.message || 'Failed to start recording');
      onError?.(error.message || 'Failed to start recording');
      cleanupAudioAnalysis();
    }
  };

  const stopRecording = () => {
    console.log('VoiceMemoRecorder: Stopping recording...');
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      onRecordingStop?.();
    }
  };

  const handleButtonClick = useCallback(() => {
    console.log('VoiceMemoRecorder: Button clicked, isRecording:', isRecording, 'isProcessing:', isProcessing);
    
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  }, [isRecording, isProcessing]);

  const getButtonContent = () => {
    if (isRecording) {
      return (
        <div className="flex items-center">
          <Square className="w-4 h-4 mr-3 fill-current" />
          <div className="flex items-center space-x-1 mr-3">
            {/* Real-time reactive audio waveform */}
            {audioLevels.map((level, i) => (
              <motion.div
                key={i}
                className="w-1 bg-white rounded-full"
                animate={{
                  height: level,
                }}
                transition={{
                  duration: 0.1,
                  ease: "easeOut",
                }}
                style={{
                  height: `${level}px`,
                }}
              />
            ))}
          </div>
          <span>Recording...</span>
        </div>
      );
    } else if (isProcessing) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      );
    } else {
      return (
        <>
          <Mic className="w-4 h-4 mr-2" />
          Record Voice Memo
        </>
      );
    }
  };

  console.log('VoiceMemoRecorder: Rendering button, isRecording:', isRecording, 'isProcessing:', isProcessing);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col items-center space-y-4">
        <Button 
          variant="outline" 
          onClick={handleButtonClick}
          disabled={isProcessing}
          className="relative z-10 bg-white/10 border-white/20 text-white hover:bg-white/20 flex-shrink-0 min-h-[44px] px-6 text-sm sm:text-base transition-all duration-200 cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        >
          {getButtonContent()}
        </Button>


        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-2"
          >
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Processing audio with Whisper AI...
            </span>
          </motion.div>
        )}


        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">{error}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};