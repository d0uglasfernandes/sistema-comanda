'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CreditCard, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentRequiredPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    // Carrega dados da assinatura
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const response = await axios.get('/api/subscription');
      setSubscriptionData(response.data);
    } catch (err) {
      console.error('Error loading subscription:', err);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Cria sessão de checkout
      const response = await axios.post('/api/subscription/create-checkout');
      const { url } = response.data;

      // Redireciona para o Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.response?.data?.error || 'Erro ao criar sessão de pagamento');
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-gray-900 p-4">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900 p-4">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400">
            Acesso Bloqueado
          </CardTitle>
          <CardDescription className="text-lg">
            Sua assinatura está vencida. Para continuar usando o sistema, é necessário renovar sua assinatura.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {subscriptionData && (
            <div className="space-y-4">
              <div className="bg-muted p-6 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg mb-4">Detalhes da Assinatura</h3>
                
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Empresa:</span>
                  <span className="font-medium">{subscriptionData.tenant?.name}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Total de usuários:</span>
                  <span className="font-medium">{subscriptionData.pricing?.totalUsers || 0}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Usuários não-admin:</span>
                  <span className="font-medium">{subscriptionData.pricing?.nonAdminUsers || 0}</span>
                </div>

                <div className="flex justify-between items-center py-3 mt-4 bg-background p-4 rounded">
                  <span className="font-semibold text-lg">Valor mensal:</span>
                  <span className="font-bold text-2xl text-primary">
                    {formatPrice(subscriptionData.pricing?.currentPriceInCents || 0)}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground mt-2 text-center">
                  Cálculo: R$ 100,00 (base) + R$ 10,00 por usuário adicional
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      Benefícios da assinatura:
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                      <li>Acesso ilimitado ao sistema</li>
                      <li>Gerenciamento completo de comandas</li>
                      <li>Controle de produtos e estoque</li>
                      <li>Relatórios e análises</li>
                      <li>Suporte técnico prioritário</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            size="lg"
            className="w-full text-lg"
            onClick={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Renovar Assinatura
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Pagamento seguro processado pelo Stripe
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
