'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useSidebar } from '@/components/MainLayout';
import { 
  Home, 
  Package, 
  Receipt, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  BarChart3,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: <Home className="w-4 h-4" />,
  },
  {
    label: 'Produtos',
    href: '/produtos',
    icon: <Package className="w-4 h-4" />,
    roles: ['ADMIN', 'CAIXA'],
  },
  {
    label: 'Comandas',
    href: '/comandas',
    icon: <Receipt className="w-4 h-4" />,
  },
  // {
  //   label: 'Relatórios',
  //   href: '/relatorios',
  //   icon: <BarChart3 className="w-4 h-4" />,
  //   roles: ['ADMIN', 'CAIXA'],
  // },
  // {
  //   label: 'Financeiro',
  //   href: '/financeiro',
  //   icon: <DollarSign className="w-4 h-4" />,
  //   roles: ['ADMIN', 'CAIXA'],
  // },
  {
    label: 'Usuários',
    href: '/usuarios',
    icon: <Users className="w-4 h-4" />,
    roles: ['ADMIN'],
  },
  {
    label: 'Configurações',
    href: '/configuracoes',
    icon: <Settings className="w-4 h-4" />,
    roles: ['ADMIN'],
  },
];

interface SidebarContentProps {
  isMobile?: boolean;
  onClose?: () => void;
}

function SidebarContent({ 
  isMobile = false, 
  onClose 
}: SidebarContentProps) {
  const { user, tenant } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const handleNavigation = (href: string) => {
    router.push(href);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const filteredItems = sidebarItems.filter(item => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header with Logo and Collapse Button - Desktop Only */}
      {!isMobile && (
        <div className={`flex items-center p-4 border-b border-sidebar-border h-16 ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="text-2xl">🍺</div>
            {!isCollapsed && (
              <span className="font-bold text-lg truncate">
                {tenant?.name || 'Bar Manager'}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="h-8 w-8 p-0 shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Collapsed State - Expand Button */}
      {!isMobile && isCollapsed && (
        <div className="flex flex-col items-center justify-center p-4 border-b border-sidebar-border h-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="h-20px" />
        <ul className="space-y-2">
          {filteredItems.map((item) => (
            <li key={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
                onClick={() => handleNavigation(item.href)}
              >
                <div className="flex items-center">
                  {item.icon}
                  {!isCollapsed && <span className="ml-2">{item.label}</span>}
                </div>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isCollapsed, showPaymentNotification } = useSidebar();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Altura da notificação de pagamento (quando visível)
  const notificationHeight = showPaymentNotification ? '64px' : '0px';

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <div 
        className={`fixed left-0 z-40 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
        style={{
          top: notificationHeight,
          height: `calc(100vh - ${notificationHeight})`
        }}
      >
        <SidebarContent />
      </div>
    );
  }

  // Mobile Sidebar (Sheet)
  // Classes customizadas para ajustar posicionamento quando notificação está visível
  const sheetContentClasses = showPaymentNotification
    ? '!top-[64px] !h-[calc(100vh_-_64px)] transition-all duration-300'
    : 'transition-all duration-300';

  return (
    <>
      <div 
        className="md:hidden fixed left-4 z-50 transition-all duration-300"
        style={{
          top: showPaymentNotification ? 'calc(64px + 1rem)' : '1rem'
        }}
      >
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className={`p-0 w-64 ${sheetContentClasses}`}
          >
            <SidebarContent 
              isMobile={true} 
              onClose={() => setIsOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}