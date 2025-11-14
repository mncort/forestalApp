'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Folder, Package, FileText, Users, Warehouse } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  const menuItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/clientes', icon: Users, label: 'Clientes' },
    { href: '/categorias', icon: Folder, label: 'Categorías' },
    { href: '/productos', icon: Package, label: 'Productos' },
    { href: '/inventario', icon: Warehouse, label: 'Inventario' },
    { href: '/presupuestos', icon: FileText, label: 'Presupuestos' },
  ];

  return (
    <aside className="w-64 shrink-0 bg-card border-r border-border/50 overflow-y-auto">
      <nav className="p-4 w-full space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200",
                isActive(item.href)
                  ? "text-foreground font-bold"
                  : "text-muted-foreground font-medium hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              <Icon size={20} className={cn(isActive(item.href) && "stroke-[2.5]")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
