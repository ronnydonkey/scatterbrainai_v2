import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedVoiceRecorder } from '@/components/EnhancedVoiceRecorder';
import { useVoiceTranscription } from '@/hooks/api/useVoiceTranscription';
import { cn } from '@/lib/utils';
import type { AudioProcessingResult } from '@/hooks/useEnhancedVoiceRecording';

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
  const [stage, setStage] = useState<'idle' | 'recording' | 'processing' | 'completed' | 'error'>('idle');
  const [recordedAudio, setRecordedAudio] = useState<AudioProcessingResult | null>(null);
  const [transcriptionText, setTranscriptionText] = useState<string>('');

  const { transcribeAudio, isTranscribing } = useVoiceTranscription();

  const handleRecordingStart = useCallback(() => {
    setStage('recording');
    setRecordedAudio(null);
    setTranscriptionText('');
    onRecordingStart?.();
  }, [onRecordingStart]);

  const handleRecordingStop = useCallback(() => {
    setStage('processing');
    onRecordingStop?.();
  }, [onRecordingStop]);

  const handleRecordingComplete = useCallback(async (result: AudioProcessingResult) => {
    setRecordedAudio(result);
    setStage('processing');

    try {
      // Transcribe the recorded audio
      const transcriptionResult = await transcribeAudio(result.audioBlob);
      
      if (transcriptionResult?.text) {
        setTranscriptionText(transcriptionResult.text);
        setStage('completed');
        onTranscriptionComplete?.(transcriptionResult.text);
      } else {
        throw new Error('No transcription received');
      }
    } catch (error: any) {
      setStage('error');
      onError?.(error.message || 'Failed to transcribe audio');
    }
  }, [transcribeAudio, onTranscriptionComplete, onError]);

  const handleError = useCallback((error: string) => {
    setStage('error');
    onError?.(error);
  }, [onError]);

  const resetRecorder = useCallback(() => {
    setStage('idle');
    setRecordedAudio(null);
    setTranscriptionText('');
  }, []);

  const getStatusMessage = () => {
    switch (stage) {
      case 'idle':
        return placeholder;
      case 'recording':
        return 'Recording... Speak clearly';
      case 'processing':
        return 'Transcribing your voice...';
      case 'completed':
        return 'Transcription complete!';
      case 'error':
        return 'Something went wrong. Try again.';
      default:
        return placeholder;
    }
  };

  const getStatusColor = () => {
    switch (stage) {
      case 'recording':
        return 'text-red-400';
      case 'processing':
        return 'text-blue-400';
      case 'completed':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Voice Recorder Button - matching upload button style */}
      <div className="flex flex-col items-center space-y-4">
        <Button 
          variant="outline" 
          onClick={() => {
            if (stage === 'idle' || stage === 'error') {
              handleRecordingStart();
            } else if (stage === 'recording') {
              handleRecordingStop();
            }
          }}
          disabled={stage === 'processing' || isTranscribing}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex-shrink-0 min-h-[44px] px-6 text-sm sm:text-base"
        >
          {stage === 'recording' ? (
            <>
              <Square className="w-4 h-4 mr-2 fill-current" />
              Stop Recording
            </>
          ) : stage === 'processing' || isTranscribing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : stage === 'completed' ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Record Again
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Record Voice Memo
            </>
          )}
        </Button>

        {/* Hidden Enhanced Voice Recorder for actual recording functionality */}
        <div className="hidden">
          <EnhancedVoiceRecorder
            onRecordingStart={handleRecordingStart}
            onRecordingStop={handleRecordingStop}
            onRecordingComplete={handleRecordingComplete}
            onError={handleError}
            maxDuration={maxDuration}
            size="lg"
            showWaveform={false}
            autoStop={true}
          />
        </div>

        {/* Status Message - only show when not idle */}
        {stage !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className={cn("text-sm font-medium", getStatusColor())}>
              {getStatusMessage()}
            </p>
          </motion.div>
        )}

        {/* Processing Indicator */}
        <AnimatePresence>
          {(stage === 'processing' || isTranscribing) && (
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
          {stage === 'completed' && (
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
          {stage === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center space-y-2"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">
                  Transcription failed
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetRecorder}
                className="text-xs"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio Duration */}
        {recordedAudio && (
          <Badge variant="secondary" className="text-xs">
            {(recordedAudio.duration / 1000).toFixed(1)}s recorded
          </Badge>
        )}
      </div>

      {/* Transcription Preview */}
      <AnimatePresence>
        {transcriptionText && stage === 'completed' && (
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