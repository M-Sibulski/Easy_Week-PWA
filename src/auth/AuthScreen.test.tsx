import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import AuthScreen from './AuthScreen';

const mockUseAuth = vi.fn();

vi.mock('./useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('AuthScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isConfigured: true,
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      sendMagicLink: vi.fn().mockResolvedValue({ error: null }),
    });
  });

  it('renders the Easy Week branding', () => {
    render(<AuthScreen />);
    expect(screen.getByText('Easy Week')).toBeInTheDocument();
  });

  it('renders the main heading', () => {
    render(<AuthScreen />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders mode selection buttons (sign-in, sign-up, magic-link)', () => {
    render(<AuthScreen />);
    // Mode switcher buttons - use getAllBy since submit also has "Sign in" text
    const signInButtons = screen.getAllByRole('button', { name: /^sign in$/i });
    expect(signInButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /magic link/i })).toBeInTheDocument();
  });

  it('renders email input with correct label', () => {
    render(<AuthScreen />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  // US1 Regression: auth visual-structure consistency assertions
  describe('US1: auth visual-structure consistency', () => {
    it('uses the approved blue primary button pattern for active mode', () => {
      render(<AuthScreen />);
      // The mode-switcher "Sign in" button (type=button) should be active/primary
      const modeButtons = screen.getAllByRole('button', { name: /^sign in$/i });
      const modeSwitchBtn = modeButtons.find(b => b.getAttribute('type') === 'button');
      expect(modeSwitchBtn?.className).toContain('bg-blue-500');
    });

    it('uses the approved secondary button pattern for inactive modes', () => {
      render(<AuthScreen />);
      const signUpBtn = screen.getByRole('button', { name: /sign up/i });
      // Inactive mode buttons should use secondary pattern
      expect(signUpBtn.className).toContain('border');
    });

    it('email input has a visible focus ring (FR-007)', () => {
      render(<AuthScreen />);
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput.className).toContain('focus:ring-2');
    });

    it('displays success status feedback in emerald styling (status-success variant)', async () => {
      mockUseAuth.mockReturnValue({
        isConfigured: true,
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
        signUp: vi.fn().mockResolvedValue({ error: null }),
        sendMagicLink: vi.fn().mockResolvedValue({ error: null }),
      });
      render(<AuthScreen />);
      // Switch to magic-link mode and submit to trigger success message
      await userEvent.click(screen.getByRole('button', { name: /magic link/i }));
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
      await userEvent.click(screen.getByRole('button', { name: /send magic link/i }));
      // Success message should exist with emerald (success) styling
      const successEl = await screen.findByText(/magic link is on its way/i);
      expect(successEl).toBeInTheDocument();
      expect(successEl.className).toMatch(/emerald/);
    });

    it('displays error status feedback in red styling (status-error variant)', async () => {
      mockUseAuth.mockReturnValue({
        isConfigured: true,
        signInWithPassword: vi.fn().mockResolvedValue({ error: 'Invalid credentials' }),
        signUp: vi.fn().mockResolvedValue({ error: null }),
        sendMagicLink: vi.fn().mockResolvedValue({ error: null }),
      });
      render(<AuthScreen />);
      await userEvent.type(screen.getByLabelText(/email/i), 'bad@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
      // Submit form directly to avoid ambiguous button matching
      const form = document.querySelector('form')!;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      const errorMsg = await screen.findByText('Invalid credentials');
      expect(errorMsg).toBeInTheDocument();
      expect(errorMsg.className).toMatch(/red/);
    });
  });
});
