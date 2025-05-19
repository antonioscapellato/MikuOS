'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import type { User, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(session?.user ?? null);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      setError(null);

      // Handle auth events
      switch (event) {
        case 'SIGNED_IN':
          router.push('/');
          break;
        case 'SIGNED_OUT':
          router.push('/');
          break;
        case 'USER_UPDATED':
          setUser(session?.user ?? null);
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  const signOut = async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      router.push('/');
    } catch (err) {
      const authError = err as AuthError;
      console.error('Sign out error:', authError);
      setError(authError.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signOut }}>
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
