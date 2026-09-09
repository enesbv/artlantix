import { UserProfile } from '../types';
import { MOCK_CUSTOMER, MOCK_OPERATOR } from '../mock-data';
import { isSupabaseConfigured, createClient } from '../supabase/client';

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

  // Fallback to local storage
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

export async function updateCurrentUserProfile(
  updates: Pick<UserProfile, 'full_name' | 'company_name' | 'phone' | 'vat_tax_id'>
): Promise<{ user: UserProfile | null; error?: string }> {
  const current = await getCurrentUser();
  if (!current) return { user: null, error: 'You must be signed in to update your profile.' };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (!supabase) return { user: null, error: 'Profile service is unavailable.' };
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', current.id)
        .select('*')
        .single();
      if (error) return { user: null, error: error.message };
      return { user: data as UserProfile };
    } catch (error: unknown) {
      return { user: null, error: error instanceof Error ? error.message : 'Profile update failed.' };
    }
  }

  const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
  setCurrentUserMock(updated);
  return { user: updated };
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  if (!email.trim()) return { success: false, error: 'Enter your email address first.' };
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Password email is unavailable in demo mode. Use a demo access button instead.' };
  }

  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Password recovery is unavailable.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Password recovery failed.' };
  }
}

export async function signInWithEmail(email: string, password?: string): Promise<{ user: UserProfile | null; error?: string }> {
  if (isSupabaseConfigured()) {
    if (!password) return { user: null, error: 'Password is required.' };
    try {
      const supabase = createClient();
      if (supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { user: null, error: error.message };
        if (data.user) {
          const profile = await getCurrentUser();
          return { user: profile };
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Authentication error';
      return { user: null, error: msg };
    }
  }

  if (isSupabaseConfigured()) return { user: null, error: 'Unable to sign in. Please try again.' };

  // Mock sign-in logic
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

export async function signUpWithEmail(email: string, fullName: string, password?: string, accountType: 'individual' | 'business' = 'individual', companyName?: string): Promise<{ user: UserProfile | null; error?: string; confirmationRequired?: boolean }> {
  if (isSupabaseConfigured()) {
    if (!password) return { user: null, error: 'Please create an account or sign in before ordering.' };
    try {
      const supabase = createClient();
      if (supabase && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              account_type: accountType,
              company_name: companyName,
            },
          },
        });
        if (error) return { user: null, error: error.message };
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email,
            full_name: fullName,
            account_type: accountType,
            company_name: companyName,
            is_admin: false,
            created_at: new Date().toISOString(),
          };
          return { user: data.session ? profile : null, confirmationRequired: !data.session };
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Registration error';
      return { user: null, error: msg };
    }
  }

  if (isSupabaseConfigured()) return { user: null, error: 'Unable to create the account. Please try again.' };

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

export async function signInWithGoogle(): Promise<{ user: UserProfile | null; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
          },
        });
        if (error) return { user: null, error: error.message };
        // OAuth redirects; user will be set after callback
        return { user: null };
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Google authentication error';
      return { user: null, error: msg };
    }
  }

  if (isSupabaseConfigured()) return { user: null, error: 'Unable to start Google sign-in.' };

  // Mock fallback: simulate Google sign-in
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
  if (isSupabaseConfigured()) throw new Error('Demo accounts are disabled when connected to Supabase.');
  const target = type === 'operator' ? MOCK_OPERATOR : MOCK_CUSTOMER;
  setCurrentUserMock(target);
  return target;
}
