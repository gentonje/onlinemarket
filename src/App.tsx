import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Routes } from "@/Routes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BrowserRouter, useLocation } from 'react-router-dom';
import { BottomNav } from '@/components/navigation/BottomNav';

// Create a client with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Cache persists for 30 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: 'always', // Refetch when reconnecting to ensure data consistency
      retry: 1, // Only retry failed requests once
    },
    mutations: {
      retry: 1,
      networkMode: 'always',
    },
  },
});

const App = () => {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading application...</div>}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Suspense>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // Placeholder for TopNav component
  const TopNav = () => <div>Top Navigation Placeholder</div>;

  // Replace with actual authentication logic
  const isAuthenticated = true;

  return (
    <>
      {!isLoginPage && <TopNav />}
      <Routes />
      {!isLoginPage && <BottomNav isAuthenticated={isAuthenticated} />}
      <Toaster />
      <SonnerToaster position="top-right" expand={false} closeButton theme="light" richColors />
    </>
  );
};

export default App;
