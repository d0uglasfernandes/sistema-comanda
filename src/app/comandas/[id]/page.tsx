'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, DollarSign } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
    priceInCents: number;
  };
}

interface Order {
  id: string;
  tableNumber: number;
  status: 'OPEN' | 'CLOSED' | 'PAID';
  totalInCents: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  priceInCents: number;
}

export default function ComandaDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    fetchOrder();
    fetchProducts();
  }, []);

  async function fetchOrder() {
    try {
      const response = await fetch(`/api/comandas/${params.id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        setError('Failed to fetch order');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch('/api/produtos', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products');
    }
  }

  async function handleAddItem() {
    if (!selectedProduct || !quantity) {
      return;
    }

    try {
      const updatedItems = [
        ...(order?.items || []),
        {
          productId: selectedProduct,
          quantity: parseInt(quantity),
        },
      ];

      const response = await fetch(`/api/comandas/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: updatedItems,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchOrder();
        setIsAddItemDialogOpen(false);
        setSelectedProduct('');
        setQuantity('1');
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to add item');
      }
    } catch (error) {
      setError('Network error');
    }
  }

  async function handleStatusChange(newStatus: 'OPEN' | 'CLOSED' | 'PAID') {
    try {
      const response = await fetch(`/api/comandas/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchOrder();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to update status');
      }
    } catch (error) {
      setError('Network error');
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'OPEN':
        return <Badge variant="default">Aberta</Badge>;
      case 'CLOSED':
        return <Badge variant="secondary">Fechada</Badge>;
      case 'PAID':
        return <Badge variant="outline">Paga</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Comanda não encontrada</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">Comanda #{order.tableNumber}</h1>
        {getStatusBadge(order.status)}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
            <CardDescription>Detalhes da comanda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Mesa:</strong> {order.tableNumber}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> R$ {(order.totalInCents / 100).toFixed(2)}</p>
              <p><strong>Criada em:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-2 mt-4">
              {order.status === 'OPEN' && (
                <>
                  <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Item</DialogTitle>
                        <DialogDescription>
                          Selecione um produto e a quantidade
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Produto</label>
                          <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full p-2 border rounded"
                          >
                            <option value="">Selecione um produto</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - R$ {(product.priceInCents / 100).toFixed(2)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Quantidade</label>
                          <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddItemDialogOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button onClick={handleAddItem}>
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange('CLOSED')}
                  >
                    Fechar Comanda
                  </Button>
                </>
              )}
              {order.status === 'CLOSED' && (
                <Button onClick={() => handleStatusChange('PAID')}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Marcar como Paga
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itens</CardTitle>
            <CardDescription>Produtos da comanda</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Unit.</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>R$ {(item.unitPrice / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      R$ {((item.unitPrice * item.quantity) / 100).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}