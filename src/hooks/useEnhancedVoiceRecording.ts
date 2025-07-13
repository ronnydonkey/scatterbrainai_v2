import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface AudioProcessingResult {
  audioBlob: Blob;
  duration: number;
  audioUrl: string;
  waveformData?: number[];
}

export interface VoiceRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  hasPermission: boolean | null;
  error: string | null;
  stage: 'idle' | 'requesting-permission' | 'recording' | 'paused' | 'processing' | 'completed' | 'error';
}

export const useEnhancedVoiceRecording = () => {
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioLevel: 0,
    hasPermission: null,
    error: null,
    stage: 'idle',
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Detect browser support and capabilities
  const getBrowserSupport = useCallback(() => {
    const isWebKitBased = /webkit/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    // Determine best audio format
    let mimeType = 'audio/webm;codecs=opus';
    if (isSafari || isIOS) {
      mimeType = 'audio/mp4';
    } else if (isAndroid && !MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm';
    }

    return {
      isWebKitBased,
      isSafari,
      isIOS,
      isAndroid,
      mimeType,
      hasMediaDevices: !!navigator.mediaDevices?.getUserMedia,
      hasMediaRecorder: !!window.MediaRecorder,
      hasAudioContext: !!(window.AudioContext || (window as any).webkitAudioContext),
    };
  }, []);

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    setState(prev => ({ ...prev, stage: 'requesting-permission', error: null }));

    try {
      const browserSupport = getBrowserSupport();
      
      if (!browserSupport.hasMediaDevices) {
        throw new Error('Your browser does not support audio recording');
      }

      if (!browserSupport.hasMediaRecorder) {
        throw new Error('MediaRecorder is not supported in your browser');
      }

      // Enhanced audio constraints for better quality
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 48000, min: 16000 },
          channelCount: { ideal: 1 },
          sampleSize: { ideal: 16, min: 8 },
          ...(browserSupport.isIOS && {
            // iOS-specific optimizations
            latency: { ideal: 0.01 },
          }),
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      setState(prev => ({
        ...prev,
        hasPermission: true,
        stage: 'idle',
        error: null,
      }));

      return stream;
    } catch (error: any) {
      let errorMessage = 'Failed to access microphone';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone permission denied. Please enable microphone access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Audio recording is not supported in your browser.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Your microphone does not meet the required specifications.';
      }

      setState(prev => ({
        ...prev,
        hasPermission: false,
        stage: 'error',
        error: errorMessage,
      }));

      toast({
        title: "Microphone Error",
        description: errorMessage,
        variant: "destructive",
      });

      throw new Error(errorMessage);
    }
  }, [getBrowserSupport]);

  // Setup audio visualization
  const setupAudioVisualization = useCallback((stream: MediaStream) => {
    try {
      const browserSupport = getBrowserSupport();
      
      if (!browserSupport.hasAudioContext) {
        console.warn('AudioContext not supported, skipping visualization');
        return;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      // Start audio level monitoring
      const monitorAudioLevel = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average audio level (0-1)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1);

        setState(prev => ({
          ...prev,
          audioLevel: normalizedLevel,
        }));

        if (state.isRecording) {
          animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
        }
      };

      monitorAudioLevel();
    } catch (error) {
      console.warn('Failed to setup audio visualization:', error);
    }
  }, [getBrowserSupport, state.isRecording]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      let stream = streamRef.current;
      
      if (!stream || !state.hasPermission) {
        stream = await requestPermission();
      }

      if (!stream) {
        throw new Error('No audio stream available');
      }

      const browserSupport = getBrowserSupport();
      
      // Create MediaRecorder with optimal settings
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: browserSupport.mimeType,
        bitsPerSecond: 128000, // 128 kbps for good quality
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      // Setup recording event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setState(prev => ({ ...prev, stage: 'processing' }));
      };

      mediaRecorder.onerror = (event: any) => {
        const error = event.error || new Error('Recording failed');
        setState(prev => ({
          ...prev,
          stage: 'error',
          error: error.message || 'Recording failed',
          isRecording: false,
        }));
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms for smoother visualization

      setState(prev => ({
        ...prev,
        isRecording: true,
        stage: 'recording',
        duration: 0,
        error: null,
      }));

      // Setup audio visualization
      setupAudioVisualization(stream);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setState(prev => ({ ...prev, duration: elapsed }));
      }, 100);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        stage: 'error',
        error: error.message,
        isRecording: false,
      }));
    }
  }, [state.hasPermission, requestPermission, getBrowserSupport, setupAudioVisualization]);

  // Stop recording
  const stopRecording = useCallback(async (): Promise<AudioProcessingResult | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !state.isRecording) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        try {
          const duration = Date.now() - startTimeRef.current;
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
          });
          
          // Create audio URL
          const audioUrl = URL.createObjectURL(audioBlob);

          // Generate waveform data if possible
          let waveformData: number[] | undefined;
          if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            waveformData = Array.from(dataArray);
          }

          const result: AudioProcessingResult = {
            audioBlob,
            duration,
            audioUrl,
            waveformData,
          };

          setState(prev => ({
            ...prev,
            isRecording: false,
            stage: 'completed',
            audioLevel: 0,
          }));

          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
          }

          toast({
            title: "Recording completed",
            description: `${(duration / 1000).toFixed(1)}s of audio captured`,
          });

          resolve(result);
        } catch (error) {
          setState(prev => ({
            ...prev,
            stage: 'error',
            error: 'Failed to process recording',
            isRecording: false,
          }));
          resolve(null);
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, [state.isRecording]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));
      
      if ('vibrate' in navigator) {
        navigator.vibrate([50]);
      }
    }
  }, [state.isRecording, state.isPaused]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isPaused) {
      mediaRecorderRef.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));
      
      if ('vibrate' in navigator) {
        navigator.vibrate([50]);
      }
    }
  }, [state.isPaused]);

  // Reset state
  const reset = useCallback(() => {
    // Clear intervals and animations
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop recording if active
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioLevel: 0,
      hasPermission: null,
      error: null,
      stage: 'idle',
    });

    // Clear references
    mediaRecorderRef.current = null;
    analyserRef.current = null;
    microphoneRef.current = null;
    audioChunksRef.current = [];
  }, [state.isRecording]);

  // Format duration for display
  const formatDuration = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return {
    state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
    formatDuration,
    requestPermission,
    browserSupport: getBrowserSupport(),
  };
};