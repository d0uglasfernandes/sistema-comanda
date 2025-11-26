'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  theme: string;
}

interface Tenant {
  id: string;
  name: string;
  createdAt: string;
  stats?: {
    users: number;
    products: number;
    orders: number;
  };
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateTheme: (theme: string) => Promise<void>;
  updateTenant: (name: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Buscar dados do tenant
        if (data.user) {
          try {
            const tenantResponse = await fetch('/api/tenant', {
              credentials: 'include',
            });
            
            if (tenantResponse.ok) {
              const tenantData = await tenantResponse.json();
              setTenant(tenantData);
            }
          } catch (error) {
            console.error('Failed to fetch tenant data:', error);
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setUser(data.user);
    
    // Buscar dados do tenant após login
    try {
      const tenantResponse = await fetch('/api/tenant', {
        credentials: 'include',
      });
      
      if (tenantResponse.ok) {
        const tenantData = await tenantResponse.json();
        setTenant(tenantData);
      }
    } catch (error) {
      console.error('Failed to fetch tenant data after login:', error);
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTenant(null);
    }
  }

  async function refresh() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setUser(null);
      setTenant(null);
    }
  }

  async function updateTheme(theme: string) {
    try {
      const response = await fetch('/api/auth/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (user) {
          setUser({ ...user, theme: data.theme });
        }
        // Apply theme immediately
        if (data.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      console.error('Theme update failed:', error);
    }
  }

  async function updateTenant(name: string) {
    try {
      const response = await fetch('/api/tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTenant(data);
      }
    } catch (error) {
      console.error('Tenant update failed:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, tenant, login, logout, refresh, updateTheme, updateTenant, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}