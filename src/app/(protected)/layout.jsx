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
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <Header />
            <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 md:gap-8 md:p-6 lg:p-8">
              <PageErrorBoundary>
                <div className="theme-container container flex flex-1 scroll-mt-20 flex-col gap-6">
                  {children}
                </div>
              </PageErrorBoundary>
            </main>
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  );
}
