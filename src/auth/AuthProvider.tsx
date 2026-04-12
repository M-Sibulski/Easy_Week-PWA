import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

type AuthContextValue = {
  isConfigured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  sendMagicLink: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
};

const defaultContextValue: AuthContextValue = {
  isConfigured: isSupabaseConfigured,
  loading: false,
  session: null,
  user: null,
  signInWithPassword: async () => ({ error: 'Supabase is not configured.' }),
  signUp: async () => ({ error: 'Supabase is not configured.' }),
  sendMagicLink: async () => ({ error: 'Supabase is not configured.' }),
  signOut: async () => ({ error: 'Supabase is not configured.' }),
};

const AuthContext = createContext<AuthContextValue>(defaultContextValue);

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

export function useAuth() {
  return useContext(AuthContext);
}
