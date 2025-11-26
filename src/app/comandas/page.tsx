'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Eye, Coffee, Trash2, CheckCircle, XCircle, Receipt } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';

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

function ComandasContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [newOrderTable, setNewOrderTable] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: string }[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const canEdit = ['ADMIN', 'CAIXA', 'GARCOM'].includes(user?.role || '');

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  async function fetchOrders() {
    try {
      const response = await fetch('/api/comandas', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError('Failed to fetch orders');
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

  async function handleCreateOrder() {
    if (!newOrderTable || selectedProducts.length === 0) {
      return;
    }

    try {
      const items = selectedProducts
        .filter(p => p.productId && p.quantity)
        .map(p => ({
          productId: p.productId,
          quantity: parseInt(p.quantity),
        }));

      const response = await fetch('/api/comandas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber: parseInt(newOrderTable),
          items,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchOrders();
        setIsNewOrderDialogOpen(false);
        setNewOrderTable('');
        setSelectedProducts([]);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to create order');
      }
    } catch (error) {
      setError('Network error');
    }
  }

  async function handleUpdateOrderStatus(orderId: string, status: 'OPEN' | 'CLOSED' | 'PAID') {
    try {
      const response = await fetch(`/api/comandas/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchOrders();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to update order');
      }
    } catch (error) {
      setError('Network error');
    }
  }

  function addProductToOrder() {
    setSelectedProducts([...selectedProducts, { productId: '', quantity: '1' }]);
  }

  function updateProductInOrder(index: number, field: 'productId' | 'quantity', value: string) {
    const updated = [...selectedProducts];
    updated[index][field] = value;
    setSelectedProducts(updated);
  }

  function removeProductFromOrder(index: number) {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
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

  function openViewDialog(order: Order) {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" text="Carregando comandas..." />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Comandas</h1>
        {canEdit && (
          <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nova Comanda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Comanda</DialogTitle>
                <DialogDescription>
                  Crie uma nova comanda para uma mesa
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Número da Mesa</label>
                  <input
                    type="number"
                    min="1"
                    value={newOrderTable}
                    onChange={(e) => setNewOrderTable(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Itens</label>
                    <Button type="button" variant="outline" size="sm" onClick={addProductToOrder}>
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar Produto
                    </Button>
                  </div>
                  
                  {selectedProducts.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <select
                        value={item.productId}
                        onChange={(e) => updateProductInOrder(index, 'productId', e.target.value)}
                        className="flex-1 p-2 border rounded"
                      >
                        <option value="">Selecione um produto</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - R$ {(product.priceInCents / 100).toFixed(2)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateProductInOrder(index, 'quantity', e.target.value)}
                        className="w-20 p-2 border rounded"
                        placeholder="Qtd"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProductFromOrder(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewOrderDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateOrder}>
                    Criar Comanda
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm font-medium">
                      Mesa #{order.tableNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {new Date(order.createdAt).toLocaleString('pt-BR')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Order Items */}
                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate flex-1">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="font-medium ml-2">
                        R$ {(item.unitPrice * item.quantity / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{order.items.length - 3} outros itens
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="text-xl font-bold text-green-600">
                      R$ {(order.totalInCents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openViewDialog(order)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  {canEdit && order.status === 'OPEN' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateOrderStatus(order.id, 'CLOSED')}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Fechar
                    </Button>
                  )}
                  {canEdit && order.status === 'CLOSED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateOrderStatus(order.id, 'PAID')}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Pagar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Receipt className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Nenhuma comanda encontrada
          </h3>
          <p className="text-gray-500 mb-6">
            Comece criando sua primeira comanda no sistema.
          </p>
          {canEdit && (
            <Button onClick={() => setIsNewOrderDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Comanda
            </Button>
          )}
        </div>
      )}

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Comanda</DialogTitle>
            <DialogDescription>
              Mesa #{selectedOrder?.tableNumber} • {getStatusBadge(selectedOrder?.status || '')}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Itens</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{item.product.name}</span>
                        <span className="text-sm text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span>R$ {(item.unitPrice * item.quantity / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>R$ {(selectedOrder.totalInCents / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ComandasPage() {
  return (
    <MainLayout>
      <ComandasContent />
    </MainLayout>
  );
}