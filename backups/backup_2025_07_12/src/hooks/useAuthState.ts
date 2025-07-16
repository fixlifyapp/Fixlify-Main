
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useAuthState() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;
    
    const handleAuthChange = (event: string, session: Session | null) => {
      console.log('🔐 Auth state change:', event, session ? 'session exists' : 'no session');
      
      if (!mounted) return;
      
      setAuthState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading: false,
        error: null
      }));
    };

    // Set up listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
          setAuthState(prev => ({
            ...prev,
            error: error.message,
            loading: false
          }));
        } else {
          console.log('🔍 Initial session check:', session ? 'found' : 'none');
          setAuthState(prev => ({
            ...prev,
            user: session?.user ?? null,
            session,
            loading: false,
            error: null
          }));
        }
      })
      .catch(error => {
        if (!mounted) return;
        console.error('💥 Session check failed:', error);
        setAuthState(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      setAuthState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  return {
    ...authState,
    signOut,
    isAuthenticated: !!authState.session
  };
}
