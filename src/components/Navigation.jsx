'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-8">
          <Link
            href="/categorias"
            className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
              isActive('/categorias')
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Categorías & Subcategorías
          </Link>
          <Link
            href="/productos"
            className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
              isActive('/productos')
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Productos
          </Link>
        </div>
      </div>
    </div>
  );
}
