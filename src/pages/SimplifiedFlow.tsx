import React, { useState, useRef, useEffect } from 'react';
import { Brain, FileText, Mic, Upload, ArrowRight, CheckCircle, Sparkles, Check, Loader2, Twitter, Linkedin, Instagram, Calendar, Copy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useSynthesizeStream, generateSessionId, detectUrgency, useOfflineInsights } from '@/hooks/api';

type FlowStep = 'capture' | 'processing' | 'insights';

interface ClarityReport {
  keyInsights: string[];
  actionItems: string[];
  contentReady: {
    tweet: string;
    linkedin: string;
    instagramCaption: string;
  };
  calendarSuggestions: Array<{
    title: string;
    time: string;
    duration: string;
  }>;
}

interface ProcessingStep {
  id: number;
  text: string;
  completed: boolean;
  current: boolean;
}

export default function SimplifiedFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('capture');
  const [capturedThoughts, setCapturedThoughts] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [clarityReport, setClarityReport] = useState<ClarityReport | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Personalization system
  const {
    userPatterns,
    isReturningUser,
    trackSessionStart,
    trackInputMethod,
    trackThoughtLength,
    trackActionUsage,
    trackSocialCopy,
    getTimeContext,
    getPersonalizedPlaceholder,
    getEstimatedProcessingTime,
    getPrioritizedSocialPlatforms,
    isLikelyToUse
  } = usePersonalization();

  const { 
    synthesizeWithStream, 
    isStreaming, 
    currentInsight,
    accumulatedInsights,
    clearInsights 
  } = useSynthesizeStream();

  const { saveInsight, trackAction } = useOfflineInsights();

  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 1, text: "Capturing your thoughts...", completed: false, current: false },
    { id: 2, text: "Connecting ideas...", completed: false, current: false },
    { id: 3, text: "Finding hidden patterns...", completed: false, current: false },
    { id: 4, text: "Building your insights...", completed: false, current: false },
    { id: 5, text: "Crafting action items...", completed: false, current: false },
  ]);

  // Track session start when component mounts
  useEffect(() => {
    if (userPatterns.sessionCount === 0) {
      trackSessionStart();
    }
  }, []);

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice recognition not supported in your browser');
      return;
    }

    // Track voice input preference
    trackInputMethod('voice');

    setIsRecording(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      setCapturedThoughts(transcript);
    };

    recognition.onerror = () => {
      toast.error('Voice recognition error');
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    
    setTimeout(() => {
      recognition.stop();
      setIsRecording(false);
    }, 10000);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCapturedThoughts(prev => prev + '\n' + content);
      };
      reader.readAsText(file);
    }
  };

  const simulateProcessingSteps = async () => {
    const steps = [...processingSteps];
    
    for (let i = 0; i < steps.length; i++) {
      // Set current step
      steps[i].current = true;
      setProcessingSteps([...steps]);
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Complete step
      steps[i].completed = true;
      steps[i].current = false;
      setProcessingSteps([...steps]);
    }
  };

  const handleCapture = async () => {
    if (!capturedThoughts.trim()) return;
    
    setCurrentStep('processing');
    setIsProcessing(true);
    
    // Reset processing steps
    setProcessingSteps(prev => prev.map(step => ({
      ...step,
      completed: false,
      current: false
    })));
    
    // Start processing animation
    await simulateProcessingSteps();
    
    // Simulate API call to backend
    try {
      // Mock API response for now - replace with actual API call
      const mockResponse = {
        keyInsights: [
          "Your thoughts show 3 main creative themes connecting productivity and innovation",
          "Strong pattern of morning clarity with afternoon ideation bursts",
          "Recurring focus on content strategy and audience engagement optimization"
        ],
        actionItems: [
          "Schedule dedicated creative brainstorming session for tomorrow 9 AM",
          "Research competitor content strategies and document findings",
          "Draft and outline 3 LinkedIn posts based on key insights"
        ],
        contentReady: {
          tweet: "Just had another scattered-brain-to-structured-action moment! 🧠✨ Sometimes the best ideas come from embracing the chaos and finding the hidden patterns. #ProductivityHacks #CreativeProcess",
          linkedin: "The Power of Scattered Thinking: Why Your 'Chaotic' Mind Might Be Your Biggest Asset\n\nToday I realized something profound about how creative minds work...\n\n[Full post content with insights from your thoughts]",
          instagramCaption: "Brain dump ➜ Beautiful clarity ✨\n\nSometimes the most scattered thoughts lead to the most brilliant insights. Trust the process! 🧠💫\n\n#MindfulProductivity #CreativeProcess #BrainDump"
        },
        calendarSuggestions: [
          { title: "Creative Brainstorming Session", time: "Tomorrow 9:00 AM", duration: "90 minutes" },
          { title: "Content Strategy Research", time: "Tomorrow 2:00 PM", duration: "60 minutes" },
          { title: "LinkedIn Content Creation", time: "Friday 10:00 AM", duration: "45 minutes" }
        ]
      };
      
      setClarityReport(mockResponse);
    } catch (error) {
      toast.error('Failed to process thoughts. Please try again.');
      return;
    }
    
    setIsProcessing(false);
    setCurrentStep('insights');
  };

  const resetFlow = () => {
    setCurrentStep('capture');
    setCapturedThoughts('');
    setClarityReport(null);
    setIsProcessing(false);
    setProcessingSteps(prev => prev.map(step => ({
      ...step,
      completed: false,
      current: false
    })));
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard!`);
      
      // Track social platform usage for personalization
      if (type === 'Tweet') trackSocialCopy('twitter');
      else if (type === 'LinkedIn post') trackSocialCopy('linkedin');
      else if (type === 'Instagram caption') trackSocialCopy('instagram');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const addToCalendar = (suggestion: any) => {
    // Track calendar usage for personalization
    trackActionUsage('calendar');
    
    const title = encodeURIComponent(suggestion.title);
    const details = encodeURIComponent(`Duration: ${suggestion.duration}`);
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col" style={{ background: 'var(--gradient-background)' }}>
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Thought Capture */}
          {currentStep === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-3xl mx-auto"
            >
              {/* Brain Icon */}
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div 
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-3 sm:mb-4 md:mb-6 flex items-center justify-center"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 px-2 sm:px-4 leading-tight">
                  {isReturningUser ? `Welcome back! ${getTimeContext().suggestion}` : "What's swirling around in your head?"}
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/70 px-2 sm:px-4 max-w-2xl mx-auto leading-relaxed">
                  {isReturningUser 
                    ? "Ready to transform more scattered thoughts into clear action?" 
                    : "Dump everything here — I'll help you sort it out and turn chaos into clarity."
                  }
                </p>
              </div>

              {/* Input Area */}
              <div className="mb-6 sm:mb-8 px-2 sm:px-0">
                <Textarea
                  placeholder={getPersonalizedPlaceholder()}
                  value={capturedThoughts}
                  onChange={(e) => {
                    setCapturedThoughts(e.target.value);
                    // Track text input preference
                    if (e.target.value.length > 10 && userPatterns.preferredInput !== 'text') {
                      trackInputMethod('text');
                    }
                  }}
                  onBlur={() => {
                    // Track thought length when user finishes typing
                    if (capturedThoughts.length > 0) {
                      trackThoughtLength(capturedThoughts.length);
                    }
                  }}
                  className="h-32 sm:h-36 md:h-40 lg:h-44 rounded-2xl border-purple-500/20 focus:ring-purple-500 text-white placeholder:text-white/50 text-sm sm:text-base resize-none"
                  style={{ 
                    background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                    backdropFilter: 'blur(16px)'
                  }}
                />
              </div>

              {/* Action Bar */}
              <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 px-2 sm:px-0">
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                  <Button 
                    variant="outline" 
                    onClick={handleVoiceInput}
                    disabled={isRecording}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex-shrink-0 min-h-[44px] px-3 sm:px-4 text-sm sm:text-base"
                  >
                    <Mic className={`w-4 h-4 mr-2 ${isRecording ? 'text-red-400 animate-pulse' : ''}`} />
                    {isRecording ? 'Recording...' : 'Voice'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleFileUpload}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex-shrink-0 min-h-[44px] px-3 sm:px-4 text-sm sm:text-base"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                
                <Button 
                  onClick={handleCapture}
                  disabled={!capturedThoughts.trim()}
                  className="text-white font-semibold w-full min-h-[48px] sm:min-h-[52px] text-sm sm:text-base md:text-lg rounded-xl"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Transform My Thoughts</span>
                  <span className="sm:hidden">Transform</span>
                </Button>
              </div>

              {/* Footer */}
              <p className="text-center text-xs sm:text-sm text-white/60 px-2 sm:px-4">
                ✨ Your thoughts are safe with us — everything is processed privately and securely
              </p>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".txt,.md,.doc,.docx"
              />
            </motion.div>
          )}

          {/* Step 2: Processing Magic */}
          {currentStep === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-3xl mx-auto text-center px-3 sm:px-4"
            >
              {/* Neural Network Animation */}
              <div className="mb-6 sm:mb-8">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto mb-4 sm:mb-6">
                  {/* Main circle */}
                  <motion.div
                    className="w-full h-full rounded-full flex items-center justify-center relative"
                    style={{ background: 'var(--gradient-primary)' }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* Floating dots */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"
                        style={{
                          top: '50%',
                          left: '50%',
                          transformOrigin: '0 0',
                        }}
                        animate={{
                          x: Math.cos((i * Math.PI * 2) / 8) * (window.innerWidth < 640 ? 35 : 50),
                          y: Math.sin((i * Math.PI * 2) / 8) * (window.innerWidth < 640 ? 35 : 50),
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                    
                    {/* Inner brain icon */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-purple-600" />
                    </div>
                  </motion.div>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 px-2 sm:px-4">
                  Organizing your beautiful chaos...
                </h2>
                <p className="text-white/70 mb-6 sm:mb-8 px-2 sm:px-4 text-sm sm:text-base md:text-lg">
                  We're connecting your ideas, finding patterns, and crafting actionable insights just for you.
                </p>
              </div>

              {/* Progress Indicators */}
              <div className="space-y-3 sm:space-y-4 px-2 sm:px-4">
                {processingSteps.map((step) => (
                  <motion.div
                    key={step.id}
                    className="flex items-center justify-center space-x-3"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: step.completed || step.current ? 1 : 0.3 }}
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 border-white/30 flex-shrink-0">
                      {step.completed ? (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                      ) : step.current ? (
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 animate-spin" />
                      ) : (
                        <div className="w-2 h-2 bg-white/30 rounded-full" />
                      )}
                    </div>
                    <span className={`text-white text-sm sm:text-base ${step.completed || step.current ? 'font-medium' : 'opacity-50'} text-center`}>
                      {step.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Insights Report */}
          {currentStep === 'insights' && clarityReport && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-7xl mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-4 sm:mb-6 md:mb-8 px-3 sm:px-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">Your Clarity Report</h2>
                <p className="text-white/70 text-sm sm:text-base md:text-lg">From scattered thoughts to structured action</p>
              </div>

              {/* Content Grid */}
              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 md:mb-8 px-3 sm:px-0">
                {/* Key Insights */}
                <Card 
                  className="p-3 sm:p-4 md:p-6 border-white/10"
                  style={{ 
                    background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                    backdropFilter: 'blur(16px)'
                  }}
                >
                  <div className="flex items-center mb-3 sm:mb-4">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-400 mr-2 sm:mr-3 flex-shrink-0" />
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">Key Insights</h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {clarityReport.keyInsights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                        <div 
                          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-xs sm:text-sm"
                          style={{ background: 'var(--gradient-primary)' }}
                        >
                          {index + 1}
                        </div>
                        <p className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Action Items */}
                <Card 
                  className="p-3 sm:p-4 md:p-6 border-white/10"
                  style={{ 
                    background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                    backdropFilter: 'blur(16px)'
                  }}
                >
                  <div className="flex items-center mb-3 sm:mb-4">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-400 mr-2 sm:mr-3 flex-shrink-0" />
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">Action Items</h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {clarityReport.actionItems.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer min-h-[44px]"
                        onClick={() => trackActionUsage('todos')}
                      >
                        <input 
                          type="checkbox" 
                          className="mt-1 accent-green-400 flex-shrink-0 w-4 h-4"
                          onChange={() => trackActionUsage('todos')}
                        />
                        <p className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Content Ready to Share */}
              <Card 
                className="p-4 sm:p-6 mb-6 sm:mb-8 border-white/10"
                style={{ 
                  background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div className="flex items-center justify-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Content Ready to Share</h3>
                  {isReturningUser && (
                    <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                      Personalized
                    </span>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {getPrioritizedSocialPlatforms().map((platform, index) => {
                    const content = platform.name === 'twitter' 
                      ? clarityReport.contentReady.tweet
                      : platform.name === 'linkedin'
                      ? clarityReport.contentReady.linkedin
                      : clarityReport.contentReady.instagramCaption;
                    
                    const IconComponent = platform.name === 'twitter' 
                      ? Twitter 
                      : platform.name === 'linkedin' 
                      ? Linkedin 
                      : Instagram;
                    
                    const iconColor = platform.name === 'twitter' 
                      ? 'text-blue-400' 
                      : platform.name === 'linkedin' 
                      ? 'text-blue-600' 
                      : 'text-pink-500';
                    
                    const displayName = platform.name === 'twitter' 
                      ? 'Twitter' 
                      : platform.name === 'linkedin' 
                      ? 'LinkedIn' 
                      : 'Instagram';
                    
                    const copyType = platform.name === 'twitter' 
                      ? 'Tweet' 
                      : platform.name === 'linkedin' 
                      ? 'LinkedIn post' 
                      : 'Instagram caption';
                    
                    return (
                      <div 
                        key={platform.name} 
                        className={`text-center ${index === 0 && isReturningUser ? 'order-first ring-2 ring-purple-500/50' : ''}`}
                      >
                        <div className="relative">
                          <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor} mx-auto mb-2 sm:mb-3`} />
                          {index === 0 && isReturningUser && platform.usage > 1 && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">★</span>
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">
                          {displayName}
                          {index === 0 && isReturningUser && platform.usage > 1 && (
                            <span className="text-xs text-purple-300 ml-1">(Most Used)</span>
                          )}
                        </h4>
                        <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 min-h-[3.6rem] sm:min-h-[4.2rem]">
                          {content}
                        </p>
                        <Button 
                          onClick={() => copyToClipboard(content, copyType)}
                          size="sm" 
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full text-xs sm:text-sm"
                        >
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Copy
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Calendar Suggestions */}
              <Card 
                className="p-4 sm:p-6 mb-6 sm:mb-8 border-white/10"
                style={{ 
                  background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 text-center">Calendar Suggestions</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clarityReport.calendarSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">{suggestion.title}</h4>
                      <p className="text-white/70 text-xs sm:text-sm mb-1">{suggestion.time}</p>
                      <p className="text-white/60 text-xs sm:text-sm mb-3">{suggestion.duration}</p>
                      <Button 
                        onClick={() => addToCalendar(suggestion)}
                        size="sm" 
                        variant="outline"
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm"
                      >
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Add to Calendar
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="text-center space-y-3 sm:space-y-4 px-3 sm:px-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md mx-auto">
                  <Button 
                    onClick={resetFlow}
                    className="text-white font-semibold w-full sm:flex-1 min-h-[48px] text-sm sm:text-base"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">Analyze More Thoughts</span>
                    <span className="sm:hidden">Analyze More</span>
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:flex-1 min-h-[48px] text-sm sm:text-base"
                  >
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Save Report
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}