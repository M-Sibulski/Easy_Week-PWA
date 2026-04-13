import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export type AuthContextValue = {
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

export const AuthContext = createContext<AuthContextValue>(defaultContextValue);
