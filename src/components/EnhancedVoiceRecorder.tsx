import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Pause, Play, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useEnhancedVoiceRecording, type AudioProcessingResult } from '@/hooks/useEnhancedVoiceRecording';
import { cn } from '@/lib/utils';

interface EnhancedVoiceRecorderProps {
  onRecordingComplete?: (result: AudioProcessingResult) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onError?: (error: string) => void;
  maxDuration?: number; // in milliseconds
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWaveform?: boolean;
  autoStop?: boolean;
}

export const EnhancedVoiceRecorder: React.FC<EnhancedVoiceRecorderProps> = ({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  onError,
  maxDuration = 300000, // 5 minutes default
  className,
  size = 'md',
  showWaveform = true,
  autoStop = true,
}) => {
  const {
    state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
    formatDuration,
    requestPermission,
    browserSupport,
  } = useEnhancedVoiceRecording();

  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
  const [isHoldMode, setIsHoldMode] = useState(false);

  // Handle recording completion
  const handleStopRecording = useCallback(async () => {
    const result = await stopRecording();
    if (result) {
      onRecordingComplete?.(result);
    }
    onRecordingStop?.();
  }, [stopRecording, onRecordingComplete, onRecordingStop]);

  // Handle recording start
  const handleStartRecording = useCallback(async () => {
    try {
      await startRecording();
      onRecordingStart?.();
    } catch (error: any) {
      onError?.(error.message);
    }
  }, [startRecording, onRecordingStart, onError]);

  // Auto-stop when max duration is reached
  useEffect(() => {
    if (autoStop && state.isRecording && state.duration >= maxDuration) {
      handleStopRecording();
    }
  }, [state.isRecording, state.duration, maxDuration, autoStop, handleStopRecording]);

  // Handle touch/mouse events for hold-to-record
  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setTouchStartTime(Date.now());
    setIsHoldMode(true);
    
    if (!state.isRecording) {
      handleStartRecording();
    }
  }, [state.isRecording, handleStartRecording]);

  const handleTouchEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    
    if (isHoldMode) {
      const holdDuration = touchStartTime ? Date.now() - touchStartTime : 0;
      
      // Minimum hold duration to prevent accidental recordings
      if (holdDuration < 500) {
        reset();
      } else if (state.isRecording) {
        handleStopRecording();
      }
    }
    
    setTouchStartTime(null);
    setIsHoldMode(false);
  }, [isHoldMode, touchStartTime, state.isRecording, handleStopRecording, reset]);

  // Handle tap to toggle
  const handleTap = useCallback(() => {
    if (state.isRecording) {
      if (state.isPaused) {
        resumeRecording();
      } else {
        handleStopRecording();
      }
    } else {
      handleStartRecording();
    }
  }, [state.isRecording, state.isPaused, resumeRecording, handleStopRecording, handleStartRecording]);

  // Handle errors
  useEffect(() => {
    if (state.error) {
      onError?.(state.error);
    }
  }, [state.error, onError]);

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'w-12 h-12',
      icon: 'w-5 h-5',
      waveform: 'h-8',
      text: 'text-sm',
    },
    md: {
      button: 'w-16 h-16',
      icon: 'w-6 h-6',
      waveform: 'h-12',
      text: 'text-base',
    },
    lg: {
      button: 'w-20 h-20',
      icon: 'w-8 h-8',
      waveform: 'h-16',
      text: 'text-lg',
    },
  }[size];

  // Permission check component
  if (state.hasPermission === false) {
    return (
      <div className={cn("flex flex-col items-center space-y-4 p-4", className)}>
        <div className="flex items-center space-x-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span className={sizeConfig.text}>Microphone access required</span>
        </div>
        <Button onClick={requestPermission} variant="outline" size="default">
          Grant Permission
        </Button>
      </div>
    );
  }

  // Browser not supported
  if (!browserSupport.hasMediaDevices || !browserSupport.hasMediaRecorder) {
    return (
      <div className={cn("flex flex-col items-center space-y-2 p-4", className)}>
        <AlertCircle className="w-5 h-5 text-destructive" />
        <span className={cn("text-destructive text-center", sizeConfig.text)}>
          Voice recording is not supported in your browser
        </span>
      </div>
    );
  }

  // Audio level visualization bars
  const renderWaveform = () => {
    if (!showWaveform) return null;

    const bars = Array.from({ length: 20 }, (_, i) => {
      const height = state.isRecording 
        ? Math.max(0.1, Math.random() * state.audioLevel * 0.8 + state.audioLevel * 0.2)
        : 0.1;
      
      return (
        <motion.div
          key={i}
          className="bg-primary rounded-full"
          style={{
            width: '3px',
            height: `${height * 100}%`,
          }}
          animate={{
            height: `${height * 100}%`,
            opacity: state.isRecording ? 1 : 0.3,
          }}
          transition={{
            duration: 0.1,
            ease: 'easeOut',
          }}
        />
      );
    });

    return (
      <div className={cn("flex items-center justify-center space-x-1", sizeConfig.waveform)}>
        {bars}
      </div>
    );
  };

  // Main recording button
  const renderRecordButton = () => {
    const isActive = state.isRecording || state.stage === 'processing';
    
    return (
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulsing ring during recording */}
        <AnimatePresence>
          {state.isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          )}
        </AnimatePresence>

        {/* Audio level ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{
            scale: 1 + (state.audioLevel * 0.2),
            opacity: state.isRecording ? 0.7 + (state.audioLevel * 0.3) : 0.3,
          }}
          transition={{ duration: 0.1 }}
        />

        <Button
          className={cn(
            sizeConfig.button,
            "rounded-full transition-all duration-200",
            isActive
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-primary hover:bg-primary/90"
          )}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onClick={handleTap}
          disabled={state.stage === 'requesting-permission' || state.stage === 'processing'}
        >
          <AnimatePresence mode="wait">
            {state.stage === 'requesting-permission' && (
              <motion.div
                key="requesting"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Loader2 className={cn(sizeConfig.icon, "animate-spin")} />
              </motion.div>
            )}
            
            {state.stage === 'processing' && (
              <motion.div
                key="processing"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Loader2 className={cn(sizeConfig.icon, "animate-spin")} />
              </motion.div>
            )}

            {state.isRecording && !state.isPaused && (
              <motion.div
                key="recording"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Square className={cn(sizeConfig.icon, "fill-current")} />
              </motion.div>
            )}

            {state.isPaused && (
              <motion.div
                key="paused"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Play className={cn(sizeConfig.icon, "fill-current")} />
              </motion.div>
            )}

            {state.stage === 'completed' && (
              <motion.div
                key="completed"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <CheckCircle className={cn(sizeConfig.icon, "text-green-500")} />
              </motion.div>
            )}

            {(state.stage === 'idle' || state.stage === 'error') && (
              <motion.div
                key="idle"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Mic className={cn(sizeConfig.icon)} />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    );
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Waveform visualization */}
      {showWaveform && renderWaveform()}

      {/* Recording button */}
      {renderRecordButton()}

      {/* Duration and status */}
      <div className="flex flex-col items-center space-y-2">
        {state.isRecording && (
          <Badge variant="secondary" className="animate-pulse">
            {formatDuration(state.duration)}
          </Badge>
        )}

        {/* Progress bar for max duration */}
        {state.isRecording && maxDuration && (
          <div className="w-32">
            <Progress 
              value={(state.duration / maxDuration) * 100} 
              className="h-1"
            />
          </div>
        )}

        {/* Status text */}
        <motion.div
          className={cn("text-center", sizeConfig.text)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence mode="wait">
            {state.stage === 'idle' && (
              <motion.span
                key="idle"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-muted-foreground"
              >
                {isHoldMode ? 'Hold to record' : 'Tap to record'}
              </motion.span>
            )}

            {state.stage === 'requesting-permission' && (
              <motion.span
                key="permission"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-muted-foreground"
              >
                Requesting microphone access...
              </motion.span>
            )}

            {state.isRecording && !state.isPaused && (
              <motion.span
                key="recording"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-destructive"
              >
                Recording... {isHoldMode ? 'Release to stop' : 'Tap to stop'}
              </motion.span>
            )}

            {state.isPaused && (
              <motion.span
                key="paused"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-warning"
              >
                Recording paused - Tap to resume
              </motion.span>
            )}

            {state.stage === 'processing' && (
              <motion.span
                key="processing"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-primary"
              >
                Processing audio...
              </motion.span>
            )}

            {state.stage === 'completed' && (
              <motion.span
                key="completed"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-green-600"
              >
                Recording completed!
              </motion.span>
            )}

            {state.stage === 'error' && (
              <motion.span
                key="error"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-destructive"
              >
                {state.error || 'Recording failed'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Control buttons during recording */}
      <AnimatePresence>
        {state.isRecording && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="flex space-x-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={state.isPaused ? resumeRecording : pauseRecording}
            >
              {state.isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStopRecording}
            >
              <Square className="w-4 h-4 mr-1" />
              Stop
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};