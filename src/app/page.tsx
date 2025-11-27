'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Coffee, Users, BarChart3, CreditCard, CheckCircle, Zap, Shield, Clock, ArrowRight, Star, Menu, X } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerBackground = isScrolled ? 'bg-background/80 backdrop-blur-md border-b' : 'bg-transparent';

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBackground}`}>
        <div className="container mx-auto px-4 h-20 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-primary/10 p-2 rounded-xl">
              <Coffee className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Comanda<span className="text-foreground">Sys</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Recursos</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Como Funciona</a>
            <div className="flex items-center gap-4 ml-4">
              <Button variant="ghost" onClick={() => router.push('/login')} className="hover:bg-primary/5">
                Entrar
              </Button>
              <Button onClick={() => router.push('/register')} className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                Começar Agora
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-20 left-0 right-0 bg-background border-b p-4 shadow-xl"
          >
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm font-medium p-2 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>Recursos</a>
              <a href="#how-it-works" className="text-sm font-medium p-2 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>Como Funciona</a>
              <div className="flex flex-col gap-2 mt-2">
                <Button variant="outline" onClick={() => router.push('/login')} className="w-full">
                  Entrar
                </Button>
                <Button onClick={() => router.push('/register')} className="w-full">
                  Começar Agora
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              className="flex-1 text-center lg:text-left space-y-8"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-muted/50 backdrop-blur-sm">
                <Zap className="mr-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent font-bold">
                  Nova versão 2.0 disponível
                </span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                Gestão inteligente para seu <br />
                <span className="text-primary relative">
                  Restaurante
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Abandone as planilhas e comandas de papel. Tenha controle total do seu estabelecimento com uma plataforma moderna, intuitiva e feita para crescer com você.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="text-lg h-14 px-8 rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300" onClick={() => router.push('/register')}>
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg h-14 px-8 rounded-full border-2 hover:bg-muted/50" onClick={() => router.push('/login')}>
                  Acessar Sistema
                </Button>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-center justify-center lg:justify-start gap-8 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>14 dias grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Sem fidelidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Suporte 24/7</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual/Mockup */}
            <motion.div 
              className="flex-1 w-full max-w-[600px] lg:max-w-none perspective-1000"
              initial={{ opacity: 0, x: 50, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-500 rounded-2xl blur-2xl opacity-20 animate-pulse" />
                <div className="relative bg-card border rounded-2xl shadow-2xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-12 bg-muted/50 border-b flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="p-6 pt-16 space-y-6 bg-gradient-to-b from-background to-muted/20">
                    {/* Mockup Content */}
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <div className="h-2 w-24 bg-muted rounded mb-2" />
                        <div className="h-4 w-48 bg-foreground/10 rounded" />
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 rounded-xl border bg-card shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10" />
                            <div className="h-4 w-12 bg-green-500/20 rounded-full" />
                          </div>
                          <div className="h-3 w-20 bg-muted rounded mb-2" />
                          <div className="h-5 w-16 bg-foreground/10 rounded" />
                        </div>
                      ))}
                    </div>
                    <div className="h-32 rounded-xl border bg-muted/30 mt-6 flex items-center justify-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground/20" />
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <motion.div 
                  className="absolute -right-8 top-20 bg-card p-4 rounded-xl shadow-xl border animate-float"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tempo médio</p>
                      <p className="font-bold">12 min</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute -left-8 bottom-20 bg-card p-4 rounded-xl shadow-xl border"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Clientes hoje</p>
                      <p className="font-bold">+142</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30 relative">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Tudo que você precisa</h2>
            <p className="text-xl text-muted-foreground">
              Uma suíte completa de ferramentas projetadas para otimizar cada aspecto do seu negócio.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Coffee,
                title: "Gestão de Comandas",
                desc: "Controle total sobre mesas e pedidos em tempo real. Elimine erros e agilize o atendimento.",
                color: "text-orange-500"
              },
              {
                icon: BarChart3,
                title: "Relatórios Detalhados",
                desc: "Acompanhe vendas, produtos mais saídos e desempenho da equipe com gráficos intuitivos.",
                color: "text-blue-500"
              },
              {
                icon: Users,
                title: "Controle de Equipe",
                desc: "Defina permissões específicas para gerentes, caixas e garçons. Mantenha tudo organizado.",
                color: "text-purple-500"
              },
              {
                icon: CreditCard,
                title: "Pagamentos Integrados",
                desc: "Aceite pagamentos diretamente pelo sistema. Integração segura e transparente.",
                color: "text-green-500"
              },
              {
                icon: Shield,
                title: "Segurança de Dados",
                desc: "Seus dados são criptografados e protegidos. Backups automáticos para sua tranquilidade.",
                color: "text-red-500"
              },
              {
                icon: Zap,
                title: "Performance Extrema",
                desc: "Sistema leve e rápido, funciona em qualquer dispositivo sem travamentos.",
                color: "text-yellow-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-none shadow-lg bg-card/50 backdrop-blur hover:bg-card transition-colors duration-300">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-2xl ${feature.color} bg-current/10 flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Como funciona</h2>
            <p className="text-xl text-muted-foreground">Comece a usar em menos de 5 minutos</p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-muted via-primary/50 to-muted border-t-2 border-dashed border-muted-foreground/30 z-0" />

            {[
              { step: 1, title: "Crie sua conta", desc: "Cadastro rápido e sem burocracia. Não precisa de cartão." },
              { step: 2, title: "Personalize", desc: "Cadastre seus produtos, mesas e equipe em poucos cliques." },
              { step: 3, title: "Comece a vender", desc: "Pronto! Seu sistema está ativo e pronto para receber pedidos." }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="relative z-10 flex flex-col items-center text-center space-y-4"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="w-24 h-24 rounded-full bg-background border-4 border-primary/10 flex items-center justify-center shadow-xl">
                  <span className="text-4xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-muted-foreground max-w-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
        <div className="container px-4 mx-auto max-w-7xl relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Junte-se a quem já modernizou</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-80">
            {/* Placeholders for logos */}
            {['Restaurante A', 'Bar do Zé', 'Café Central', 'Bistro 55'].map((name, i) => (
              <div key={i} className="text-2xl font-bold font-serif">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="relative rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 text-white p-12 md:p-20 text-center overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/30 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/30 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold">
                Pronto para transformar seu negócio?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Experimente gratuitamente por 14 dias. Sem compromisso, cancele quando quiser.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg h-14 px-8 bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-all duration-300" onClick={() => router.push('/register')}>
                  Começar Teste Grátis
                </Button>
                <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-white/20 text-white hover:bg-white/10" onClick={() => router.push('/login')}>
                  Falar com Consultor
                </Button>
              </div>
              <p className="text-sm text-gray-400 mt-8">
                Não é necessário cartão de crédito para começar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container px-4 mx-auto max-w-7xl py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <Coffee className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">ComandaSys</span>
              </div>
              <p className="text-muted-foreground max-w-xs">
                A solução completa para gestão de bares, restaurantes e similares. Simples, rápido e eficiente.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Recursos</a></li>
                <li><a href="#" className="hover:text-primary">Preços</a></li>
                <li><a href="#" className="hover:text-primary">Integrações</a></li>
                <li><a href="#" className="hover:text-primary">Atualizações</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Sobre nós</a></li>
                <li><a href="#" className="hover:text-primary">Contato</a></li>
                <li><a href="#" className="hover:text-primary">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2024 ComandaSys. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              {/* Social Icons placeholders */}
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 cursor-pointer transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.48 2h-.165zm-3.77 1.795c-.95.043-1.46.25-1.813.388a2.92 2.92 0 00-1.097.713 2.92 2.92 0 00-.713 1.097c-.138.352-.344.862-.388 1.813-.043.95-.048 1.237-.048 3.842v.36c0 2.507.005 2.816.048 3.766.043.95.25 1.46.388 1.813.24.601.713 1.08 1.314 1.313.352.138.862.344 1.813.388.95.043 1.237.048 3.842.048h.36c2.507 0 2.816-.005 3.766-.048.95-.043 1.46-.25 1.813-.388a2.92 2.92 0 001.097-.713 2.92 2.92 0 00.713-1.097c.138-.352.344-.862.388-1.813.043-.95.048-1.237.048-3.842v-.36c0-2.507-.005-2.816-.048-3.766-.043-.95-.25-1.46-.388-1.813a2.92 2.92 0 00-.713-1.097 2.92 2.92 0 00-1.097-.713c-.352-.138-.862-.344-1.813-.388-.95-.043-1.237-.048-3.842-.048H12.48c-2.507 0-2.816.005-3.766.048zm3.77 3.665a5.335 5.335 0 110 10.67 5.335 5.335 0 010-10.67zm0 1.795a3.54 3.54 0 100 7.08 3.54 3.54 0 000-7.08zm5.33-3.532a1.196 1.196 0 110 2.392 1.196 1.196 0 010-2.392z" clipRule="evenodd" /></svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
