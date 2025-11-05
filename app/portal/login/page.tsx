'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, AlertCircle, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startAuthentication } from '@simplewebauthn/browser';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        mfaCode: showMfa ? mfaCode : undefined,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'MFA code required') {
          setShowMfa(true);
          setError('Please enter your MFA code');
        } else {
          setError(result.error);
        }
      } else if (result?.ok) {
        router.push('/portal/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWebAuthnLogin = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Get authentication options from server
      const optionsResponse = await fetch('/api/webauthn/authenticate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(errorData.error || 'Failed to get authentication options');
      }

      const options: PublicKeyCredentialRequestOptionsJSON = await optionsResponse.json();

      // Start WebAuthn authentication with the browser
      const credential = await startAuthentication(options);

      // Verify authentication with server
      const verifyResponse = await fetch('/api/webauthn/authenticate-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          credential,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Authentication verification failed');
      }

      const result = await verifyResponse.json();

      if (result.verified) {
        // Sign in with NextAuth using the verified email
        const signInResult = await signIn('credentials', {
          email,
          password: 'webauthn-verified', // Special marker for WebAuthn auth
          redirect: false,
        });

        if (signInResult?.ok) {
          router.push('/portal/dashboard');
        } else {
          throw new Error('Failed to create session');
        }
      }
    } catch (err: any) {
      console.error('WebAuthn login error:', err);

      if (err.name === 'NotAllowedError') {
        setError('Authentication was cancelled or timed out');
      } else if (err.name === 'NotSupportedError') {
        setError('WebAuthn is not supported by your browser');
      } else {
        setError(err.message || 'Failed to sign in with security key');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-accent/10 mb-4">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Client Portal</h1>
          <p className="text-muted">Secure access to your intelligence operations</p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-lg border border-border bg-surface">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* MFA Code (conditional) */}
            {showMfa && (
              <div>
                <label htmlFor="mfaCode" className="block text-sm font-medium mb-2">
                  MFA Code
                </label>
                <input
                  id="mfaCode"
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  required
                  disabled={loading}
                  maxLength={6}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 text-center font-mono text-2xl tracking-widest"
                  placeholder="000000"
                />
                <p className="text-xs text-muted mt-2 text-center">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Authenticating...' : showMfa ? 'Verify & Sign In' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-muted">Or</span>
            </div>
          </div>

          {/* WebAuthn Sign In */}
          <button
            type="button"
            onClick={handleWebAuthnLogin}
            disabled={loading || !email}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg border-2 border-accent/50 bg-accent/10 hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <Key className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-accent">Sign in with Security Key</span>
          </button>
          <p className="text-xs text-center text-muted mt-2">
            {!email ? 'Enter your email address first' : 'Use YubiKey or other FIDO2 device'}
          </p>

          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t border-border text-center space-y-2">
            <p className="text-sm text-muted">
              Need access?{' '}
              <a href="/contact" className="text-accent hover:underline">
                Request an account
              </a>
            </p>
            <p className="text-xs text-muted">
              This portal uses post-quantum encryption (Dilithium + Kyber)
            </p>
          </div>
        </div>

        {/* Demo Credentials (remove in production!) */}
        <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/30">
          <p className="text-xs text-accent font-semibold mb-2">Demo Credentials:</p>
          <p className="text-xs text-muted">
            Email: demo@client.com<br />
            Password: demo123
          </p>
          <p className="text-xs text-muted mt-2">
            (Remove this in production!)
          </p>
        </div>
      </div>
    </div>
  );
}
