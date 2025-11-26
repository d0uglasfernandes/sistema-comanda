'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, createContext, useContext } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useSubscription } from '@/hooks/useSubscription';

// Context for sharing sidebar state
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  showPaymentNotification: boolean;
  closePaymentNotification: () => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  showPaymentNotification: false,
  closePaymentNotification: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notificationManuallyClosed, setNotificationManuallyClosed] = useState(false);
  const { subscriptionData, requiresPayment, isLoading: subscriptionLoading } = useSubscription();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Verifica status de pagamento e redireciona se necessário
  useEffect(() => {
    if (!isLoading && !subscriptionLoading && user && requiresPayment) {
      // Não redireciona se já estiver na página de pagamento
      if (pathname !== '/payment-required') {
        router.push('/payment-required');
      }
    }
  }, [user, isLoading, subscriptionLoading, requiresPayment, pathname, router]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Payment notification logic
  const shouldShowNotification =
    subscriptionData &&
    subscriptionData.daysUntilDue !== null &&
    subscriptionData.daysUntilDue !== undefined &&
    subscriptionData.daysUntilDue >= 0 &&
    subscriptionData.daysUntilDue <= 3;

  const showPaymentNotification =
    !!shouldShowNotification && !notificationManuallyClosed;

  const closePaymentNotification = () => {
    setNotificationManuallyClosed(true);
  };

  // Reset manual close when subscription changes
  useEffect(() => {
    if (!shouldShowNotification) {
      setNotificationManuallyClosed(false);
    }
  }, [shouldShowNotification]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Carregando sistema..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      setIsCollapsed,
      showPaymentNotification,
      closePaymentNotification
    }}>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar />

        <main
          className={`transition-all duration-300 ${
            isMobile ? '' : isCollapsed ? 'ml-16' : 'ml-64'
          }`}
          style={{
            paddingTop: showPaymentNotification ? 'calc(4rem + 64px)' : '4rem'
          }}
        >
          <div className="p-4 lg:p-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <AuthProvider>
      <MainLayoutContent>
        {children}
      </MainLayoutContent>
    </AuthProvider>
  );
}