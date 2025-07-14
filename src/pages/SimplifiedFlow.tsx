import React, { useState, useRef } from 'react';
import { Brain, FileText, Mic, Upload, ArrowRight, CheckCircle, Sparkles, Check, Loader2, Twitter, Linkedin, Instagram, Calendar, Copy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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
  
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 1, text: "Capturing your thoughts...", completed: false, current: false },
    { id: 2, text: "Connecting ideas...", completed: false, current: false },
    { id: 3, text: "Finding hidden patterns...", completed: false, current: false },
    { id: 4, text: "Building your insights...", completed: false, current: false },
    { id: 5, text: "Crafting action items...", completed: false, current: false },
  ]);

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice recognition not supported in your browser');
      return;
    }

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
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const addToCalendar = (suggestion: any) => {
    const title = encodeURIComponent(suggestion.title);
    const details = encodeURIComponent(`Duration: ${suggestion.duration}`);
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-background)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Thought Capture */}
          {currentStep === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {/* Brain Icon */}
              <div className="text-center mb-8">
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-3">
                  What's swirling around in your head?
                </h1>
                <p className="text-lg text-white/70">
                  Dump everything here — I'll help you sort it out and turn chaos into clarity.
                </p>
              </div>

              {/* Input Area */}
              <div className="mb-8">
                <Textarea
                  placeholder="Your scattered thoughts, random ideas, todo items, creative sparks... anything goes! I'll connect the dots and show you what matters most."
                  value={capturedThoughts}
                  onChange={(e) => setCapturedThoughts(e.target.value)}
                  className="h-40 rounded-2xl border-purple-500/20 focus:ring-purple-500 text-white placeholder:text-white/50"
                  style={{ 
                    background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                    backdropFilter: 'blur(16px)'
                  }}
                />
              </div>

              {/* Action Bar */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={handleVoiceInput}
                    disabled={isRecording}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Mic className={`w-4 h-4 mr-2 ${isRecording ? 'text-red-400 animate-pulse' : ''}`} />
                    {isRecording ? 'Recording...' : 'Voice'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleFileUpload}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                
                <Button 
                  onClick={handleCapture}
                  disabled={!capturedThoughts.trim()}
                  size="lg"
                  className="text-white font-semibold"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Transform My Thoughts
                </Button>
              </div>

              {/* Footer */}
              <p className="text-center text-sm text-white/60">
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
              className="max-w-2xl mx-auto text-center"
            >
              {/* Neural Network Animation */}
              <div className="mb-8">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  {/* Main circle */}
                  <motion.div
                    className="w-32 h-32 rounded-full flex items-center justify-center relative"
                    style={{ background: 'var(--gradient-primary)' }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* Floating dots */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-white rounded-full"
                        style={{
                          top: '50%',
                          left: '50%',
                          transformOrigin: '0 0',
                        }}
                        animate={{
                          x: Math.cos((i * Math.PI * 2) / 8) * 60,
                          y: Math.sin((i * Math.PI * 2) / 8) * 60,
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
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                  </motion.div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">
                  Organizing your beautiful chaos...
                </h2>
                <p className="text-white/70 mb-8">
                  We're connecting your ideas, finding patterns, and crafting actionable insights just for you.
                </p>
              </div>

              {/* Progress Indicators */}
              <div className="space-y-4">
                {processingSteps.map((step) => (
                  <motion.div
                    key={step.id}
                    className="flex items-center justify-center space-x-3"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: step.completed || step.current ? 1 : 0.3 }}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-white/30">
                      {step.completed ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : step.current ? (
                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      ) : (
                        <div className="w-2 h-2 bg-white/30 rounded-full" />
                      )}
                    </div>
                    <span className={`text-white ${step.completed || step.current ? 'font-medium' : 'opacity-50'}`}>
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
              className="max-w-6xl mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Your Clarity Report</h2>
                <p className="text-white/70 mb-1">From scattered thoughts to structured action</p>
              </div>

              {/* Content Grid */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Key Insights */}
                <Card 
                  className="p-6 border-white/10"
                  style={{ 
                    background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                    backdropFilter: 'blur(16px)'
                  }}
                >
                  <div className="flex items-center mb-4">
                    <Brain className="w-6 h-6 text-purple-400 mr-3" />
                    <h3 className="text-xl font-semibold text-white">Key Insights</h3>
                  </div>
                  <div className="space-y-4">
                    {clarityReport.keyInsights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-sm"
                          style={{ background: 'var(--gradient-primary)' }}
                        >
                          {index + 1}
                        </div>
                        <p className="text-white/80">{insight}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Action Items */}
                <Card 
                  className="p-6 border-white/10"
                  style={{ 
                    background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                    backdropFilter: 'blur(16px)'
                  }}
                >
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                    <h3 className="text-xl font-semibold text-white">Action Items</h3>
                  </div>
                  <div className="space-y-3">
                    {clarityReport.actionItems.map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <input type="checkbox" className="mt-1 accent-green-400" />
                        <p className="text-white/80">{item}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Content Ready to Share */}
              <Card 
                className="p-6 mb-8 border-white/10"
                style={{ 
                  background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <h3 className="text-xl font-semibold text-white mb-6 text-center">Content Ready to Share</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Twitter className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-white mb-3">Twitter</h4>
                    <p className="text-white/70 text-sm mb-4 line-clamp-3">{clarityReport.contentReady.tweet}</p>
                    <Button 
                      onClick={() => copyToClipboard(clarityReport.contentReady.tweet, 'Tweet')}
                      size="sm" 
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <Linkedin className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-white mb-3">LinkedIn</h4>
                    <p className="text-white/70 text-sm mb-4 line-clamp-3">{clarityReport.contentReady.linkedin}</p>
                    <Button 
                      onClick={() => copyToClipboard(clarityReport.contentReady.linkedin, 'LinkedIn post')}
                      size="sm" 
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <Instagram className="w-8 h-8 text-pink-500 mx-auto mb-3" />
                    <h4 className="font-semibold text-white mb-3">Instagram</h4>
                    <p className="text-white/70 text-sm mb-4 line-clamp-3">{clarityReport.contentReady.instagramCaption}</p>
                    <Button 
                      onClick={() => copyToClipboard(clarityReport.contentReady.instagramCaption, 'Instagram caption')}
                      size="sm" 
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Calendar Suggestions */}
              <Card 
                className="p-6 mb-8 border-white/10"
                style={{ 
                  background: 'hsla(217.2, 32.6%, 17.5%, 0.5)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <h3 className="text-xl font-semibold text-white mb-6 text-center">Calendar Suggestions</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {clarityReport.calendarSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <h4 className="font-semibold text-white mb-2">{suggestion.title}</h4>
                      <p className="text-white/70 text-sm mb-1">{suggestion.time}</p>
                      <p className="text-white/60 text-sm mb-3">{suggestion.duration}</p>
                      <Button 
                        onClick={() => addToCalendar(suggestion)}
                        size="sm" 
                        variant="outline"
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Add to Calendar
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="text-center space-y-4">
                <Button 
                  onClick={resetFlow}
                  size="lg"
                  className="text-white font-semibold mr-4"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Analyze More Thoughts
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Copy className="w-5 h-5 mr-2" />
                  Save Report
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}