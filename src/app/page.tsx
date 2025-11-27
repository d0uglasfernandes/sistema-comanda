'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Users, BarChart3, CreditCard, CheckCircle, Zap, Shield, Clock } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Sistema de Comandas</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Entrar
            </Button>
            <Button onClick={() => router.push('/register')}>
              Começar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-4 mx-auto max-w-7xl py-20 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-muted/50">
            <Zap className="mr-2 h-4 w-4 text-primary" />
            Sistema completo para gerenciamento de comandas
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
            Gerencie seu bar ou restaurante com{' '}
            <span className="text-primary">eficiência e controle</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Sistema completo para controle de comandas, produtos, usuários e muito mais. 
            Simplifique a gestão do seu estabelecimento com uma plataforma moderna e intuitiva.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button size="lg" className="text-lg h-12 px-8" onClick={() => router.push('/register')}>
              Criar Conta Grátis
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-12 px-8" onClick={() => router.push('/login')}>
              Já tenho conta
            </Button>
          </div>

          <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Período de teste gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2 hidden md:flex">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Fácil configuração</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 mx-auto max-w-7xl py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Recursos poderosos para gerenciar seu estabelecimento de forma eficiente
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-all border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Coffee className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Gestão de Comandas</CardTitle>
              <CardDescription>
                Crie, edite e acompanhe comandas em tempo real. Controle total sobre as mesas e pedidos do seu estabelecimento.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Controle de Produtos</CardTitle>
              <CardDescription>
                Gerencie seu catálogo de produtos com facilidade. Preços, categorias e estoque sempre organizados.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Multi-usuário</CardTitle>
              <CardDescription>
                Sistema com diferentes níveis de permissão. Admin, caixa, garçom - cada um com seu papel definido.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Pagamentos Integrados</CardTitle>
              <CardDescription>
                Sistema de assinatura integrado com Stripe. Cobranças automáticas e gestão financeira simplificada.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Segurança Total</CardTitle>
              <CardDescription>
                Seus dados protegidos com autenticação JWT e criptografia de ponta. Multi-tenant isolado e seguro.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Tempo Real</CardTitle>
              <CardDescription>
                Atualizações instantâneas e sincronização em tempo real. Toda a equipe sempre atualizada.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="container px-4 mx-auto max-w-7xl py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Como funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Começar é simples e rápido
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
              1
            </div>
            <h3 className="text-xl font-bold">Crie sua conta</h3>
            <p className="text-muted-foreground">
              Cadastre-se gratuitamente e configure seu estabelecimento em poucos minutos.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
              2
            </div>
            <h3 className="text-xl font-bold">Configure seu sistema</h3>
            <p className="text-muted-foreground">
              Adicione produtos, usuários e personalize de acordo com suas necessidades.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-bold">Comece a usar</h3>
            <p className="text-muted-foreground">
              Pronto! Comece a gerenciar suas comandas e acompanhe tudo em tempo real.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 mx-auto max-w-7xl py-20 md:py-32">
        <Card className="border-2 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-12 md:p-16">
            <div className="flex flex-col items-center text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold max-w-2xl">
                Pronto para revolucionar a gestão do seu estabelecimento?
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                Junte-se a diversos estabelecimentos que já transformaram sua operação com nosso sistema.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg h-12 px-8" onClick={() => router.push('/register')}>
                  Criar Conta Grátis
                </Button>
                <Button size="lg" variant="outline" className="text-lg h-12 px-8" onClick={() => router.push('/login')}>
                  Entrar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container px-4 mx-auto max-w-7xl py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-primary" />
              <span className="font-semibold">Sistema de Comandas</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Sistema de Comandas. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
