import React, { useState } from 'react';
import { Brain, FileText, Mic, Upload, ArrowRight, Calendar, Share, Save, Copy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

type FlowStep = 'capture' | 'processing' | 'insights' | 'actions';

interface ClarityReport {
  keyInsights: string[];
  actionItems: string[];
  contentReady: string[];
}

export default function SimplifiedFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('capture');
  const [capturedThoughts, setCapturedThoughts] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [clarityReport, setClarityReport] = useState<ClarityReport | null>(null);

  const handleCapture = async () => {
    if (!capturedThoughts.trim()) return;
    
    setCurrentStep('processing');
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock clarity report
    setClarityReport({
      keyInsights: [
        "3 main themes connecting your ideas about productivity and creativity",
        "Strong pattern of morning productivity with afternoon creative blocks",
        "Recurring themes around content planning and strategy optimization"
      ],
      actionItems: [
        "Schedule content planning session",
        "Research competitor strategies", 
        "Draft LinkedIn post outline"
      ],
      contentReady: [
        "2 tweets ready to share",
        "1 LinkedIn post generated and formatted"
      ]
    });
    
    setIsProcessing(false);
    setCurrentStep('insights');
  };

  const resetFlow = () => {
    setCurrentStep('capture');
    setCapturedThoughts('');
    setClarityReport(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Scatterbrain Simplified
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four-step flow designed for neurodivergent minds: capture thoughts, process magic, receive insights, take action.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8 space-x-4">
          {['capture', 'processing', 'insights', 'actions'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                ${currentStep === step ? 'bg-primary text-primary-foreground' : 
                  index < ['capture', 'processing', 'insights', 'actions'].indexOf(currentStep) ? 
                    'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
              `}>
                {index + 1}
              </div>
              {index < 3 && (
                <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

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
              <Card className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-2">Step 1: Thought Capture</h2>
                  <p className="text-muted-foreground">What's scattered in your mind?</p>
                </div>

                <Textarea
                  placeholder="Drop your thoughts, ideas, or upload files here..."
                  value={capturedThoughts}
                  onChange={(e) => setCapturedThoughts(e.target.value)}
                  className="min-h-32 mb-6 text-center"
                />

                <div className="flex justify-center space-x-4 mb-6">
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Text
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mic className="w-4 h-4 mr-2" />
                    Voice
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    File
                  </Button>
                </div>

                <Button 
                  onClick={handleCapture}
                  disabled={!capturedThoughts.trim()}
                  size="lg"
                  className="w-full"
                >
                  Process My Thoughts
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Processing Magic */}
          {currentStep === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 bg-accent/40 rounded-full flex items-center justify-center"
                    >
                      <div className="w-2 h-2 bg-accent rounded-full" />
                    </motion.div>
                  </div>
                  <h2 className="text-2xl font-bold text-accent mb-2">Step 2: Processing Magic</h2>
                  <p className="text-muted-foreground mb-4">Organizing your thoughts...</p>
                </div>

                <div className="space-y-2 text-sm text-accent">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Connecting ideas → Finding patterns → Building insights
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Your Insight Report */}
          {currentStep === 'insights' && clarityReport && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-primary mb-2">Step 3: Your Insight Report</h2>
                  <p className="text-muted-foreground">Your Clarity Report</p>
                  <p className="text-sm text-accent">From scattered to structured</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-4">
                    <h3 className="font-semibold text-primary mb-3 flex items-center">
                      <span className="mr-2">🔍</span>
                      Key Insights
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {clarityReport.keyInsights.map((insight, index) => (
                        <li key={index} className="text-muted-foreground">
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold text-primary mb-3 flex items-center">
                      <span className="mr-2">✅</span>
                      Action Items
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {clarityReport.actionItems.map((item, index) => (
                        <li key={index} className="text-muted-foreground flex items-start">
                          <span className="mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold text-primary mb-3 flex items-center">
                      <span className="mr-2">📱</span>
                      Content Ready
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {clarityReport.contentReady.map((content, index) => (
                        <li key={index} className="text-muted-foreground">
                          {content}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                <div className="text-center mt-8">
                  <Button 
                    onClick={() => setCurrentStep('actions')}
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    Take Action
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 4: One-Click Actions */}
          {currentStep === 'actions' && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-primary mb-2">Step 4: One-Click Actions</h2>
                  <p className="text-muted-foreground">Take Action</p>
                  <p className="text-sm text-accent">Your next steps, simplified</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Calendar className="w-6 h-6 mb-2" />
                    <span className="text-xs">Add to Calendar</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Share className="w-6 h-6 mb-2" />
                    <span className="text-xs">Post Tweet</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Share className="w-6 h-6 mb-2" />
                    <span className="text-xs">Share LinkedIn</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Save className="w-6 h-6 mb-2" />
                    <span className="text-xs">Save Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Copy className="w-6 h-6 mb-2" />
                    <span className="text-xs">Copy Tasks</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <RotateCcw className="w-6 h-6 mb-2" />
                    <span className="text-xs">New Analysis</span>
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Ready for your next scattered thoughts?</p>
                  <Button 
                    onClick={resetFlow}
                    size="lg"
                    variant="default"
                  >
                    Start Fresh
                    <Brain className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Design Principles Footer */}
        <div className="mt-16 text-center">
          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-4">Design Principles for ADHD/Neurodivergent Users:</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-muted-foreground">
              <div>• Single-task focus at each step</div>
              <div>• Minimal decision fatigue</div>
              <div>• Clear visual hierarchy</div>
              <div>• Immediate gratification</div>
              <div>• No navigation complexity</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}