'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell, { authButton, authInput, authLabel } from '@/components/auth/AuthShell';
import { signUpWithEmail } from '@/lib/services/auth';
import { ArrowRight, Building2, User } from 'lucide-react';
import { getSafePostAuthRedirect, INPUT_LIMITS } from '@/lib/security';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafePostAuthRedirect(searchParams.get('next'));
  const [accountType, setAccountType] = useState<'individual' | 'business'>(searchParams.get('type') === 'business' ? 'business' : 'individual');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationRequired, setConfirmationRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signUpWithEmail(email, fullName, password, accountType, companyName, nextPath);
      if (res.error) {
        setError(res.error);
      } else if (res.confirmationRequired) {
        setConfirmationRequired(true);
      } else {
        router.push(nextPath);
      }
    } catch {
      setError('An error occurred while creating your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your Artlantix account"
      intro="One place for your uploads, quotes and finished master files. Creating an account does not start an order and costs nothing."
      points={[
        'Follow every order from review to delivered files.',
        'Business accounts can send a whole batch of artwork at once.',
        'Files stay private to your account; nothing is published.',
      ]}
      footer={
        <>
          Already have an account?{' '}
          <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-ink underline decoration-signal decoration-2 underline-offset-[6px] hover:text-signal-ink">
            Sign in
          </Link>
        </>
      }
    >
      <div className="mt-8 grid grid-cols-2 border border-ink" role="group" aria-label="Account type">
        {([
          ['individual', 'Individual', User],
          ['business', 'Business', Building2],
        ] as const).map(([type, label, Icon], index) => (
          <button
            key={type}
            type="button"
            onClick={() => setAccountType(type)}
            aria-pressed={accountType === type}
            className={`flex items-center justify-center gap-2 py-2.5 text-[14px] font-semibold transition-colors ${index > 0 ? 'border-l border-ink' : ''} ${accountType === type ? 'bg-ink text-paper' : 'text-ink hover:bg-paper-3'}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {confirmationRequired && (
        <p role="status" className="mt-6 border border-ok-line bg-ok-tint px-4 py-3 text-sm text-ok-ink">
          Check your email to confirm your account, then sign in.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="signup-name" className={authLabel}>Full name</label>
          <input
            id="signup-name"
            type="text"
            required
            maxLength={INPUT_LIMITS.name}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Alex Morgan"
            className={authInput}
          />
        </div>

        {accountType === 'business' && (
          <div>
            <label htmlFor="signup-company" className={authLabel}>Company or studio name</label>
            <input
              id="signup-company"
              type="text"
              required
              maxLength={INPUT_LIMITS.company}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Atelier Creative"
              className={authInput}
            />
          </div>
        )}

        <div>
          <label htmlFor="signup-email" className={authLabel}>Email address</label>
          <input
            id="signup-email"
            type="email"
            required
            maxLength={INPUT_LIMITS.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@ateliercreative.com"
            className={authInput}
          />
        </div>

        <div>
          <label htmlFor="signup-password" className={authLabel}>Password</label>
          <input
            id="signup-password"
            type="password"
            required
            minLength={12}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 12 characters"
            className={authInput}
          />
        </div>

        <button type="submit" disabled={loading} className={`${authButton} !mt-7`}>
          <span>{loading ? 'Creating your account…' : 'Create account'}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </AuthShell>
  );
}
