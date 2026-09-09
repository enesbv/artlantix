'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateCurrentUserProfile } from '@/lib/services/auth';
import { UserProfile } from '@/lib/types';
import { ShieldCheck } from 'lucide-react';

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [vatTaxId, setVatTaxId] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (u) {
        setUser(u);
        setFullName(u.full_name || '');
        setCompanyName(u.company_name || '');
        setPhone(u.phone || '');
        setVatTaxId(u.vat_tax_id || '');
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    const result = await updateCurrentUserProfile({
      full_name: fullName,
      company_name: companyName,
      phone,
      vat_tax_id: vatTaxId,
    });
    setSaving(false);
    if (result.error || !result.user) {
      setError(result.error || 'Profile changes could not be saved.');
      return;
    }
    setUser(result.user);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="border-b border-[#E6E4DF] pb-4">
        <h1 className="text-xl font-bold tracking-tight text-[#111111]">
          Account &amp; Studio Profile
        </h1>
        <p className="text-xs text-[#666666]">
          Manage your personal details, business invoicing information, and production settings.
        </p>
      </div>

      {saved && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
          ✓ Profile changes saved successfully.
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-xl border border-[#E6E4DF] bg-white p-6 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold text-[#111111]">Email Address</label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="mt-1 w-full rounded border border-[#E6E4DF] bg-[#FAFAF8] px-3.5 py-2 text-xs text-[#888888] cursor-not-allowed"
          />
          <span className="text-[10px] text-[#999999]">Email address is managed by authentication.</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#111111]">Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded border border-[#E6E4DF] bg-white px-3.5 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-hidden"
          />
        </div>

        <div className="border-t border-[#E6E4DF] pt-4">
          <label className="block text-xs font-bold text-[#111111]">Company / Studio Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Atelier Creative Studio"
            className="mt-1 w-full rounded border border-[#E6E4DF] bg-white px-3.5 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#111111]">VAT / Tax Registration Number</label>
          <input
            type="text"
            value={vatTaxId}
            onChange={(e) => setVatTaxId(e.target.value)}
            placeholder="e.g. US-829104882 or EU-123456789"
            className="mt-1 w-full rounded border border-[#E6E4DF] bg-white px-3.5 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#111111]">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="mt-1 w-full rounded border border-[#E6E4DF] bg-white px-3.5 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center justify-between border-t border-[#E6E4DF] pt-5">
          <div className="flex items-center gap-2 text-xs text-[#666666]">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Account Role: {user?.is_admin ? 'Senior Operator / QA' : 'Client Account'}</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded bg-[#111111] px-5 py-2 text-xs font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Profile Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
