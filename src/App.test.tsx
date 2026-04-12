import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import App from './App';

const mockUseAuth = vi.fn();
const mockRunFullSync = vi.fn();

vi.mock('./auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth: () => mockUseAuth(),
}));

vi.mock('./hooks/useAppData', () => ({
  useSettingsArray: () => [{ id: 1, syncId: 'set-main', dark: true, main_account_id: 1, week_starting_day: 2, createdAt: new Date(), updatedAt: new Date() }],
}));

vi.mock('./sync/syncService', () => ({
  runFullSync: () => mockRunFullSync(),
}));

vi.mock('./auth/AuthScreen', () => ({
  default: () => <div>Auth screen</div>,
}));

vi.mock('./Mainscreen.tsx', () => ({
  default: ({ syncReady }: { syncReady?: boolean }) => <div>Main screen {syncReady ? 'ready' : 'syncing'}</div>,
}));

vi.mock('./PWABadge.tsx', () => ({
  default: () => <div>PWA badge</div>,
}));

vi.mock('./setViewportHeight.ts', () => ({
  setViewportHeightVariable: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the auth screen when the user is signed out', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      user: null,
      signOut: vi.fn(),
    });

    render(<App />);

    expect(screen.getByTestId('app')).toBeInTheDocument();
    expect(screen.getByText('Auth screen')).toBeInTheDocument();
  });

  it('runs the initial sync before showing the main screen', async () => {
    let resolveSync: (() => void) | undefined;
    mockRunFullSync.mockReturnValue(new Promise<void>((resolve) => {
      resolveSync = resolve;
    }));
    mockUseAuth.mockReturnValue({
      loading: false,
      user: { id: 'user-1', email: 'user@example.com' },
      signOut: vi.fn(),
    });

    render(<App />);

    expect(screen.getByText('Main screen syncing')).toBeInTheDocument();
    expect(screen.getByLabelText('Syncing with Supabase')).toBeInTheDocument();

    resolveSync?.();

    await waitFor(() => {
      expect(screen.getByText('Main screen ready')).toBeInTheDocument();
    });
  });

});