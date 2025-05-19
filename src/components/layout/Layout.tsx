import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="w-full flex-1 overflow-y-auto p-6 md:pl-12">
        <div className="w-full md:max-w-8xl">
          {children}
        </div>
      </main>
    </div>
  );
}
