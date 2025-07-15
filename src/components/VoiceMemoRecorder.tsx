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
  const [transcriptionText, setTranscriptionText] = useState<string>('');
  
  // Use the voice recording hook directly
  const {
    state,
    startRecording,
    stopRecording,
    reset,
    formatDuration,
  } = useEnhancedVoiceRecording();
  
  const { transcribeAudio, isTranscribing } = useVoiceTranscription();

  // Handle recording start
  const handleStartRecording = useCallback(async () => {
    try {
      await startRecording();
      onRecordingStart?.();
    } catch (error: any) {
      onError?.(error.message || 'Failed to start recording');
    }
  }, [startRecording, onRecordingStart, onError]);

  // Handle recording stop and transcription
  const handleStopRecording = useCallback(async () => {
    try {
      const result = await stopRecording();
      onRecordingStop?.();
      
      if (result?.audioBlob) {
        // Transcribe the recorded audio
        const transcriptionResult = await transcribeAudio(result.audioBlob);
        
        if (transcriptionResult?.text) {
          setTranscriptionText(transcriptionResult.text);
          onTranscriptionComplete?.(transcriptionResult.text);
        } else {
          throw new Error('No transcription received');
        }
      }
    } catch (error: any) {
      onError?.(error.message || 'Failed to process recording');
    }
  }, [stopRecording, onRecordingStop, transcribeAudio, onTranscriptionComplete, onError]);

  // Handle button click
  const handleButtonClick = useCallback(() => {
    if (state.isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  }, [state.isRecording, handleStartRecording, handleStopRecording]);

  // Reset handler
  const handleReset = useCallback(() => {
    reset();
    setTranscriptionText('');
  }, [reset]);

  // Get button content based on state
  const getButtonContent = () => {
    if (state.isRecording) {
      return (
        <>
          <Square className="w-4 h-4 mr-2 fill-current" />
          Stop Recording
        </>
      );
    } else if (state.stage === 'processing' || isTranscribing) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      );
    } else if (state.stage === 'completed' && transcriptionText) {
      return (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Record Again
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

  return (
    <div className={cn("space-y-4", className)}>
      {/* Voice Recorder Button - matching upload button style */}
      <div className="flex flex-col items-center space-y-4">
        <Button 
          variant="outline" 
          onClick={handleButtonClick}
          disabled={state.stage === 'processing' || isTranscribing || state.stage === 'requesting-permission'}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex-shrink-0 min-h-[44px] px-6 text-sm sm:text-base"
        >
          {getButtonContent()}
        </Button>

        {/* Recording duration */}
        {state.isRecording && (
          <Badge variant="secondary" className="text-xs animate-pulse">
            {formatDuration(state.duration)}
          </Badge>
        )}

        {/* Status Messages */}
        {state.isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-sm font-medium text-red-400">
              Recording... Speak clearly
            </p>
          </motion.div>
        )}

        {/* Processing Indicator */}
        <AnimatePresence>
          {(state.stage === 'processing' || isTranscribing) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-2"
            >
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Processing audio with Whisper AI...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion Indicator */}
        <AnimatePresence>
          {state.stage === 'completed' && transcriptionText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">
                Voice successfully transcribed!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Indicator */}
        <AnimatePresence>
          {state.stage === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center space-y-2"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">
                  {state.error || 'Recording failed'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transcription Preview */}
      <AnimatePresence>
        {transcriptionText && state.stage === 'completed' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card/50 rounded-lg p-4 border border-border"
          >
            <h4 className="text-sm font-medium text-foreground mb-2">
              Transcription:
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {transcriptionText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};