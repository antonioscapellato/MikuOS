'use client';

import { createContext, useContext, useState, useCallback } from 'react';

type AuthModalContextType = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  onOpenChange: (isOpen: boolean) => void;
};

const AuthModalContext = createContext<AuthModalContextType>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
  onOpenChange: () => {},
});

export const AuthModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider value={{ 
      isOpen, 
      openModal, 
      closeModal,
      onOpenChange: (isOpen) => isOpen ? openModal() : closeModal()
    }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
