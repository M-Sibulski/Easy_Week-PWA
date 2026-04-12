import { useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthContext, type AuthContextValue } from './AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Failed to restore Supabase session.', error);
      }

      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isConfigured: isSupabaseConfigured,
    loading,
    session,
    user: session?.user ?? null,
    signInWithPassword: async (email, password) => {
      if (!supabase) {
        return { error: 'Supabase is not configured.' };
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? { error: error.message } : {};
    },
    signUp: async (email, password) => {
      if (!supabase) {
        return { error: 'Supabase is not configured.' };
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      return error ? { error: error.message } : {};
    },
    sendMagicLink: async (email) => {
      if (!supabase) {
        return { error: 'Supabase is not configured.' };
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      return error ? { error: error.message } : {};
    },
    signOut: async () => {
      if (!supabase) {
        return { error: 'Supabase is not configured.' };
      }

      const { error } = await supabase.auth.signOut();
      return error ? { error: error.message } : {};
    },
  }), [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
