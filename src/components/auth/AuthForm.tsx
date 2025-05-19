'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { AuthError } from '@supabase/supabase-js';
import posthog from 'posthog-js';
import { Button, Image, Input } from '@heroui/react';
import { FaGoogle } from 'react-icons/fa';

type AuthMode = 'signin' | 'signup';

interface AuthFormProps {
  onSuccess?: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const supabase = useSupabaseClient();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get the current site URL for redirects
  const getRedirectURL = () => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      // Use the current hostname and protocol
      const protocol = window.location.protocol;
      const host = window.location.host; // includes hostname and port if present
      return `${protocol}//${host}/auth/callback`;
    }
    // Fallback for server-side
    return `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`;
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getRedirectURL(),
          },
        });
        if (signUpError) throw signUpError;
        
        if (data.user) {
          posthog.identify(data.user.id, {
            email: data.user.email,
            signup_date: new Date().toISOString(),
            auth_method: 'email'
          });
          posthog.capture('user_signed_up', {
            auth_method: 'email',
            email_confirmed: false
          });
          onSuccess?.();
        }
      } else {
        const { error: signInError, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        
        if (data.user) {
          posthog.identify(data.user.id, {
            email: data.user.email,
            last_login: new Date().toISOString(),
            auth_method: 'email'
          });
          posthog.capture('user_signed_in', {
            auth_method: 'email'
          });
          onSuccess?.();
        }
      }
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      posthog.capture('auth_error', {
        error: authError.message,
        auth_method: 'email',
        mode: mode
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectURL(),
        },
      });
      
      if (error) throw error;

      // Since this is OAuth, we'll identify the user after the redirect
      posthog.capture('oauth_initiated', {
        auth_method: 'google'
      });
      // Don't call onSuccess here as we'll handle the redirect in the AuthModal
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      posthog.capture('auth_error', {
        error: authError.message,
        auth_method: 'google'
      });
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="z-50 w-full h-screen md:h-auto py-4 md:max-w-4xl mx-auto">

      {(error || success) && (
        <div
          className={`mb-4 p-4 rounded-lg border transition-all duration-300 ease-in-out ${
            error
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-green-50 border-green-200 text-green-600'
          }`}
        >
          <p className="text-sm font-medium">{error || success}</p>
        </div>
      )}

      <div className="space-x-8 h-screen md:h-auto flex items-center justify-center bg-white rounded-lg p-8 transition-all duration-300 ease-in-out transform">
        <div className="w-full md:w-1/2">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-default-900">
              {mode === 'signin' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mt-2 text-sm text-default-600">
              {mode === 'signin'
                ? 'Sign in to continue to your account'
                : 'Sign up to get started with Miku'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Input
                  label="Email"
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <Input
                  label="Password"
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              className="w-full py-6 bg-default-800 text-default-100 disabled:bg-default-300 disabled:opacity-100 disabled:cursor-not-allowed"
            >
              {mode === 'signin' ? 'Sign in' : 'Sign up'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-default-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-default-500">Or continue with</span>
              </div>
            </div>

            <Button
              onPress={handleGoogleSignIn}
              disabled={loading}
              isLoading={loading}
              className="bg-transparent py-6 w-full text-default-900 border border-default-400"
              startContent={<FaGoogle />}
            >
              Sign in with Google
            </Button>

          </form>

          <div className="mt-6 text-center text-sm">
            <button
              onClick={toggleMode}
              className="text-black hover:underline focus:outline-none transition-colors duration-200"
            >
              {mode === 'signin'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <div className="hidden md:block w-full md:w-1/2 flex items-center justify-end">
          <Image
            src="/miku_logo_white.png"
            alt="Miku Logo"
            width={400}
            height={400}
          />
        </div>

      </div>
    </div>
  );
}
