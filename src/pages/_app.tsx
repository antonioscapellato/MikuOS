//NextJS
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

// Supabase
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

// Components
import AuthModal from '../components/auth/AuthModal';
import Layout from '../components/layout/Layout';

//Context
import { useAuthModal } from '../context/AuthModalContext';
import { AuthModalProvider } from '../context/AuthModalContext';
import { AuthProvider } from '../components/auth/AuthProvider';
import { DomainPreferencesProvider } from '../context/DomainPreferencesContext';


// Styles
import '../styles/globals.css';

// HeroUI
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from "@heroui/toast";
import {ThemeProvider as NextThemesProvider, ThemeProvider} from "next-themes";


// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AuthModalWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, onOpenChange } = useAuthModal();
  return (
    <>
      {children}
      <AuthModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionContextProvider 
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <HeroUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="light">
          <ToastProvider placement={"top-center"} />
              <AuthProvider>
                <AuthModalProvider>
                  <DomainPreferencesProvider>
                    <AuthModalWrapper>
                      <Layout>
                        <Component {...pageProps} />
                      </Layout>
                    </AuthModalWrapper>
                  </DomainPreferencesProvider>
                </AuthModalProvider>
              </AuthProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </SessionContextProvider>
  );
}
