'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { signUpWithEmail } from '@/lib/services/auth';
import { Layers, ArrowRight, Building2, User } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111]">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-[#E6E4DF] bg-white p-8 shadow-xs">
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded border border-[#111111] bg-[#111111] text-white">
              <Layers className="h-5 w-5 text-[#18794E]" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#111111]">
              Create Your Artlantix Account
            </h1>
            <p className="mt-1 text-xs text-[#666666]">
              Store vector masters forever, track rebuilds, and streamline production.
            </p>
          </div>

          {/* Account Type Selector */}
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] p-1">
            <button
              type="button"
              onClick={() => setAccountType('individual')}
              className={`flex items-center justify-center gap-2 rounded py-2 text-xs font-semibold transition-colors ${
                accountType === 'individual'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Individual / Creator</span>
            </button>

            <button
              type="button"
              onClick={() => setAccountType('business')}
              className={`flex items-center justify-center gap-2 rounded py-2 text-xs font-semibold transition-colors ${
                accountType === 'business'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              <Building2 className="h-3.5 w-3.5 text-[#18794E]" />
              <span>B2B Print &amp; Shop</span>
            </button>
          </div>

          {confirmationRequired && <p role="status" className="mt-4 rounded bg-emerald-50 p-3 text-xs text-emerald-700">Check your email to confirm your account, then sign in.</p>}
          {error && (
            <div className="mt-4 rounded bg-red-50 p-3 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#111111]">Full Name</label>
              <input
                type="text"
                required
                maxLength={INPUT_LIMITS.name}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="mt-1 w-full rounded border border-[#E6E4DF] bg-white px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-hidden"
              />
            </div>

            {accountType === 'business' && (
              <div>
                <label className="block text-xs font-bold text-[#111111]">Company / Studio Name</label>
                <input
                  type="text"
                  required
                  maxLength={INPUT_LIMITS.company}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Atelier Creative Agency"
                  className="mt-1 w-full rounded border border-[#E6E4DF] bg-white px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#111111]">Email Address</label>
              <input
                type="email"
                required
                maxLength={INPUT_LIMITS.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@ateliercreative.com"
                className="mt-1 w-full rounded border border-[#E6E4DF] bg-white px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111]">Password</label>
              <input
                type="password"
                required
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 12 characters"
                className="mt-1 w-full rounded border border-[#E6E4DF] bg-white px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-[#18794E] py-2.5 text-xs font-bold text-white hover:bg-[#18794E] transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account & Continue'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="mt-6 border-t border-[#E6E4DF] pt-4 text-center text-xs text-[#666666]">
            Already have an account?{' '}
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-bold text-[#111111] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
