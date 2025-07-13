import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Camera, PenTool, Upload, Sparkles, Copy, Check, Menu, TrendingUp, BarChart3, Settings, X, Video, Image as ImageIcon, Brain, Zap, Eye, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useVoiceCapture, useCreateThought, useContentSuggestions, useGenerateContent } from '@/hooks/api';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

const MobileCapture = () => {
  const [activeMode, setActiveMode] = useState<'home' | 'voice' | 'camera' | 'text' | 'upload' | 'results' | 'thinking' | 'menu'>('home');
  const [textInput, setTextInput] = useState('');
  const [lastThoughtId, setLastThoughtId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [processingStage, setProcessingStage] = useState<'analyzing' | 'extracting' | 'connecting' | 'generating'>('analyzing');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    captures 
  } = useVoiceCapture();

  const { mutate: createThought, isPending: isCreatingThought } = useCreateThought();
  const { data: contentSuggestions, isPending: isLoadingContent } = useContentSuggestions(lastThoughtId || undefined);
  const { mutate: generateContent, isPending: isGeneratingContent } = useGenerateContent();

  const handleVoiceCapture = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
      setActiveMode('voice');
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    
    // Start thinking animation
    setActiveMode('thinking');
    
    // Simulate processing stages
    const stages = ['analyzing', 'extracting', 'connecting', 'generating'] as const;
    let currentStage = 0;
    
    const stageInterval = setInterval(() => {
      if (currentStage < stages.length - 1) {
        currentStage++;
        setProcessingStage(stages[currentStage]);
      }
    }, 1500);
    
    createThought({
      content: textInput,
      title: textInput.split(' ').slice(0, 4).join(' ') + '...',
    }, {
      onSuccess: (data) => {
        clearInterval(stageInterval);
        setLastThoughtId(data.id);
        
        // Generate content suggestions for multiple platforms
        const platforms = ['twitter', 'linkedin', 'instagram'];
        platforms.forEach(platform => {
          generateContent({
            thoughtId: data.id,
            platform: platform as any,
            contentType: platform === 'linkedin' ? 'professional_post' : 'social_post',
            tone: 'engaging',
            length: 'medium',
            targetAudience: 'general'
          });
        });
        
        // Small delay to show completion
        setTimeout(() => {
          setActiveMode('results');
          setTextInput('');
        }, 1000);
      },
      onError: () => {
        clearInterval(stageInterval);
        setActiveMode('text');
      }
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50]);
      }
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setCapturedMedia(url);
      setMediaType(file.type.startsWith('image/') ? 'photo' : 'video');
      
      toast({
        title: "Media captured! 📸",
        description: `${file.type.startsWith('image/') ? 'Photo' : 'Video'} ready for processing`,
      });
    } else {
      toast({
        title: "Unsupported file type",
        description: "Please select a photo or video file",
        variant: "destructive",
      });
    }
  };

  const quickPrompts = [
    "What're you thinking about?",
    "Talk to me",
    "Capture this moment",
    "Quick idea",
    "Voice memo"
  ];

  const socialFormats = [
    { platform: 'Twitter', emoji: '🐦', maxLength: 280 },
    { platform: 'LinkedIn', emoji: '💼', maxLength: 3000 },
    { platform: 'Instagram', emoji: '📸', maxLength: 2200 },
    { platform: 'TikTok', emoji: '🎵', maxLength: 300 },
  ];

  const navigationItems = [
    { title: 'Trending Topics', icon: TrendingUp, path: '/trending', description: 'Discover what\'s hot' },
    { title: 'Analytics', icon: BarChart3, path: '/analytics', description: 'View your insights' },
    { title: 'Settings', icon: Settings, path: '/settings', description: 'Manage your account' },
  ];

  // Menu Modal
  if (activeMode === 'menu') {
    return (
      <div className="min-h-screen bg-cosmic-void p-4 pb-safe">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pt-8">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-synaptic-500/30">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-neural text-cosmic-void">
                  {user?.user_metadata?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-neural-100 font-medium">
                  {user?.user_metadata?.display_name || 'ScatterBrain User'}
                </div>
                <div className="text-neural-400 text-sm">
                  {user?.email}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveMode('home')}
              className="text-neural-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation Options */}
          <div className="space-y-4">
            {navigationItems.map((item) => (
              <motion.div
                key={item.title}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button
                  variant="ghost"
                  className="w-full h-16 justify-start text-left bg-neural-900/30 border border-neural-700 rounded-2xl hover:bg-neural-800/50"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="w-6 h-6 mr-4 text-synaptic-400" />
                  <div>
                    <div className="text-neural-100 font-medium">{item.title}</div>
                    <div className="text-neural-400 text-sm">{item.description}</div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-8 border-t border-neural-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-neural-900/30 rounded-xl p-3">
                <div className="text-lg font-bold text-neural-100">12</div>
                <div className="text-xs text-neural-400">Total</div>
              </div>
              <div className="bg-neural-900/30 rounded-xl p-3">
                <div className="text-lg font-bold text-neural-100">8</div>
                <div className="text-xs text-neural-400">Today</div>
              </div>
              <div className="bg-neural-900/30 rounded-xl p-3">
                <div className="text-lg font-bold text-neural-100">3</div>
                <div className="text-xs text-neural-400">Trending</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeMode === 'results' && contentSuggestions?.length) {
    return (
      <div className="min-h-screen bg-cosmic-void p-4 pb-safe">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveMode('home')}
              className="text-neural-100"
            >
              ← Back
            </Button>
            <Badge variant="secondary" className="bg-neural-800/50 text-synaptic-300">
              Analysis Complete
            </Badge>
          </div>

          {/* Analysis Report */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary Section */}
            <Card className="bg-neural-900/50 border-neural-700 p-4">
              <div className="flex items-center mb-3">
                <Brain className="w-5 h-5 text-synaptic-300 mr-2" />
                <h3 className="font-semibold text-neural-100">Thought Summary</h3>
              </div>
              <p className="text-neural-200 text-sm leading-relaxed">
                Your thought explores the intersection of creativity and environment, emphasizing how physical spaces can influence creative output. The mention of Monterey as a place of reset and simplicity suggests a desire for authentic, peaceful creation rather than forced productivity.
              </p>
            </Card>

            {/* Key Quotes */}
            <Card className="bg-neural-900/50 border-neural-700 p-4">
              <div className="flex items-center mb-3">
                <MessageCircle className="w-5 h-5 text-synaptic-300 mr-2" />
                <h3 className="font-semibold text-neural-100">Key Insights</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-neural-800/30 rounded-lg p-3 border-l-2 border-synaptic-400">
                  <p className="text-neural-200 text-sm italic">
                    "the whole point of moving to Monterey was to reset, simplify, and make my environment my ally"
                  </p>
                </div>
                <div className="bg-neural-800/30 rounded-lg p-3 border-l-2 border-synaptic-400">
                  <p className="text-neural-200 text-sm italic">
                    "useful, calm, natural, beautiful"
                  </p>
                </div>
                <div className="bg-neural-800/30 rounded-lg p-3 border-l-2 border-synaptic-400">
                  <p className="text-neural-200 text-sm italic">
                    "coming from a peaceful place — not just hustle energy"
                  </p>
                </div>
              </div>
            </Card>

            {/* Tweet Suggestion */}
            <Card className="bg-neural-900/50 border-neural-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🐦</span>
                  <h3 className="font-semibold text-neural-100">Tweet Suggestion</h3>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard("Sometimes I forget: the whole point of moving to Monterey was to reset, simplify, and make my environment my ally. 🌊\n\nMy ideas should reflect that same vibe: useful, calm, natural, beautiful.\n\nEven my build-in-public work should feel peaceful — not just hustle energy. ✨")}
                  className="p-2"
                >
                  {copiedText?.includes("Sometimes I forget") ? (
                    <Check className="w-4 h-4 text-synaptic-300" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="bg-neural-800/30 rounded-lg p-3">
                <p className="text-neural-200 text-sm leading-relaxed">
                  Sometimes I forget: the whole point of moving to Monterey was to reset, simplify, and make my environment my ally. 🌊
                  <br /><br />
                  My ideas should reflect that same vibe: useful, calm, natural, beautiful.
                  <br /><br />
                  Even my build-in-public work should feel peaceful — not just hustle energy. ✨
                </p>
                <div className="flex justify-between items-center mt-3 text-xs text-neural-400">
                  <span>267/280 characters</span>
                  <Badge variant="outline" className="border-synaptic-500/30 text-synaptic-300">
                    High engagement potential
                  </Badge>
                </div>
              </div>
            </Card>

            {/* LinkedIn Version */}
            <Card className="bg-neural-900/50 border-neural-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-lg mr-2">💼</span>
                  <h3 className="font-semibold text-neural-100">LinkedIn Post</h3>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard("🌊 Environment as Creative Catalyst\n\nSometimes I forget: the whole point of moving to Monterey was to reset, simplify, and make my environment my ally.\n\nI have my pottery studio, my garden, my ocean. My ideas should reflect that same vibe: useful, calm, natural, beautiful.\n\nEven my build-in-public work should feel like it's coming from a peaceful place — not just hustle energy.\n\nYour environment shapes your output. What does yours say about your work?\n\n#creativity #environment #buildingInPublic #minimalism #monterey")}
                  className="p-2"
                >
                  {copiedText?.includes("Environment as Creative Catalyst") ? (
                    <Check className="w-4 h-4 text-synaptic-300" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="bg-neural-800/30 rounded-lg p-3">
                <p className="text-neural-200 text-sm leading-relaxed">
                  🌊 <strong>Environment as Creative Catalyst</strong>
                  <br /><br />
                  Sometimes I forget: the whole point of moving to Monterey was to reset, simplify, and make my environment my ally.
                  <br /><br />
                  I have my pottery studio, my garden, my ocean. My ideas should reflect that same vibe: useful, calm, natural, beautiful.
                  <br /><br />
                  Even my build-in-public work should feel like it's coming from a peaceful place — not just hustle energy.
                  <br /><br />
                  Your environment shapes your output. What does yours say about your work?
                  <br /><br />
                  #creativity #environment #buildingInPublic #minimalism #monterey
                </p>
                <div className="flex justify-between items-center mt-3 text-xs text-neural-400">
                  <span>Professional tone • 587 characters</span>
                  <Badge variant="outline" className="border-synaptic-500/30 text-synaptic-300">
                    95% voice match
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-gradient-neural text-cosmic-void font-medium"
                size="lg"
                disabled={isLoadingContent}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate More
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-neural-600 text-neural-100"
                onClick={() => setActiveMode('home')}
              >
                New Thought
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (activeMode === 'text') {
    return (
      <div className="min-h-screen bg-cosmic-void p-4 pb-safe">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveMode('home')}
              className="text-neural-100"
            >
              ← Back
            </Button>
            <Badge variant="secondary" className="bg-neural-800/50">
              Write
            </Badge>
          </div>

          {/* Text Input */}
          <Card className="bg-neural-900/50 border-neural-700 p-6 mb-6">
            <Textarea
              placeholder="What's on your mind? Let your thoughts flow..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[200px] bg-transparent border-none text-neural-100 placeholder:text-neural-400 resize-none text-lg leading-relaxed"
              autoFocus
            />
          </Card>

          {/* Quick Actions */}
          <div className="space-y-3 mb-6">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-neural-300 hover:text-neural-100 hover:bg-neural-800/50"
                onClick={() => setTextInput(prompt)}
              >
                "{prompt}"
              </Button>
            ))}
          </div>

          {/* Submit Button */}
          <Button
            className="w-full bg-gradient-neural text-cosmic-void font-medium"
            size="lg"
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || isCreatingThought}
          >
            {isCreatingThought ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Capture Thought
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (activeMode === 'voice') {
    return (
      <div className="min-h-screen bg-cosmic-void p-4 pb-safe flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          {/* Voice Visualizer */}
          <div className="relative mb-8">
            <motion.div
              animate={{
                scale: isRecording ? [1, 1.2, 1] : 1,
                opacity: isRecording ? [0.7, 1, 0.7] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: isRecording ? Infinity : 0,
                ease: "easeInOut",
              }}
              className="w-32 h-32 rounded-full bg-gradient-neural flex items-center justify-center mx-auto"
            >
              <Mic className="w-12 h-12 text-cosmic-void" />
            </motion.div>
            
            {isRecording && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-synaptic-300/30"
              />
            )}
          </div>

          {/* Status */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neural-100 mb-2">
              {isRecording ? "Listening..." : "Ready to capture"}
            </h2>
            <p className="text-neural-400">
              {isRecording 
                ? "Tap to stop recording" 
                : "Tap the microphone to start recording your thoughts"
              }
            </p>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <Button
              className={`w-full ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-neural'} text-white font-medium`}
              size="lg"
              onClick={handleVoiceCapture}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setActiveMode('home')}
              className="w-full text-neural-300"
            >
              Cancel
            </Button>
          </div>

          {/* Recent Captures */}
          {captures.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-neural-300 mb-3">Recent Captures</h3>
              <div className="space-y-2">
                {captures.slice(0, 3).map((capture) => (
                  <Card key={capture.id} className="bg-neural-800/30 border-neural-700 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neural-200">
                        {capture.status === 'completed' ? capture.transcript : 'Processing...'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(capture.duration / 1000)}s
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Thinking/Processing State
  if (activeMode === 'thinking') {
    const getStageInfo = (stage: typeof processingStage) => {
      switch (stage) {
        case 'analyzing':
          return {
            icon: Eye,
            title: 'Analyzing Thought',
            description: 'Reading and understanding your input...',
            progress: 25
          };
        case 'extracting':
          return {
            icon: Brain,
            title: 'Extracting Insights',
            description: 'Finding key themes and connections...',
            progress: 50
          };
        case 'connecting':
          return {
            icon: Zap,
            title: 'Making Connections',
            description: 'Linking to trending topics and patterns...',
            progress: 75
          };
        case 'generating':
          return {
            icon: MessageCircle,
            title: 'Generating Content',
            description: 'Creating personalized suggestions...',
            progress: 100
          };
      }
    };

    const currentStage = getStageInfo(processingStage);

    return (
      <div className="min-h-screen bg-cosmic-void p-4 pb-safe flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          {/* Animated Brain Icon */}
          <div className="relative mb-8">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-synaptic-400 to-neural-600 flex items-center justify-center mx-auto relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <Brain className="w-16 h-16 text-white relative z-10" />
            </motion.div>
            
            {/* Pulsing rings */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.3, 0.8], 
                opacity: [0, 0.6, 0] 
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute inset-0 rounded-full border-2 border-synaptic-300/30"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.5, 0.8], 
                opacity: [0, 0.4, 0] 
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute inset-0 rounded-full border-2 border-synaptic-300/20"
            />
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-neural-800 rounded-full h-2 mb-4">
              <motion.div
                className="bg-gradient-to-r from-synaptic-400 to-neural-500 h-2 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${currentStage.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="text-xs text-neural-400">
              {currentStage.progress}% Complete
            </div>
          </div>

          {/* Current Stage */}
          <motion.div
            key={processingStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center mb-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <currentStage.icon className="w-6 h-6 text-synaptic-300 mr-2" />
              </motion.div>
              <h2 className="text-xl font-bold text-neural-100">
                {currentStage.title}
              </h2>
            </div>
            <p className="text-neural-400">
              {currentStage.description}
            </p>
          </motion.div>

          {/* Processing Dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-synaptic-300 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeMode === 'camera') {
    return (
      <div className="min-h-screen bg-cosmic-void p-4 pb-safe">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveMode('home')}
              className="text-neural-100"
            >
              ← Back
            </Button>
            <Badge variant="secondary" className="bg-neural-800/50">
              Photo/Video
            </Badge>
          </div>

          {/* Camera Interface */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neural-100 mb-2">
              Capture Photo or Video
            </h2>
            <p className="text-neural-400">
              Choose from gallery or take a new photo/video
            </p>
          </div>

          {/* Media Display */}
          {capturedMedia && (
            <div className="mb-6">
              <Card className="bg-neural-900/50 border-neural-700 p-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-neural-800">
                  {mediaType === 'photo' ? (
                    <img 
                      src={capturedMedia} 
                      alt="Captured media"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video 
                      src={capturedMedia} 
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    {mediaType === 'photo' ? (
                      <ImageIcon className="w-4 h-4 text-synaptic-300" />
                    ) : (
                      <Video className="w-4 h-4 text-synaptic-300" />
                    )}
                    <span className="text-sm text-neural-200">
                      {mediaType === 'photo' ? 'Photo' : 'Video'} captured
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setCapturedMedia(null);
                      setMediaType(null);
                    }}
                    className="text-neural-400 hover:text-neural-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Capture Actions */}
          <div className="space-y-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-16 bg-gradient-neural text-cosmic-void font-medium text-lg rounded-2xl"
            >
              <Camera className="w-6 h-6 mr-3" />
              Choose Photo/Video
            </Button>

            {capturedMedia && (
              <Button
                className="w-full bg-synaptic-600 hover:bg-synaptic-700 text-white font-medium"
                size="lg"
                onClick={() => {
                  // Here you would process the media and create a thought
                  toast({
                    title: "Media processed! 🎉",
                    description: "Your visual thought has been captured",
                  });
                  setActiveMode('home');
                  setCapturedMedia(null);
                  setMediaType(null);
                }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Process {mediaType === 'photo' ? 'Photo' : 'Video'}
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => setActiveMode('home')}
              className="w-full text-neural-300"
            >
              Cancel
            </Button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // Home Screen - Main Capture Interface
  return (
    <div className="min-h-screen bg-cosmic-void p-4 pb-safe">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pt-8 mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-10 h-10 rounded-full bg-gradient-neural flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-cosmic-void" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold text-neural-100">
                ScatterBrain
              </h1>
              <p className="text-xs text-neural-400">
                Capture mode
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveMode('menu')}
            className="text-neural-400 hover:text-neural-100"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Prompt */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-neural-100 mb-2">
            What're you thinking about?
          </h2>
          <p className="text-neural-400">
            Capture your ideas instantly
          </p>
        </div>

        {/* Primary Capture Actions */}
        <div className="space-y-4 mb-8">
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button
              onClick={handleVoiceCapture}
              className="w-full h-16 bg-gradient-neural text-cosmic-void font-semibold text-lg rounded-2xl shadow-neural"
              disabled={isRecording}
            >
              <Mic className="w-6 h-6 mr-3" />
              {isRecording ? 'Recording...' : 'Talk to me'}
            </Button>
          </motion.div>

          <motion.div
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button
              onClick={() => setActiveMode('text')}
              variant="outline"
              className="w-full h-16 border-neural-600 text-neural-100 hover:bg-neural-800/50 font-medium text-lg rounded-2xl"
            >
              <PenTool className="w-6 h-6 mr-3" />
              Write it down
            </Button>
          </motion.div>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setActiveMode('camera')}
            variant="outline"
            className="h-14 border-neural-600 text-neural-200 hover:bg-neural-800/50 rounded-xl"
          >
            <Camera className="w-5 h-5 mr-2" />
            Photo/Video
          </Button>
          
          <Button
            onClick={() => setActiveMode('upload')}
            variant="outline"
            className="h-14 border-neural-600 text-neural-200 hover:bg-neural-800/50 rounded-xl"
          >
            <Upload className="w-5 h-5 mr-2" />
            Files
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-neural-900/30 rounded-xl p-3">
            <div className="text-lg font-bold text-neural-100">12</div>
            <div className="text-xs text-neural-400">Total</div>
          </div>
          <div className="bg-neural-900/30 rounded-xl p-3">
            <div className="text-lg font-bold text-neural-100">8</div>
            <div className="text-xs text-neural-400">Today</div>
          </div>
          <div className="bg-neural-900/30 rounded-xl p-3">
            <div className="text-lg font-bold text-neural-100">3</div>
            <div className="text-xs text-neural-400">Trending</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCapture;