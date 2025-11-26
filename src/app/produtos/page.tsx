'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Package } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface Product {
  id: string;
  name: string;
  priceInCents: number;
}

function ProdutosContent() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', priceInCents: '' });

  const canEdit = ['ADMIN', 'CAIXA'].includes(user?.role || '');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch('/api/produtos', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const priceInCents = Math.round(parseFloat(formData.priceInCents) * 100);

    try {
      const url = editingProduct 
        ? `/api/produtos/${editingProduct.id}`
        : '/api/produtos';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          priceInCents,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchProducts();
        setIsDialogOpen(false);
        setEditingProduct(null);
        setFormData({ name: '', priceInCents: '' });
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to save product');
      }
    } catch (error) {
      setError('Network error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchProducts();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to delete product');
      }
    } catch (error) {
      setError('Network error');
    }
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      priceInCents: (product.priceInCents / 100).toString(),
    });
    setIsDialogOpen(true);
  }

  function openCreateDialog() {
    setEditingProduct(null);
    setFormData({ name: '', priceInCents: '' });
    setIsDialogOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" text="Carregando produtos..." />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Produtos</h1>
        {canEdit && (
          <Button onClick={openCreateDialog} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                </div>
                {canEdit && (
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(product)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {(product.priceInCents / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">por unidade</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Código</p>
                  <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {product.id.slice(-8)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Package className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-500 mb-6">
            Comece adicionando seu primeiro produto ao sistema.
          </p>
          {canEdit && (
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          )}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Edite as informações do produto' : 'Cadastre um novo produto'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: Cerveja Brahma"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.priceInCents}
                onChange={(e) => setFormData({ ...formData, priceInCents: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingProduct ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ProdutosPage() {
  return (
    <MainLayout>
      <ProdutosContent />
    </MainLayout>
  );
}