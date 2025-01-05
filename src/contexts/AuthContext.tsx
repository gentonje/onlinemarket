import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    let mounted = true;
    let refreshTimeout: NodeJS.Timeout | null = null;

    const initSession = async () => {
      try {
        console.log('Initializing session...');
        setLoading(true);
        setRetryCount(0);

        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session initialization error:', sessionError);
          handleAuthError(sessionError);
          return;
        }

        if (currentSession) {
          console.log('Found existing session, refreshing...');
          await refreshSession(currentSession);
        } else {
          console.log('No valid session found');
          clearSessionState();
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        handleAuthError(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const refreshSession = async (currentSession: Session) => {
      try {
        if (retryCount >= MAX_RETRIES) {
          console.log('Max retries reached, signing out...');
          await handleSignOut();
          return;
        }

        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession();

        if (refreshError) {
          console.error('Session refresh error:', refreshError);
          if (refreshError.message?.includes('refresh_token_not_found')) {
            await handleSignOut();
            return;
          }
          
          setRetryCount(prev => prev + 1);
          handleAuthError(refreshError);
          return;
        }

        if (mounted && refreshedSession) {
          console.log('Session refreshed successfully');
          setRetryCount(0);
          updateSessionState(refreshedSession);
          scheduleNextRefresh(refreshedSession);
        }
      } catch (error) {
        console.error('Session refresh failed:', error);
        setRetryCount(prev => prev + 1);
        handleAuthError(error);
      }
    };

    const handleSignOut = async () => {
      try {
        await supabase.auth.signOut();
        clearSessionState();
        toast.error('Your session has expired. Please sign in again.');
      } catch (error) {
        console.error('Sign out error:', error);
        clearSessionState();
      }
    };

    const handleAuthError = (error: any) => {
      if (mounted) {
        const errorMessage = error.message || "Authentication error occurred";
        console.error('Auth error:', error);
        
        if (error.message?.includes('session_not_found') || 
            error.message?.includes('refresh_token_not_found') ||
            error.message?.includes('Failed to fetch')) {
          handleSignOut();
        } else if (retryCount < MAX_RETRIES) {
          toast.error(`${errorMessage} - Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          setTimeout(initSession, 1000 * (retryCount + 1));
        } else {
          toast.error(errorMessage);
        }
      }
    };

    const clearSessionState = () => {
      if (mounted) {
        setSession(null);
        setUser(null);
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
          refreshTimeout = null;
        }
      }
    };

    const updateSessionState = (newSession: Session) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession.user);
      }
    };

    const scheduleNextRefresh = (currentSession: Session) => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }

      const expiresIn = currentSession.expires_in || 3600;
      const refreshTime = Math.max(0, (expiresIn - 300) * 1000); // 5 minutes before expiry

      refreshTimeout = setTimeout(() => {
        refreshSession(currentSession);
      }, refreshTime);
    };

    // Initialize the session
    initSession();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          clearSessionState();
          toast.info("You have been signed out.");
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('Session updated');
          if (currentSession) {
            setRetryCount(0);
            updateSessionState(currentSession);
            scheduleNextRefresh(currentSession);
          }
        } else if (event === 'USER_UPDATED') {
          console.log('User updated');
          if (currentSession?.user) {
            setUser(currentSession.user);
          }
        }
        setLoading(false);
      }
    });

    // Cleanup function
    return () => {
      mounted = false;
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      subscription.unsubscribe();
    };
  }, [retryCount]);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};