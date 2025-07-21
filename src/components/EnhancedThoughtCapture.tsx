import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Brain, Mic, Upload, FileText, Sparkles, Crown, Users, 
  MessageSquare, Zap, ArrowRight, X, Plus 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { VoiceMemoRecorder } from '@/components/VoiceMemoRecorder';
import { NeuralThinkingAnimation } from '@/components/ui/neural-thinking-animation';
import { NeuralAmbientBackground } from '@/components/ui/neural-ambient-background';
import { ADVISOR_DIRECTORY, type Advisor } from '@/data/advisorsDirectory';

interface EnhancedThoughtCaptureProps {
  onThoughtCapture?: (thought: string, advisors?: Advisor[]) => void;
  advisoryBoard?: Advisor[];
  onBoardUpdate?: (advisors: Advisor[]) => void;
  showAdvisoryIntegration?: boolean;
}

export const EnhancedThoughtCapture: React.FC<EnhancedThoughtCaptureProps> = ({
  onThoughtCapture,
  advisoryBoard = [],
  onBoardUpdate,
  showAdvisoryIntegration = true
}) => {
  const [thought, setThought] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputMethod, setInputMethod] = useState<'text' | 'voice' | 'file'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickAdvisors, setShowQuickAdvisors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick advisor suggestions based on thought content
  const getRelevantAdvisors = (thoughtText: string): Advisor[] => {
    const text = thoughtText.toLowerCase();
    const suggestions: Advisor[] = [];

    // Business/Strategy keywords
    if (text.includes('business') || text.includes('startup') || text.includes('strategy')) {
      suggestions.push(...ADVISOR_DIRECTORY.filter(a => a.category === 'Business').slice(0, 2));
    }

    // Creative keywords
    if (text.includes('creative') || text.includes('design') || text.includes('art')) {
      suggestions.push(...ADVISOR_DIRECTORY.filter(a => a.category === 'Creativity').slice(0, 2));
    }

    // Philosophy/Life keywords
    if (text.includes('life') || text.includes('meaning') || text.includes('purpose')) {
      suggestions.push(...ADVISOR_DIRECTORY.filter(a => a.category === 'Philosophy').slice(0, 2));
    }

    // Technology keywords
    if (text.includes('tech') || text.includes('innovation') || text.includes('ai')) {
      suggestions.push(...ADVISOR_DIRECTORY.filter(a => a.category === 'Technology').slice(0, 2));
    }

    // Remove duplicates and limit to 4
    const unique = suggestions.filter((advisor, index, self) => 
      index === self.findIndex(a => a.id === advisor.id)
    );
    
    return unique.slice(0, 4);
  };

  const handleVoiceTranscription = (transcribedText: string) => {
    setThought(prev => prev ? `${prev}\n\n${transcribedText}` : transcribedText);
    setInputMethod('voice');
    toast.success('Voice recording transcribed successfully!');
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
        setThought(prev => prev ? `${prev}\n\n${content}` : content);
        setInputMethod('file');
        toast.success(`File "${file.name}" uploaded successfully!`);
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
      };
      reader.readAsText(file);
    }
  };

  const addQuickAdvisor = (advisor: Advisor) => {
    if (!advisoryBoard.find(a => a.id === advisor.id)) {
      const newBoard = [...advisoryBoard, advisor];
      onBoardUpdate?.(newBoard);
      toast.success(`${advisor.name} added to your board`);
    }
  };

  const removeAdvisor = (advisorId: string) => {
    const newBoard = advisoryBoard.filter(a => a.id !== advisorId);
    onBoardUpdate?.(newBoard);
  };

  const handleCapture = async () => {
    if (!thought.trim()) {
      toast.error('Please enter your thoughts first');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the onThoughtCapture callback
      onThoughtCapture?.(thought, advisoryBoard);
      
      toast.success('Thoughts captured and processed!');
    } catch (error) {
      toast.error('Failed to process thoughts');
    } finally {
      setIsProcessing(false);
    }
  };

  const relevantAdvisors = thought.length > 20 ? getRelevantAdvisors(thought) : [];

  return (
    <div className="min-h-screen relative">
      <NeuralAmbientBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Thought Capture
            </h1>
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Capture your thoughts with text, voice, or files. Get personalized insights from your advisory board.
          </p>
        </motion.div>

        {/* Main Capture Card */}
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Express Your Thoughts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Methods */}
            <div className="flex justify-center gap-2 mb-4">
              <Button
                variant={inputMethod === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMethod('text')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Text
              </Button>
              <Button
                variant={inputMethod === 'voice' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMethod('voice')}
                className="flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Voice
              </Button>
              <Button
                variant={inputMethod === 'file' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMethod('file')}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>

            {/* Input Area */}
            {inputMethod === 'text' && (
              <Textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="What's on your mind? Share your thoughts, challenges, ideas, or questions..."
                rows={6}
                className="resize-none text-base leading-relaxed"
              />
            )}

            {inputMethod === 'voice' && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                <VoiceMemoRecorder
                  onTranscription={handleVoiceTranscription}
                  onRecordingStart={() => setIsRecording(true)}
                  onRecordingStop={() => setIsRecording(false)}
                  onError={(error) => toast.error(error)}
                />
                {thought && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                    <p className="text-sm text-gray-600 mb-2">Transcribed text:</p>
                    <p className="text-gray-800">{thought}</p>
                  </div>
                )}
              </div>
            )}

            {inputMethod === 'file' && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <Button onClick={handleFileUpload} variant="outline">
                  Choose File
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Upload .txt, .md, .doc, or .docx files
                </p>
                {thought && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-600 mb-2">File content preview:</p>
                    <p className="text-gray-800 text-sm">{thought.substring(0, 200)}...</p>
                  </div>
                )}
              </div>
            )}

            {/* Advisory Board Integration */}
            {showAdvisoryIntegration && (
              <div className="space-y-4">
                {/* Current Advisory Board */}
                {advisoryBoard.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-600" />
                      Your Advisory Board ({advisoryBoard.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {advisoryBoard.map(advisor => (
                        <div key={advisor.id} className="flex items-center gap-2 bg-white rounded-full pr-3 pl-1 py-1 shadow-sm group">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {advisor.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-gray-700">{advisor.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAdvisor(advisor.id)}
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Smart Advisor Suggestions */}
                {relevantAdvisors.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      Suggested Advisors for This Topic
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {relevantAdvisors.map(advisor => (
                        <motion.div
                          key={advisor.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => addQuickAdvisor(advisor)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-sm">
                              {advisor.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{advisor.name}</p>
                            <p className="text-xs text-gray-500 truncate">{advisor.role}</p>
                          </div>
                          <Plus className="h-4 w-4 text-gray-400" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-500">
                {thought.length} characters
                {advisoryBoard.length > 0 && (
                  <span className="ml-2">• {advisoryBoard.length} advisor{advisoryBoard.length !== 1 ? 's' : ''} ready</span>
                )}
              </div>
              <Button
                onClick={handleCapture}
                disabled={!thought.trim() || isProcessing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isProcessing ? (
                  <>
                    <NeuralThinkingAnimation />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    {advisoryBoard.length > 0 ? 'Get Board Insights' : 'Process Thoughts'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};