import Link from 'next/link';

export default function Header() {
  return (
  <div className="navbar bg-base-100 border-b border-base-300 px-4">
    <div className="flex-1">
       <Link
          href="/"
          className="inline-flex items-center gap-1 h-10"  // fila + alto fijo
        >
          <span className="text-xl leading-none align-middle">🌲</span>
          <span className="font-bold text-xl leading-none align-middle">Forestal</span>
        </Link>
    </div>
    <div className="flex gap-2">
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
          </div>
        </div>
        <ul
          tabIndex="-1"
          className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
          <li>
            <a className="justify-between">
              Profile
              <span className="badge">New</span>
            </a>
          </li>
          <li><a>Settings</a></li>
          <li><a>Logout</a></li>
        </ul>
      </div>
    </div>
  </div>
  );
}
