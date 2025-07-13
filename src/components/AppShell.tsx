import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, Sparkles, BarChart3, Settings, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileCapture from './MobileCapture';

const AppShell = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCapturing, setIsCapturing] = useState(false);
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-void flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-cosmic-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Define navigation tabs and handlers
  const tabs = [
    { id: 'dashboard', path: '/', icon: Brain, label: 'Dashboard' },
    { id: 'trending', path: '/trending', icon: TrendingUp, label: 'Trending' },
    { id: 'generator', path: '/generator', icon: Sparkles, label: 'Generator' },
    { id: 'analytics', path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const currentTab = tabs.find(tab => tab.path === location.pathname) || tabs[0];

  const handleTabPress = (tab: typeof tabs[0]) => {
    navigate(tab.path);
  };

  const handleQuickCapture = () => {
    setIsCapturing(true);
    // Add haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    setTimeout(() => setIsCapturing(false), 200);
    // Navigate to capture modal or expand inline capture
  };

  const tabVariants = {
    inactive: { scale: 1, opacity: 0.6 },
    active: { scale: 1.1, opacity: 1 }
  };

  // Mobile-first experience - show simplified capture interface
  if (isMobile) {
    // Only show simplified mobile capture on the home route
    if (location.pathname === '/') {
      return <MobileCapture />;
    }
    
    // For other routes on mobile, show full navigation with bottom tabs
    return (
      <div className="min-h-screen bg-cosmic-void text-cosmic-light flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-neural-900/80 backdrop-blur-md border-b border-neural-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-neural-100"
            >
              ← Home
            </Button>
            <div className="text-neural-100 font-medium">
              {location.pathname.slice(1).charAt(0).toUpperCase() + location.pathname.slice(2)}
            </div>
            <div className="w-14" /> {/* Spacer */}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-20 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-4">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Bottom Tab Navigation */}
        <motion.nav 
          className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-cosmic-surface/90 border-t border-cosmic-accent/20"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="safe-area-inset-bottom" />
          <div className="px-2 py-2">
            <div className="flex justify-around items-center">
              {tabs.map((tab, index) => {
                const isActive = currentTab.id === tab.id;
                const Icon = tab.icon;
                
                return (
                  <motion.button
                    key={tab.id}
                    className="flex flex-col items-center justify-center p-2 rounded-xl min-h-[44px] min-w-[44px] touch-manipulation"
                    variants={tabVariants}
                    animate={isActive ? "active" : "inactive"}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTabPress(tab)}
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.div
                      className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                        isActive 
                          ? 'bg-gradient-primary text-white' 
                          : 'text-cosmic-muted hover:text-cosmic-light'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gradient-primary blur-sm"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        />
                      )}
                      <Icon className="w-5 h-5 relative z-10" />
                    </motion.div>
                    
                    <motion.span 
                      className={`text-xs mt-1 font-medium transition-colors ${
                        isActive ? 'text-cosmic-light' : 'text-cosmic-muted'
                      }`}
                      animate={{ 
                        scale: isActive ? 1.05 : 1
                      }}
                    >
                      {tab.label}
                    </motion.span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute -top-1 left-1/2 w-1 h-1 bg-cosmic-accent rounded-full"
                        initial={{ scale: 0, x: "-50%" }}
                        animate={{ scale: 1, x: "-50%" }}
                        transition={{ type: "spring", stiffness: 400 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.nav>
      </div>
    );
  }

  // Desktop experience - full navigation and features
  const headerVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const floatingButtonVariants = {
    initial: { scale: 0, rotate: 180 },
    animate: { scale: 1, rotate: 0 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 }
  };

  return (
    <div className="min-h-screen bg-cosmic-void text-cosmic-light flex flex-col overflow-hidden">
      {/* Neural Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-cosmic-void/80 border-b border-cosmic-accent/20"
        variants={headerVariants}
        initial="initial"
        animate="animate"
      >
        <div className="safe-area-inset-top" />
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Logo with neural pulse */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-primary blur-sm"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                ScatterBrain AI
              </h1>
              <motion.p 
                className="text-xs text-cosmic-muted"
                key={currentTab.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentTab.label}
              </motion.p>
            </div>
          </motion.div>

          {/* User Avatar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Avatar className="w-10 h-10 ring-2 ring-cosmic-accent/30">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-secondary text-white">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <main className="flex-1 pt-20 pb-24 overflow-hidden">
        <div className="h-full overflow-y-auto neural-scroll">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-20 right-4 z-40"
        variants={floatingButtonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-gradient-primary hover:bg-gradient-primary border-0 shadow-neural-glow"
          onClick={handleQuickCapture}
        >
          <motion.div
            animate={{ rotate: isCapturing ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Plus className="w-6 h-6" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Bottom Tab Navigation */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-cosmic-surface/90 border-t border-cosmic-accent/20"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="safe-area-inset-bottom" />
        <div className="px-2 py-2">
          <div className="flex justify-around items-center">
            {tabs.map((tab, index) => {
              const isActive = currentTab.id === tab.id;
              const Icon = tab.icon;
              
              return (
                <motion.button
                  key={tab.id}
                  className="flex flex-col items-center justify-center p-2 rounded-xl min-h-[44px] min-w-[44px] touch-manipulation"
                  variants={tabVariants}
                  animate={isActive ? "active" : "inactive"}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTabPress(tab)}
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div
                    className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                      isActive 
                        ? 'bg-gradient-primary text-white' 
                        : 'text-cosmic-muted hover:text-cosmic-light'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-primary blur-sm"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      />
                    )}
                    <Icon className="w-5 h-5 relative z-10" />
                  </motion.div>
                  
                  <motion.span 
                    className={`text-xs mt-1 font-medium transition-colors ${
                      isActive ? 'text-cosmic-light' : 'text-cosmic-muted'
                    }`}
                    animate={{ 
                      scale: isActive ? 1.05 : 1
                    }}
                  >
                    {tab.label}
                  </motion.span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 left-1/2 w-1 h-1 bg-cosmic-accent rounded-full"
                      initial={{ scale: 0, x: "-50%" }}
                      animate={{ scale: 1, x: "-50%" }}
                      transition={{ type: "spring", stiffness: 400 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.nav>
    </div>
  );
};

export default AppShell;