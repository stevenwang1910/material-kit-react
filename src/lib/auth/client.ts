'use client';

import type { User } from '@/types/user';
import { logAuditEntry } from '@/lib/audit-logger-client';

function generateToken(): string {
  const arr = new Uint8Array(12);
  globalThis.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@devias.io',
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    // Make API request

    // We do not handle the API, so we'll just generate a token and store it in localStorage.
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    // Log audit entry
    await logAuditEntry({
      eventType: 'AUTH_SIGN_UP',
      actor: {},
      action: 'signUp',
      resource: 'userAuthentication',
      status: 'success',
      details: { credentialsType: 'password', email: params.email },
    });

    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;

    // Make API request

    // We do not handle the API, so we'll check if the credentials match with the hardcoded ones.
    if (email !== 'sofia@devias.io' || password !== 'Secret1') {
      // Log failed sign in
      await logAuditEntry({
        eventType: 'AUTH_SIGN_IN_FAILED',
        actor: {},
        action: 'signIn',
        resource: 'userAuthentication',
        status: 'failure',
        details: { credentialsType: 'password', email, error: 'Invalid credentials' },
      });
      return { error: 'Invalid credentials' };
    }

    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    // Log successful sign in
    await logAuditEntry({
      eventType: 'AUTH_SIGN_IN',
      actor: {},
      action: 'signIn',
      resource: 'userAuthentication',
      status: 'success',
      details: { credentialsType: 'password', email },
    });

    return {};
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Make API request

    // We do not handle the API, so just check if we have a token in localStorage.
    const token = localStorage.getItem('custom-auth-token');

    if (!token) {
      return { data: null };
    }

    return { data: user };
  }

  async signOut(): Promise<{ error?: string }> {
    // Get current user before signing out
    const { data: user } = await this.getUser();
    
    localStorage.removeItem('custom-auth-token');

    // Log sign out
    await logAuditEntry({
      eventType: 'AUTH_SIGN_OUT',
      actor: user ? { userId: user.id } : {},
      action: 'signOut',
      resource: 'userAuthentication',
      status: 'success',
      details: {},
    });

    return {};
  }
}

export const authClient = new AuthClient();
