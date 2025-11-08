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
      <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/40">
            <PageErrorBoundary>
              <div className="theme-container container flex flex-col gap-6">
                {children}
              </div>
            </PageErrorBoundary>
          </main>
        </div>
      </div>
    </PageErrorBoundary>
  );
}
