'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell, { authButton, authGhostButton, authInput, authLabel } from '@/components/auth/AuthShell';
import { requestPasswordReset, signInWithEmail, signInWithGoogle } from '@/lib/services/auth';
import { Lock } from 'lucide-react';
import { INPUT_LIMITS, PASSWORD_RESET_RESPONSE } from '@/lib/security';
import { getSafePostAuthRedirect } from '@/lib/security';


export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafePostAuthRedirect(searchParams.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithEmail(email, password);
      if (res.error) {
        setError(res.error);
      } else {
        if (res.user?.is_admin) {
          router.push('/admin/orders');
        } else {
          router.push(nextPath);
        }
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithGoogle(nextPath);
      if (res.error) {
        setError(res.error);
      } else if (res.user) {
        // Mock mode: user returned directly
        if (res.user.is_admin) {
          router.push('/admin/orders');
        } else {
          router.push(nextPath);
        }
      }
      // Real Supabase: redirect handled by OAuth, no action needed
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setError(null);
    const result = await requestPasswordReset(email);
    setLoading(false);
    setError(result.success ? PASSWORD_RESET_RESPONSE : result.error || 'Password recovery failed.');
  };

  return (
    <AuthShell
      title="Sign in to your studio portal"
      intro="Track your orders, approve previews and download the master files the studio has delivered."
      points={[
        'Your uploads and deliverables stay in your private portal.',
        'Approve a preview, or ask for a revision, from the order page.',
        'Approved masters stay available for re-download.',
      ]}
      footer={
        <>
          Don&apos;t have an account yet?{' '}
          <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-ink underline decoration-signal decoration-2 underline-offset-[6px] hover:text-signal-ink">
            Create one
          </Link>
        </>
      }
    >
      {error && (
        <p role="alert" className="mt-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="login-email" className={authLabel}>Email address</label>
          <input
            id="login-email"
            type="email"
            required
            maxLength={INPUT_LIMITS.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={authInput}
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="login-password" className={authLabel}>Password</label>
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={loading}
              className="text-[13px] font-semibold text-ink-2 underline decoration-signal decoration-2 underline-offset-[5px] hover:text-signal-ink disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>
          <input
            id="login-password"
            type="password"
            required
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={authInput}
          />
        </div>

        <button type="submit" disabled={loading} className={`${authButton} !mt-7`}>
          <Lock className="h-4 w-4" aria-hidden="true" />
          <span>{loading ? 'Signing in…' : 'Sign in'}</span>
        </button>

        <div className="flex items-center gap-4 py-1">
          <span className="h-px flex-1 bg-rule" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">or</span>
          <span className="h-px flex-1 bg-rule" />
        </div>

        <button type="button" onClick={handleGoogleLogin} disabled={loading} className={authGhostButton}>
          {/* Official Google G */}
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>
      </form>
    </AuthShell>
  );
}
