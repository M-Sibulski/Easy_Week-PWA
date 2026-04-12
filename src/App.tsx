import PWABadge from './PWABadge.tsx';
import './App.css';
import Mainscreen from './Mainscreen.tsx';
import { useEffect, useState } from 'react';
import { setViewportHeightVariable } from './setViewportHeight.ts';
import { useSettingsArray } from './hooks/useAppData';
import { AuthProvider } from './auth/AuthProvider';
import AuthScreen from './auth/AuthScreen';
import { runFullSync } from './sync/syncService';
import { useAuth } from './auth/useAuth';

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className='flex h-full items-center justify-center bg-slate-100 p-4 text-center text-sm font-medium text-slate-600'>
      {message}
    </div>
  );
}

function SyncIndicator() {
  return (
    <div
      aria-label='Syncing with Supabase'
      className='flex items-center gap-2 rounded-full bg-slate-900/75 px-3 py-1 text-xs font-semibold text-white'
    >
      <span className='h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white' />
      <span>Syncing</span>
    </div>
  );
}

export function AppShell() {
  const { loading, user } = useAuth();
  const settingsArray = useSettingsArray();
  const isDarkMode = settingsArray?.[0]?.dark ?? true;
  const [initialSyncComplete, setInitialSyncComplete] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    setViewportHeightVariable();
  }, []);

  useEffect(() => {
    if (!user) {
      setInitialSyncComplete(false);
      setSyncError(null);
      return;
    }

    let cancelled = false;
    setInitialSyncComplete(false);
    setSyncError(null);

    void runFullSync()
      .then(() => {
        if (!cancelled) {
          setInitialSyncComplete(true);
        }
      })
      .catch((error) => {
        console.error('Initial Supabase sync failed.', error);
        if (!cancelled) {
          setSyncError(error instanceof Error ? error.message : 'Failed to sync with Supabase.');
          setInitialSyncComplete(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div data-testid='app' className='sm:mx-auto sm:max-w-lg sm:py-5 overflow-y-hidden h-[calc(var(--vh,1vh)*100)]'>
        <div className='relative sm:my-1 mx-auto overflow-y-hidden h-full w-full sm:rounded-2xl shadow-lg/20 flex flex-col'>
          <LoadingScreen message='Restoring your Supabase session...' />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div data-testid='app' className='sm:mx-auto sm:max-w-lg sm:py-5 overflow-y-hidden h-[calc(var(--vh,1vh)*100)]'>
        <div className='relative sm:my-1 mx-auto overflow-y-hidden h-full w-full sm:rounded-2xl shadow-lg/20 flex flex-col'>
          <AuthScreen />
          <PWABadge />
        </div>
      </div>
    );
  }

  return (
    <div data-testid='app' className={(isDarkMode ? 'theme-dark ' : 'theme-light ') + 'sm:mx-auto sm:max-w-lg sm:py-5 overflow-y-hidden h-[calc(var(--vh,1vh)*100)]'}>
      <div className='relative sm:my-1 mx-auto overflow-y-hidden h-full w-full sm:rounded-2xl shadow-lg/20 flex flex-col'>
        <div className='absolute right-2 top-2 z-20 flex items-center gap-2'>
          {!initialSyncComplete && <SyncIndicator />}
          {syncError && (
            <p className='rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-800'>
              Last sync issue: {syncError}
            </p>
          )}
        </div>
        <Mainscreen syncReady={initialSyncComplete} />
        <PWABadge />
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App
