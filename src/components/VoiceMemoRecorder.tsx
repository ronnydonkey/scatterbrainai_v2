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
  
  const { transcribeAudio } = useVoiceTranscription();

  const startRecording = async () => {
    try {
      console.log('VoiceMemoRecorder: Starting recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        console.log('VoiceMemoRecorder: Recording stopped, processing...');
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
        <>
          <Square className="w-4 h-4 mr-2 fill-current" />
          Stop Recording
        </>
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

        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            {/* Recording Animation - similar to processing animation */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
              {/* Main circle */}
              <motion.div
                className="w-full h-full rounded-full flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {/* Sound wave circles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-full h-full rounded-full border-2 border-red-400/50"
                    animate={{
                      scale: [1, 2, 3],
                      opacity: [0.8, 0.3, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.7,
                    }}
                  />
                ))}
                
                {/* Inner microphone icon */}
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                  <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                </div>
              </motion.div>
            </div>
            
            <p className="text-sm font-medium text-red-400">
              Recording... Speak clearly
            </p>
          </motion.div>
        )}

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