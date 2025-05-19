'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from '@supabase/auth-helpers-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push('/profile');
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
