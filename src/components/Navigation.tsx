'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, Users, Coffee, Package, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  if (!user) {
    return null;
  }

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Coffee className="h-6 w-6" />
            <span className="font-bold">Bar System</span>
          </Link>
          
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Dashboard
            </Link>
            
            <Link
              href="/comandas"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Comandas
            </Link>
            
            {['ADMIN', 'CAIXA'].includes(user.role) && (
              <Link
                href="/produtos"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                Produtos
              </Link>
            )}
            
            {user.role === 'ADMIN' && (
              <Link
                href="/usuarios"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                <Users className="h-4 w-4 mr-1 inline" />
                Usuários
              </Link>
            )}
            
            {/* {user.role === 'ADMIN' && (
              <Link
                href="/relatorios"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                <BarChart3 className="h-4 w-4 mr-1 inline" />
                Relatórios
              </Link>
            )} */}
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <span className="text-sm text-muted-foreground">
              {user.name} ({user.role})
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}