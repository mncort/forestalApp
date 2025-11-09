'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { data: session } = useSession();
  const { theme, setTheme, systemTheme } = useTheme();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const toggleTheme = () => {
    const currentTheme = theme === 'system' ? systemTheme : theme;
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <header className="shrink-0 z-50 w-full border-b border-border/50 bg-card shadow-sm">
      <div className="h-16 flex items-center justify-between px-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 hover:opacity-80 transition-all duration-200 group"
        >
          <span className="text-xl leading-none align-middle group-hover:scale-110 transition-transform duration-200">🌲</span>
          <span className="font-bold text-xl leading-none align-middle bg-gradient-primary bg-clip-text text-transparent">Forestal</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all duration-200"
            >
              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                <AvatarImage
                  src={session?.user?.image || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(session?.user?.name || 'Usuario')}&backgroundColor=09090b`}
                  alt={session?.user?.name || 'Usuario'}
                />
                <AvatarFallback className="!bg-primary !text-primary-foreground font-semibold">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 z-[100] border-border/50">
            <DropdownMenuLabel className="flex flex-col space-y-1">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{session?.user?.name}</span>
                <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
                {session?.user?.rol && (
                  <Badge variant="secondary" className="mt-2 w-fit text-xs">
                    {session?.user?.rol}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleTheme}>
              {currentTheme === 'dark' ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Tema Claro</span>
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Tema Oscuro</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
