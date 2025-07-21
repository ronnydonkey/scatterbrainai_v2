import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Brain, MessageSquare, Lightbulb, Crown, User, 
  Settings, LogOut, PenTool, Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const CleanNavigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { 
      name: 'Think', 
      path: '/', 
      icon: Brain,
      description: 'Capture and explore your thoughts'
    },
    { 
      name: 'Insights', 
      path: '/gallery', 
      icon: Lightbulb,
      description: 'Discover patterns in your thinking'
    },
    { 
      name: 'Advisors', 
      path: '/board', 
      icon: Crown,
      description: 'Consult your board of advisors'
    },
    { 
      name: 'Synthesis', 
      path: '/synthesis', 
      icon: Sparkles,
      description: 'Refined thoughts from advisor insights'
    }
  ];

  return (
    <nav className="relative z-10 bg-white/90 backdrop-blur border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer transition-all duration-200 hover:opacity-80"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Scatterbrain</span>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `nav-item flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white/90 text-purple-600 border border-purple-200 backdrop-blur'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-purple-100 to-pink-100">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm text-gray-700">
                    {user.email?.split('@')[0] || 'User'}
                  </span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">Sign In</Button>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 p-3 rounded-lg text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-white/90 text-purple-600 backdrop-blur'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};