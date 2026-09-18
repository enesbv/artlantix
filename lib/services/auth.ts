import { UserProfile } from '../types';
import { MOCK_CUSTOMER, MOCK_OPERATOR } from '../mock-data';
import { isSupabaseConfigured, createClient } from '../supabase/client';
import { BACKEND_NOT_CONFIGURED_ERROR, isDemoModeEnabled } from '../runtime-mode';
import {
  INPUT_LIMITS,
  normalizeEmail,
  normalizeOptionalText,
  normalizeRequiredText,
  PUBLIC_AUTH_ERRORS,
} from '../security';

const STORAGE_KEY_AUTH = 'artlantix_auth_user';

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (typeof window === 'undefined') return null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) return profile as UserProfile;

          return {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            account_type: 'individual',
            is_admin: false,
            created_at: user.created_at,
          };
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  if (!isDemoModeEnabled()) return null;

  // Explicit development demo storage.
  const stored = localStorage.getItem(STORAGE_KEY_AUTH);
  if (stored) {
    try {
      return JSON.parse(stored) as UserProfile;
    } catch {
      // Parse error, reset to default
    }
  }

  // Default demo user is the customer
  localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(MOCK_CUSTOMER));
  return MOCK_CUSTOMER;
}

export function setCurrentUserMock(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.setItem(STORAGE_KEY_AUTH, 'null');
  } else {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
  }
}

/** Isolated demo guest session. Production guest intake needs a verified server flow. */
export async function createDemoGuestSession(email: string, fullName: string): Promise<UserProfile> {
  if (isSupabaseConfigured() || !isDemoModeEnabled()) {
    throw new Error('Misafir siparişleri henüz etkin değil. Lütfen giriş yapın veya stüdyoyla iletişime geçin.');
  }
  const user: UserProfile = {
    id: `guest_${crypto.randomUUID()}`,
    email: normalizeEmail(email),
    full_name: normalizeRequiredText(fullName, 'Name', INPUT_LIMITS.name),
    account_type: 'individual',
    is_admin: false,
    created_at: new Date().toISOString(),
  };
  setCurrentUserMock(user);
  return user;
}

export async function updateCurrentUserProfile(
  updates: Pick<UserProfile, 'full_name' | 'company_name' | 'phone' | 'vat_tax_id'>
): Promise<{ user: UserProfile | null; error?: string }> {
  const current = await getCurrentUser();
  if (!current) return { user: null, error: 'You must be signed in to update your profile.' };
  let safeUpdates: Pick<UserProfile, 'full_name' | 'company_name' | 'phone' | 'vat_tax_id'>;
  try {
    safeUpdates = {
      full_name: normalizeRequiredText(updates.full_name, 'Full name', INPUT_LIMITS.name),
      company_name: normalizeOptionalText(updates.company_name, 'Company name', INPUT_LIMITS.company),
      phone: normalizeOptionalText(updates.phone, 'Phone number', 40),
      vat_tax_id: normalizeOptionalText(updates.vat_tax_id, 'VAT / tax ID', 80),
    };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : PUBLIC_AUTH_ERRORS.profile };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (!supabase) return { user: null, error: 'Profile service is unavailable.' };
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...safeUpdates, updated_at: new Date().toISOString() })
        .eq('id', current.id)
        .select('*')
        .single();
      if (error) return { user: null, error: PUBLIC_AUTH_ERRORS.profile };
      return { user: data as UserProfile };
    } catch {
      return { user: null, error: PUBLIC_AUTH_ERRORS.profile };
    }
  }

  if (!isDemoModeEnabled()) return { user: null, error: BACKEND_NOT_CONFIGURED_ERROR };
  const updated = { ...current, ...safeUpdates, updated_at: new Date().toISOString() };
  setCurrentUserMock(updated);
  return { user: updated };
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  let normalizedEmail: string;
  try {
    normalizedEmail = normalizeEmail(email);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Enter a valid email address.' };
  }
  if (!isSupabaseConfigured()) {
    return { success: false, error: isDemoModeEnabled()
      ? 'Password email is unavailable in demo mode. Use a demo access button instead.'
      : BACKEND_NOT_CONFIGURED_ERROR };
  }

  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Password recovery is unavailable.' };
    await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    // Always return the same result for existing and non-existing accounts.
    return { success: true };
  } catch {
    return { success: true };
  }
}

