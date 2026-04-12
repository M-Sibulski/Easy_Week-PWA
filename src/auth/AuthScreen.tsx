import { FormEvent, useState } from 'react';
import { useAuth } from './AuthProvider';

type Mode = 'sign-in' | 'sign-up' | 'magic-link';

const buttonClassName = 'rounded-md bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300';
const secondaryButtonClassName = 'rounded-md border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100';

const modeLabels: Record<Mode, string> = {
  'sign-in': 'Sign in',
  'sign-up': 'Create account',
  'magic-link': 'Send magic link',
};

export default function AuthScreen() {
  const { isConfigured, signInWithPassword, signUp, sendMagicLink } = useAuth();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      if (mode === 'sign-in') {
        const { error } = await signInWithPassword(email, password);
        if (error) {
          setErrorMessage(error);
        }
      } else if (mode === 'sign-up') {
        const { error } = await signUp(email, password);
        if (error) {
          setErrorMessage(error);
        } else {
          setMessage('Check your inbox to confirm your new account if email confirmation is enabled.');
        }
      } else {
        const { error } = await sendMagicLink(email);
        if (error) {
          setErrorMessage(error);
        } else {
          setMessage('A magic link is on its way to your inbox.');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='flex h-full items-center justify-center bg-slate-100 p-4'>
      <div className='w-full max-w-md rounded-2xl bg-white p-6 shadow-lg shadow-slate-300/30'>
        <div className='mb-6'>
          <p className='text-sm font-semibold uppercase tracking-wide text-blue-600'>Easy Week</p>
          <h1 className='mt-2 text-2xl font-bold text-slate-900'>Sync your budget with Supabase</h1>
          <p className='mt-2 text-sm text-slate-600'>
            Sign in with email and password, create a new account, or request a passwordless magic link.
          </p>
        </div>

        {!isConfigured && (
          <div className='mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800'>
            Supabase is not configured yet. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to start using auth and sync.
          </div>
        )}

        <div className='mb-4 flex flex-wrap gap-2'>
          <button className={mode === 'sign-in' ? buttonClassName : secondaryButtonClassName} onClick={() => setMode('sign-in')} type='button'>
            Sign in
          </button>
          <button className={mode === 'sign-up' ? buttonClassName : secondaryButtonClassName} onClick={() => setMode('sign-up')} type='button'>
            Sign up
          </button>
          <button className={mode === 'magic-link' ? buttonClassName : secondaryButtonClassName} onClick={() => setMode('magic-link')} type='button'>
            Magic link
          </button>
        </div>

        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <label className='flex flex-col gap-1 text-sm font-medium text-slate-700'>
            Email
            <input
              className='rounded-md border border-slate-300 px-3 py-2 text-base outline-none ring-blue-200 focus:ring-2'
              onChange={(event) => setEmail(event.target.value)}
              placeholder='you@example.com'
              required
              type='email'
              value={email}
            />
          </label>

          {mode !== 'magic-link' && (
            <label className='flex flex-col gap-1 text-sm font-medium text-slate-700'>
              Password
              <input
                className='rounded-md border border-slate-300 px-3 py-2 text-base outline-none ring-blue-200 focus:ring-2'
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder='At least 6 characters'
                required
                type='password'
                value={password}
              />
            </label>
          )}

          <button className={buttonClassName} disabled={submitting || !isConfigured} type='submit'>
            {submitting ? 'Working...' : modeLabels[mode]}
          </button>
        </form>

        {message && <p className='mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700'>{message}</p>}
        {errorMessage && <p className='mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700'>{errorMessage}</p>}
      </div>
    </div>
  );
}
