'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';

function TenantSettingsContent() {
  const { user, tenant, updateTenant } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFormData({ name: tenant.name });
      setIsEditing(true);
    }
    setIsLoading(false);
  }, [tenant]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!user || user.role !== 'ADMIN') {
      setError('Apenas administradores podem editar as configurações do estabelecimento');
      return;
    }

    try {
      const response = await fetch('/api/tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (response.ok) {
        const updatedTenant = await response.json();
        updateTenant(updatedTenant);
        setIsEditing(false);
        setFormData({ name: updatedTenant.name });
        setError('');
      } else {
        const error = await response.json();
        setError(error.error || 'Falha ao atualizar configurações');
      }
    } catch (error) {
      setError('Erro de conexão');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" text="Carregando configurações..." />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Configurações do Estabelecimento</h1>
        {user?.role === 'ADMIN' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações do Estabelecimento</CardTitle>
          <CardDescription>
            Configure as informações do seu estabelecimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Estabelecimento</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                required
                placeholder="Ex: Bar do João"
                className="w-full"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
              {isEditing && (
                <Button type="submit">
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default function TenantSettingsPage() {
  return (
    <MainLayout>
      <TenantSettingsContent />
    </MainLayout>
  );
}