'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PUBLIC_AUTH_ERRORS } from '@/lib/security';

export default function ResetPasswordPage() {
  const t = useTranslations('passwordReset');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 12 || password.length > 128) return setMessage(t('lengthError'));
    if (password !== confirmation) return setMessage(t('matchError'));
    if (!isSupabaseConfigured()) return setMessage(t('demoError'));
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = supabase
      ? await supabase.auth.updateUser({ password })
      : { error: new Error('Password service is unavailable.') };
    setLoading(false);
    if (error) return setMessage(PUBLIC_AUTH_ERRORS.passwordUpdate);
    setSuccess(true);
    setMessage(t('success'));
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111]">
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-16">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E6E4DF] bg-white p-8 shadow-xs">
          <Lock className="h-7 w-7 text-[#18794E]" />
          <h1 className="mt-4 text-2xl font-bold">{t('title')}</h1>
          <p className="mt-1 text-xs text-[#666]">{t('description')}</p>
          {message && <p role={success ? 'status' : 'alert'} className={`mt-5 rounded-lg p-3 text-xs font-medium ${success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{message}</p>}
          {!success && <div className="mt-6 space-y-4">
            <label className="block text-xs font-bold">{t('newPassword')}<input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#E6E4DF] px-3 py-2" /></label>
            <label className="block text-xs font-bold">{t('confirm')}<input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#E6E4DF] px-3 py-2" /></label>
            <button disabled={loading} className="w-full rounded-lg bg-[#111] py-2.5 text-xs font-bold text-white disabled:opacity-50">{loading ? t('updating') : t('update')}</button>
          </div>}
          <Link href="/login" className="mt-5 inline-block text-xs font-bold text-[#18794E]">{t('return')}</Link>
        </form>
      </main>
      <Footer />
    </div>
  );
}
