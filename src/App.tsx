import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppRouter } from "./components/AppRouter";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import ThoughtsPage from "./pages/ThoughtsPage";
import TrendingPage from "./pages/TrendingPage";
import GeneratorPage from "./pages/GeneratorPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import SimplifiedFlow from "./pages/SimplifiedFlow";
import InsightGallery from "./pages/InsightGallery";
import DetailedReport from "./pages/DetailedReport";
import SharedInsight from "./pages/SharedInsight";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Billing from "./pages/Billing";
import NotFound from "./pages/NotFound";
import { NeuralBackground } from "@/components/ui/neural-background";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.message?.includes('Authentication required')) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <NeuralBackground variant="subtle" className="min-h-screen">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/landing" element={<AppRouter />} />
              <Route path="/shared-insight/:insightId" element={<SharedInsight />} />
              <Route path="/" element={<AppRouter />} />
              <Route path="/thoughts" element={<AppRouter />} />
              <Route path="/gallery" element={<AppRouter />} />
              <Route path="/capture" element={<AppRouter />} />
              <Route path="/report/:insightId" element={<AppRouter />} />
              <Route path="/profile" element={<AppRouter />} />
              <Route path="/billing" element={<AppRouter />} />
              <Route path="/trending" element={<AppRouter />} />
              <Route path="/generator" element={<AppRouter />} />
              <Route path="/analytics" element={<AppRouter />} />
              <Route path="/settings" element={<AppRouter />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NeuralBackground>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