export async function signInWithEmail(email: string, password?: string): Promise<{ user: UserProfile | null; error?: string }> {
  if (isSupabaseConfigured()) {
    if (!password) return { user: null, error: 'Password is required.' };
    try {
      const normalizedEmail = normalizeEmail(email);
      const supabase = createClient();
      if (supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) return { user: null, error: PUBLIC_AUTH_ERRORS.signIn };
        if (data.user) {
          const profile = await getCurrentUser();
          return { user: profile };
        }
      }
    } catch {
      return { user: null, error: PUBLIC_AUTH_ERRORS.signIn };
    }
  }

  if (isSupabaseConfigured()) return { user: null, error: 'Unable to sign in. Please try again.' };

  if (!isDemoModeEnabled()) return { user: null, error: BACKEND_NOT_CONFIGURED_ERROR };

  // Explicit development demo sign-in.
  if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('operator')) {
    setCurrentUserMock(MOCK_OPERATOR);
    return { user: MOCK_OPERATOR };
  }

  const customCustomer: UserProfile = {
    ...MOCK_CUSTOMER,
    email,
    full_name: email.split('@')[0],
  };
  setCurrentUserMock(customCustomer);
  return { user: customCustomer };
}

export async function signUpWithEmail(email: string, fullName: string, password?: string, accountType: 'individual' | 'business' = 'individual', companyName?: string, nextPath = '/dashboard'): Promise<{ user: UserProfile | null; error?: string; confirmationRequired?: boolean }> {
  if (isSupabaseConfigured()) {
    if (!password) return { user: null, error: 'Please create an account or sign in before ordering.' };
    if (password.length < 12 || password.length > 128) return { user: null, error: 'Use a password between 12 and 128 characters.' };
    try {
      if (!['individual', 'business'].includes(accountType)) return { user: null, error: PUBLIC_AUTH_ERRORS.signUp };
      const normalizedEmail = normalizeEmail(email);
      const normalizedName = normalizeRequiredText(fullName, 'Full name', INPUT_LIMITS.name);
      const normalizedCompany = normalizeOptionalText(companyName, 'Company name', INPUT_LIMITS.company);
      const supabase = createClient();
      if (supabase && password) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=${encodeURIComponent(nextPath)}`,
            data: {
              full_name: normalizedName,
              account_type: accountType,
              company_name: normalizedCompany,
            },
          },
        });
        if (error) return { user: null, error: PUBLIC_AUTH_ERRORS.signUp };
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: normalizedEmail,
            full_name: normalizedName,
            account_type: accountType,
            company_name: normalizedCompany,
            is_admin: false,
            created_at: new Date().toISOString(),
          };
          return { user: data.session ? profile : null, confirmationRequired: !data.session };
        }
      }
    } catch {
      return { user: null, error: PUBLIC_AUTH_ERRORS.signUp };
    }
  }

  if (isSupabaseConfigured()) return { user: null, error: 'Unable to create the account. Please try again.' };

  if (!isDemoModeEnabled()) return { user: null, error: BACKEND_NOT_CONFIGURED_ERROR };
  const newUser: UserProfile = {
    id: `usr_${Date.now()}`,
    email,
    full_name: fullName,
    account_type: accountType,
    company_name: companyName,
    is_admin: false,
    created_at: new Date().toISOString(),
  };
  setCurrentUserMock(newUser);
  return { user: newUser };
}

export async function signInWithGoogle(nextPath = '/dashboard'): Promise<{ user: UserProfile | null; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          },
        });
        if (error) return { user: null, error: PUBLIC_AUTH_ERRORS.oauth };
        // OAuth redirects; user will be set after callback
        return { user: null };
      }
    } catch {
      return { user: null, error: PUBLIC_AUTH_ERRORS.oauth };
    }
  }

  if (isSupabaseConfigured()) return { user: null, error: 'Unable to start Google sign-in.' };

  if (!isDemoModeEnabled()) return { user: null, error: BACKEND_NOT_CONFIGURED_ERROR };

  // Explicit development demo Google sign-in.
  const googleUser: UserProfile = {
    id: `google_${Date.now()}`,
    email: 'google_user@artlantix-demo.com',
    full_name: 'Google Demo User',
    account_type: 'individual',
    is_admin: false,
    avatar_url: 'https://lh3.googleusercontent.com/a/default-user',
    created_at: new Date().toISOString(),
  };
  setCurrentUserMock(googleUser);
  return { user: googleUser };
}

export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {
      // Ignore error
    }
  }
  setCurrentUserMock(null);
}

export function switchDemoPersona(type: 'customer' | 'operator'): UserProfile {
  if (isSupabaseConfigured() || !isDemoModeEnabled()) throw new Error('Demo accounts are disabled.');
  const target = type === 'operator' ? MOCK_OPERATOR : MOCK_CUSTOMER;
  setCurrentUserMock(target);
  return target;
}
