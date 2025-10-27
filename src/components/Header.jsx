'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="navbar h-16 bg-base-100 border-b border-base-300 px-5 sticky top-0 z-50">
      <div className="flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1 h-10"
        >
          <span className="text-xl leading-none align-middle">🌲</span>
          <span className="font-bold text-xl leading-none align-middle">Forestal</span>
        </Link>
      </div>
      <div className="flex gap-2">
        <div className="dropdown dropdown-end z-[1000]">
          <div tabIndex={0} role="button" className="btn btn-primary btn-circle avatar">
            <div className="w-10 rounded-full">
              {session?.user?.image ? (
                <img
                  src={session?.user?.image}
                  alt={session?.user?.name || 'Usuario'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(session?.user?.name || 'Usuario')}&backgroundColor=transparent`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1000] mt-3 w-52 p-2 shadow-lg border border-base-300">
            <li className="menu-title px-4 py-2">
              <div className="flex flex-col">
                <span className="font-semibold text-base-content">{session?.user?.name}</span>
                <span className="text-xs text-base-content/60">{session?.user?.email}</span>
                {session?.user?.rol && (
                  <span className="badge badge-sm badge-primary mt-1">{session?.user?.rol}</span>
                )}
              </div>
            </li>
            <div className="divider my-1"></div>
            <li>
              <button onClick={handleLogout} className="text-error">
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
