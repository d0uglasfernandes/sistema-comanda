'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, tenant, updateTheme, logout } = useAuth();
  const [currentTheme, setCurrentTheme] = useState('light');

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'CAIXA':
        return 'Caixa';
      case 'GARCOM':
        return 'Garçom';
      default:
        return role;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleTheme = async () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    await updateTheme(newTheme);
    setCurrentTheme(newTheme);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  // Initialize theme from user data
  useState(() => {
    if (user?.theme) {
      setCurrentTheme(user.theme);
      if (user.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  });

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 h-16">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-4">
          {/* Título removido - agora aparece no Sidebar */}
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0"
            title={currentTheme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
          >
            {currentTheme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* User Avatar with Logout */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getRoleLabel(user?.role || '')}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/configuracoes'}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}