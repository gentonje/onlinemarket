import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export class SessionManager {
  private static MAX_RETRIES = 3;
  private static RETRY_DELAY = 1000; // 1 second
  private static retryAttempts = new Map<string, number>();
  private static lastRetryTime = new Map<string, number>();

  static async refreshSession(currentSession: Session, retryCount: number): Promise<Session | null> {
    const userId = currentSession?.user?.id;
    if (!userId) return null;

    // Rate limiting
    const now = Date.now();
    const lastRetry = this.lastRetryTime.get(userId) || 0;
    if (now - lastRetry < this.RETRY_DELAY) {
      console.log('Rate limited: Too many refresh attempts');
      return null;
    }
    this.lastRetryTime.set(userId, now);

    // Exponential backoff
    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    await new Promise(resolve => setTimeout(resolve, backoffDelay));

    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        if (error.message?.includes('refresh_token_not_found')) {
          await this.handleSignOut();
          return null;
        }
        throw error;
      }

      if (!session) {
        console.error('No session returned after refresh');
        await this.handleSignOut();
        return null;
      }

      // Reset retry count on success
      this.retryAttempts.delete(userId);
      return session;
    } catch (error) {
      // Increment retry count
      const attempts = (this.retryAttempts.get(userId) || 0) + 1;
      this.retryAttempts.set(userId, attempts);

      console.error(`Session refresh failed (attempt ${attempts}):`, error);
      if (attempts >= this.MAX_RETRIES) {
        await this.handleSignOut();
      }
      return null;
    }
  }

  static async handleSignOut() {
    try {
      await supabase.auth.signOut();
      toast.error('Your session has expired. Please sign in again.');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An error occurred while signing out. Please refresh the page.');
    }
  }

  static scheduleNextRefresh(session: Session, callback: () => void): NodeJS.Timeout {
    const expiresIn = session.expires_in || 3600;
    const refreshTime = Math.max(0, (expiresIn - 300) * 1000); // 5 minutes before expiry
    return setTimeout(callback, refreshTime);
  }
}