'use client';

import { Image, Link } from "@heroui/react";

interface LimitDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LimitDialog({ isOpen, onClose }: LimitDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div 
          className="fixed inset-0 bg-default-100 opacity-90 transition-opacity"
          onClick={onClose}
        />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left transition-all sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-xl font-semibold leading-6 text-gray-900">
                  Usage Limit Reached!
                </h3>
                <Image
                  src="/miku_sad_white.png"
                  alt="Limit reached Miku Sad"
                />
                <div className="mt-4">
                  <p className="text-gray-500">
                    You&apos;ve reached the maximum number of questions (10) for the demo version.
                  </p>
                  <p className="mt-2 text-gray-500">
                    For unlimited access, please contact:
                  </p>
                  <Link
                    href="https://www.linkedin.com/in/antonio-scapellato/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Antonio Scapellato
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
