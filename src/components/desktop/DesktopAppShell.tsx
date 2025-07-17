import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Search, 
  Activity, 
  Settings,
  Layers,
  TrendingUp,
  Sparkles,
  Library,
  Archive,
  BarChart3,
  MessageSquare,
  Command,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import UserAccountDropdown from '@/components/UserAccountDropdown';

const navigationItems = [
  {
    id: 'neural-center',
    label: 'Neural Command Center',
    icon: Brain,
    path: '/',
    description: '3D Brain Visualization',
    category: 'core'
  },
  {
    id: 'thought-inspector',
    label: 'Thought Inspector',
    icon: Search,
    path: '/inspector',
    description: 'Detailed Analysis',
    category: 'core'
  },
  {
    id: 'intelligence-dashboard',
    label: 'Intelligence Dashboard',
    icon: Activity,
    path: '/dashboard',
    description: 'Analytics & Insights',
    category: 'core'
  },
  {
    id: 'trending',
    label: 'Trending Intelligence',
    icon: TrendingUp,
    path: '/trending',
    description: 'Real-time Trends',
    category: 'intelligence'
  },
  {
    id: 'generator',
    label: 'Content Generator',
    icon: Sparkles,
    path: '/generator',
    description: 'AI Content Creation',
    category: 'intelligence'
  },
  {
    id: 'library',
    label: 'Content Library',
    icon: Library,
    path: '/library',
    description: 'Content Management',
    category: 'intelligence'
  },
  {
    id: 'gallery',
    label: 'Insight Gallery',
    icon: Archive,
    path: '/gallery',
    description: 'Thought Museum',
    category: 'intelligence'
  },
  {
    id: 'analytics',
    label: 'Performance Analytics',
    icon: BarChart3,
    path: '/analytics',
    description: 'Deep Insights',
    category: 'analytics'
  },
  {
    id: 'strategic-planning',
    label: 'Strategic Planning',
    icon: Layers,
    path: '/planning',
    description: 'Content Strategy',
    category: 'planning'
  }
];

interface DesktopAppShellProps {
  children?: React.ReactNode;
}

export default function DesktopAppShell({ children }: DesktopAppShellProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePanel, setActivePanel] = useState('neural-center');

  const handleNavigation = (path: string, id: string) => {
    setActivePanel(id);
    navigate(path);
  };

  const filteredNavItems = navigationItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categorizedItems = {
    core: filteredNavItems.filter(item => item.category === 'core'),
    intelligence: filteredNavItems.filter(item => item.category === 'intelligence'),
    analytics: filteredNavItems.filter(item => item.category === 'analytics'),
    planning: filteredNavItems.filter(item => item.category === 'planning')
  };

  return (
    <div className="h-screen bg-background overflow-hidden neural-grid cosmic-texture">
      {/* Global Header */}
      <header className="h-16 border-b border-border/50 bg-card/95 backdrop-blur-neural flex items-center justify-between px-6 relative z-50">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="relative">
              <Brain className="h-8 w-8 text-primary neural-pulse" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-glow-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-plasma-pink bg-clip-text text-transparent">
                ScatterBrainAI
              </h1>
              <p className="text-xs text-muted-foreground">Creative Intelligence Platform</p>
            </div>
          </motion.div>

          <Separator orientation="vertical" className="h-8" />

          <div className="flex items-center space-x-2">
            <Command className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">
              Ctrl+K for commands
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search intelligence modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-background/50 border-border/50 focus:border-primary/50"
            />
          </div>
          
          <UserAccountDropdown organization={null} />
        </div>
      </header>

      {/* Main Layout */}
      <div className="h-[calc(100vh-4rem)]">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar */}
          <ResizablePanel 
            defaultSize={sidebarCollapsed ? 5 : 18} 
            minSize={5}
            maxSize={25}
            className="border-r border-border/50"
          >
            <div className="h-full bg-card/95 backdrop-blur-neural">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  {!sidebarCollapsed && (
                    <h2 className="font-semibold text-card-foreground">Navigation</h2>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-2"
                  >
                    {sidebarCollapsed ? (
                      <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                      <PanelLeftClose className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-2 space-y-6 neural-scroll overflow-y-auto h-[calc(100%-5rem)]">
                {Object.entries(categorizedItems).map(([category, items]) => (
                  items.length > 0 && (
                    <div key={category} className="space-y-1">
                      {!sidebarCollapsed && (
                        <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {category.replace('-', ' ')}
                        </h3>
                      )}
                      {items.map((item) => (
                        <Tooltip key={item.id} delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={activePanel === item.id ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => handleNavigation(item.path, item.id)}
                              className={`w-full justify-start transition-all duration-200 ${
                                sidebarCollapsed ? 'px-2' : 'px-3'
                              } ${
                                activePanel === item.id 
                                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow-sm' 
                                  : 'hover:bg-muted/50'
                              }`}
                            >
                              <item.icon className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
                              {!sidebarCollapsed && (
                                <div className="flex-1 text-left">
                                  <div className="font-medium text-sm">{item.label}</div>
                                  <div className="text-xs text-muted-foreground">{item.description}</div>
                                </div>
                              )}
                            </Button>
                          </TooltipTrigger>
                          {sidebarCollapsed && (
                            <TooltipContent side="right">
                              <div>
                                <div className="font-medium">{item.label}</div>
                                <div className="text-xs text-muted-foreground">{item.description}</div>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      ))}
                    </div>
                  )
                ))}
              </div>

              {/* Sidebar Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/30 bg-card/95">
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNavigation('/settings', 'settings')}
                      className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
                    >
                      <Settings className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                      {!sidebarCollapsed && 'Settings & Preferences'}
                    </Button>
                  </TooltipTrigger>
                  {sidebarCollapsed && (
                    <TooltipContent side="right">
                      Settings & Preferences
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Content Area */}
          <ResizablePanel defaultSize={82} minSize={50}>
            <ResizablePanelGroup direction="horizontal">
              {/* Center Stage - Primary Workspace */}
              <ResizablePanel defaultSize={70} minSize={40}>
                <div className="h-full bg-background/50 backdrop-blur-sm">
                  {children || <Outlet />}
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Right Panel - Analysis Tools */}
              <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
                <div className="h-full bg-card/95 backdrop-blur-neural border-l border-border/50">
                  <div className="p-4 border-b border-border/30">
                    <h3 className="font-semibold text-card-foreground flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Analysis Tools
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="neural-card p-4">
                        <h4 className="font-medium mb-2">Quick Insights</h4>
                        <p className="text-sm text-muted-foreground">
                          Real-time analysis and recommendations will appear here.
                        </p>
                      </div>
                      <div className="neural-card p-4">
                        <h4 className="font-medium mb-2">Performance Metrics</h4>
                        <p className="text-sm text-muted-foreground">
                          Live performance data and trends.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Bottom Action Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-card/95 backdrop-blur-neural border-t border-border/50 flex items-center justify-between px-6 z-40">
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-xs">
            Professional Mode
          </Badge>
          <Separator orientation="vertical" className="h-6" />
          <div className="text-xs text-muted-foreground">
            Ready for creative intelligence workflows
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {user?.email}
          </Badge>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>
    </div>
  );
}