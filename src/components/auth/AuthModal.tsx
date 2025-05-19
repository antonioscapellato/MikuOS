'use client';

import { useEffect } from 'react';
import AuthForm from './AuthForm';
import { useRouter } from 'next/router';

import { useAuth } from './AuthProvider';
import { Image } from '@heroui/react';

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function AuthModal({ isOpen, onOpenChange }: AuthModalProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && isOpen) {
      onOpenChange(false);
      router.push('/');
    }
  }, [user, isOpen, onOpenChange, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <AuthForm onSuccess={() => onOpenChange(false)} />
      <div className="absolute w-full h-full bg-default-100 opacity-80 backdrop-blur-md p-4"></div>
    </div>
  );
}
