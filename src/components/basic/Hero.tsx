import { Image } from "@heroui/react";
import { useAuth } from '../auth/AuthProvider';

export const Hero = () => {
  const { user } = useAuth();

  return (
    <div className="mt-8 mb-16">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mb-8 flex justify-center">
          <Image 
            alt="Miku - AI Agentic Assistant"
            height={100}
            width={100}
            src="/miku_logo_white.png"
            className="animate-pulse-subtle"
          />
        </div>
        
        <h1 className="text-4xl font-medium tracking-tight text-default-900 sm:text-6xl mb-4">
          {user ? (
            <>
              Welcome, <span className="text-default-500">{user?.user_metadata?.name?.split(' ')[0] || 'User'}</span>!
            </>
          ) : (
            <>
              Meet <span className="text-default-500">Miku</span>!
            </>
          )}
        </h1>

        {!user && (
          <h2 className="text-2xl font-light text-default-800 dark:text-default-200 mb-6">
            Your Perfect AI Agentic Assistant
          </h2>
        )}
        
      </div>
    </div>
  );
};