import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuth } from '../components/auth/AuthProvider';
import { Button } from '@heroui/react';

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [avatar_url, setAvatarUrl] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [joinDate, setJoinDate] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
      setJoinDate(user.created_at);
      
      // Get question count from localStorage
      const count = parseInt(localStorage.getItem('questionCount') || '0', 10);
      setQuestionCount(count);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Profile - Miku AI Assistant</title>
        <meta name="description" content="Your profile settings and information" />
      </Head>

      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="">
            {/* Profile Header */}
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center space-x-5">
                {avatar_url ? (
                  <img
                    src={avatar_url}
                    alt={email}
                    className="h-16 w-16 rounded-full"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-default-200 flex items-center justify-center">
                    <span className="text-2xl text-default-500">
                      {email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-default-900">Your Profile</h1>
                  <p className="text-sm text-default-500">{email}</p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-default-500">Email</dt>
                  <dd className="mt-1 text-sm text-default-900">{email}</dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-default-500">Auth Provider</dt>
                  <dd className="mt-1 text-sm text-default-900 capitalize">
                    {user?.app_metadata?.provider || 'email'}
                  </dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-default-500">Join Date</dt>
                  <dd className="mt-1 text-sm text-default-900">
                    {joinDate ? new Date(joinDate).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-default-500">Questions Asked</dt>
                  <dd className="mt-1 text-sm text-default-900">
                    {questionCount} / 10
                    {questionCount >= 10 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Limit Reached
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Actions */}
            <div className="px-4 py-5 sm:px-6 border-t border-default-200">
              <Button
                onPress={handleSignOut}
                disabled={loading}
                className={"bg-default-100 text-default-500"}
                size='sm'
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}