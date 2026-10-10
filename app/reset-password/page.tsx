'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import AuthShell, { authButton, authInput, authLabel } from '@/components/auth/AuthShell';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
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
    <AuthShell
      title={t('title')}
      intro={t('description')}
      points={[
        'Use at least 12 characters.',
        'Signing in again keeps your orders and files exactly as they were.',
      ]}
      footer={
        <Link href="/login" className="font-semibold text-ink underline decoration-signal decoration-2 underline-offset-[6px] hover:text-signal-ink">
          {t('return')}
        </Link>
      }
    >
      {message && (
        <p
          role={success ? 'status' : 'alert'}
          className={`mt-6 border px-4 py-3 text-sm ${success ? 'border-ok-line bg-ok-tint text-ok-ink' : 'border-red-300 bg-red-50 text-red-800'}`}
        >
          {message}
        </p>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="new-password" className={authLabel}>{t('newPassword')}</label>
            <input id="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} className={authInput} />
          </div>
          <div>
            <label htmlFor="confirm-password" className={authLabel}>{t('confirm')}</label>
            <input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={authInput} />
          </div>
          <button type="submit" disabled={loading} className={`${authButton} !mt-7`}>{loading ? t('updating') : t('update')}</button>
        </form>
      )}
    </AuthShell>
  );
}
