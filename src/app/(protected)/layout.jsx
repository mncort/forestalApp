'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PageErrorBoundary from "@/components/PageErrorBoundary";

export default function ProtectedLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Mostrar loading mientras se verifica la sesión
  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Si no hay sesión, no renderizar nada (el useEffect redirigirá)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <PageErrorBoundary>
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 min-h-0 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 bg-base-200 overflow-auto">
            <PageErrorBoundary>
              {children}
            </PageErrorBoundary>
          </main>
        </div>
      </div>
    </PageErrorBoundary>
  );
}
