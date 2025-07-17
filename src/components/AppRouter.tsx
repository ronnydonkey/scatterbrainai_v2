import { useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedLayout from './AuthenticatedLayout';
import Landing from '@/pages/Landing';
import ThoughtsPage from '@/pages/ThoughtsPage';
import TrendingPage from '@/pages/TrendingPage';
import GeneratorPage from '@/pages/GeneratorPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import SimplifiedFlow from '@/pages/SimplifiedFlow';
import InsightGallery from '@/pages/InsightGallery';
import DetailedReport from '@/pages/DetailedReport';
import Profile from '@/pages/Profile';
import Billing from '@/pages/Billing';

export function AppRouter() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (loading) return;
    
    // If user is authenticated and on landing page, redirect to main app
    if (user && location.pathname === '/landing') {
      navigate('/');
      return;
    }
    
    // If user is not authenticated and trying to access protected routes, redirect to landing
    if (!user && !location.pathname.includes('/auth') && !location.pathname.includes('/landing') && location.pathname !== '/') {
      navigate('/landing');
      return;
    }
    
    // If user is not authenticated and on root, redirect to landing
    if (!user && location.pathname === '/') {
      navigate('/landing');
      return;
    }
  }, [user, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your neural workspace...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user && (location.pathname === '/landing' || location.pathname === '/')) {
    return <Landing />;
  }

  // Show authenticated app routes for authenticated users
  if (user) {
    const path = location.pathname;
    
    // Map routes to components
    const getComponent = () => {
      switch (path) {
        case '/thoughts': return <ThoughtsPage />;
        case '/gallery': return <InsightGallery />;
        case '/capture': return <SimplifiedFlow />;
        case '/profile': return <Profile />;
        case '/billing': return <Billing />;
        case '/trending': return <TrendingPage />;
        case '/generator': return <GeneratorPage />;
        case '/analytics': return <AnalyticsPage />;
        case '/settings': return <SettingsPage />;
        default:
          if (path.startsWith('/report/')) return <DetailedReport />;
          return <SimplifiedFlow />; // Default home
      }
    };
    
    return (
      <div className="min-h-screen bg-background">
        <AuthenticatedLayout>
          {getComponent()}
        </AuthenticatedLayout>
      </div>
    );
  }

  // Fallback - shouldn't reach here due to useEffect redirects
  return <Landing />;
}