import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import DesktopAppShell from "./components/desktop/DesktopAppShell";
import NeuralCommandCenter from "./pages/desktop/NeuralCommandCenter";
import ThoughtInspector from "./pages/desktop/ThoughtInspector";
import TrendingPage from "./pages/TrendingPage";
import GeneratorPage from "./pages/GeneratorPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import SimplifiedFlow from "./pages/SimplifiedFlow";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Billing from "./pages/Billing";
import NotFound from "./pages/NotFound";

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
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/simplified" element={<SimplifiedFlow />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/" element={<DesktopAppShell />}>
              <Route index element={<NeuralCommandCenter />} />
              <Route path="inspector" element={<ThoughtInspector />} />
              <Route path="dashboard" element={<AnalyticsPage />} />
              <Route path="trending" element={<TrendingPage />} />
              <Route path="generator" element={<GeneratorPage />} />
              <Route path="library" element={<GeneratorPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="planning" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
