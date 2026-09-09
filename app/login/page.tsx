'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { requestPasswordReset, signInWithEmail, switchDemoPersona, signInWithGoogle } from '@/lib/services/auth';
import { Layers, User, ShieldCheck, Lock } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';


export default function LoginPage() {
  const router = useRouter();
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
          router.push('/dashboard/orders');
        }
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (type: 'customer' | 'operator') => {
    switchDemoPersona(type);
    if (type === 'operator') {
      router.push('/admin/orders');
    } else {
      router.push('/dashboard/orders');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setError(res.error);
      } else if (res.user) {
        // Mock mode: user returned directly
        if (res.user.is_admin) {
          router.push('/admin/orders');
        } else {
          router.push('/dashboard/orders');
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
    setError(result.success ? 'Password reset link sent. Check your inbox.' : result.error || 'Password recovery failed.');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111]">
      <Navbar />

      <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-[#E6E4DF] bg-white p-8 shadow-xs">
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded border border-[#111111] bg-[#111111] text-white">
              <Layers className="h-5 w-5 text-[#18794E]" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#111111]">
              Sign in to Artlantix
            </h1>
            <p className="mt-1 text-xs text-[#666666]">
              Access your artwork archives, orders, and vector downloads.
            </p>
          </div>

          {/* Quick 1-Click Zero-Config Demo Switchers for immediate evaluator testing */}
          {!isSupabaseConfigured() && <div className="mt-6 rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] p-3 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
              Instant Demo Access (Zero Config)
            </span>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('customer')}
                className="flex flex-col items-center justify-center rounded border border-[#E6E4DF] bg-white p-2 text-center hover:border-[#111111] transition-colors"
              >
                <User className="h-4 w-4 text-[#111111]" />
                <span className="mt-1 text-[11px] font-bold text-[#111111]">Demo Customer</span>
                <span className="text-[9px] text-[#777777]">Client Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('operator')}
                className="flex flex-col items-center justify-center rounded border border-[#E6E4DF] bg-white p-2 text-center hover:border-[#18794E] transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-[#18794E]" />
                <span className="mt-1 text-[11px] font-bold text-[#111111]">Demo Operator</span>
                <span className="text-[9px] text-[#777777]">Production Queue</span>
              </button>
            </div>
          </div>

          }
          {error && (
            <div className="mt-4 rounded bg-red-50 p-3 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#111111]">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mt-1 w-full rounded border border-[#E6E4DF] bg-white px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#111111]">Password</label>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className="text-[11px] text-[#666666] hover:text-[#18794E]"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded border border-[#E6E4DF] bg-white px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-[#111111] py-2.5 text-xs font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>

            <div className="relative mt-4 flex items-center">
              <div className="flex-1 border-t border-[#E6E4DF]" />
              <span className="mx-3 text-[10px] font-semibold uppercase tracking-wider text-[#888888]">or</span>
              <div className="flex-1 border-t border-[#E6E4DF]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2.5 rounded border border-[#E6E4DF] bg-white py-2.5 text-xs font-bold text-[#111111] hover:bg-[#F8FAFC] hover:border-[#111111] transition-colors disabled:opacity-50"
            >
              {/* Official Google G SVG */}
              <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

          </form>

          <div className="mt-6 border-t border-[#E6E4DF] pt-4 text-center text-xs text-[#666666]">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="font-bold text-[#18794E] hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
