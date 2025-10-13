import Link from 'next/link';

export default function Header() {
  return (
    /*<div className="navbar bg-base-100 shadow-lg border-b border-base-300 sticky top-0 z-50">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost normal-case text-xl gap-2">
          🌲 <span className="font-bold">Gestión Forestal</span>
        </Link>
      </div>
      <div className="flex-none gap-2">
        <div className="form-control">
          <input type="text" placeholder="Buscar..." className="input input-bordered w-24 md:w-auto" />
        </div>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-10">
              <span className="text-xl">U</span>
            </div>
          </label>
          <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
            <li><a>Perfil</a></li>
            <li><a>Configuración</a></li>
            <li><a>Cerrar Sesión</a></li>
          </ul>
        </div>
      </div>
    </div>*/

    <div className="navbar bg-base-100 shadow-sm">
  <div className="flex-1">
    <Link href="/" className="btn btn-ghost normal-case text-xl gap-2">
      🌲 <span className="font-bold">Gestión Forestal</span>
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
