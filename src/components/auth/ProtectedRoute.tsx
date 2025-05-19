'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from '@supabase/auth-helpers-react';
import posthog from 'posthog-js';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/');
    } else {
      // Identify user in PostHog when session exists
      const user = session.user;
      if (user) {
        posthog.identify(user.id, {
          email: user.email,
          last_login: new Date().toISOString(),
          auth_method: user.app_metadata?.provider || 'email',
          user_metadata: user.user_metadata
        });
        
        // Capture sign-in event if coming from OAuth redirect
        if (router.query.type === 'oauth' && router.query.provider) {
          posthog.capture('user_signed_in', {
            auth_method: router.query.provider
          });
        }
      }
    }
  }, [session, router]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return <>{children}</>;
}
