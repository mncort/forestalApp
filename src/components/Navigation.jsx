'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Folder, Package, FileText, BarChart3 } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  const menuItems = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/categorias', icon: Folder, label: 'Categorías' },
    { href: '/productos', icon: Package, label: 'Productos' },
    { href: '/presupuestos', icon: FileText, label: 'Presupuestos' },
  ];

  return (
    <aside className="w-64 bg-base-100 border-r border-base-300 min-h-screen sticky top-16">
      <ul className="menu p-4 w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={isActive(item.href) ? 'active' : ''}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
