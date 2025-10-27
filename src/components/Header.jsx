'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';

export default function Header() {
/*   const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  }; */

  return (
    <div className="navbar h-16 bg-base-100 border-b border-base-300 px-5 sticky top-0 z-20">
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
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              <User size={20} />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow border border-base-300">
            <li className="menu-title px-4 py-2">
              <div className="flex flex-col">
                {/* <span className="font-semibold text-base-content">{session?.user?.name}</span>
                <span className="text-xs text-base-content/60">{session?.user?.email}</span>
                {session?.user?.rol && (
                  <span className="badge badge-sm badge-primary mt-1">{session?.user?.rol}</span>
                )} */}
              </div>
            </li>
            <div className="divider my-1"></div>
            <li>
{/*               <button onClick={handleLogout} className="text-error">
                <LogOut size={16} />
                Cerrar Sesión
              </button> */}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
