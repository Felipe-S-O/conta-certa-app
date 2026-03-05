"use client"

import { useState } from "react"; // Importamos o useState para o efeito do ícone
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, MessageCircle, ArrowRight, Lock, Unlock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const HomePage = () => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false); // Estado para controlar o cadeado

  const handleWhatsApp = () => {
    const text = `Olá, gostaria de saber mais sobre o Paguei Certo!`;
    const whatsappUrl = `https://wa.me/558399301362?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const goToLogin = () => router.push("/auth/login");
  const goToFeatures = () => router.push("/funcionalidades");

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <Card className="rounded-none shadow-sm border-b sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-950/80">
        <CardContent className="flex flex-row items-center justify-between px-6 max-w-7xl mx-auto w-full py-2">
          <div>
            <img src="/logo-paguei-certo.png" alt="Logo" className="h-14 w-auto object-contain" />
          </div>

          <div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-5 text-lg rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900 transition-all flex items-center gap-2"
              onClick={goToLogin}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Container da Animação do Cadeado */}
              <div className="relative w-5 h-5 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isHovered ? (
                    <motion.div
                      key="unlock"
                      initial={{ rotate: -20, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Unlock className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="lock"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Lock className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span>Entrar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seção Hero */}
      <main className="grow container mx-auto px-4 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Lado Esquerdo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Domine suas finanças de <span className="text-blue-600">forma inteligente.</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                A plataforma completa para você organizar contas, planejar o futuro e nunca mais pagar juros por esquecimento.
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["Controle de Gastos", "Metas de Economia", "Alertas de Vencimento", "Relatórios Detalhados"].map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full">
                    <Check className="text-blue-600 h-4 w-4 stroke-[3px]" />
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-7 text-lg rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900 transition-all group" onClick={goToFeatures}>
              Começar agora
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Lado Direito */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center items-center"
          >
            <div className="relative w-full max-w-125 aspect-square">
              {/* Glow de fundo */}
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-[100px] opacity-10 animate-pulse" />

              {/* Imagem para Tema Claro */}
              <Image
                src="/dashboard-claro.png"
                alt="Interface Paguei Certo"
                fill
                className="object-contain relative z-10 block dark:hidden"
                priority
              />

              {/* Imagem para Tema Escuro */}
              <Image
                src="/dashboard-escuro.png"
                alt="Interface Paguei Certo"
                fill
                className="object-contain relative z-10 hidden dark:block"
                priority
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-slate-50 dark:bg-transparent">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} Paguei Certo - Todos os direitos reservados.
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Desenvolvido por <span className="font-semibold text-blue-700 underline decoration-blue-500/30">Felipe-S-O</span>
          </p>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsApp}
        aria-label="Contatar suporte via WhatsApp"
        className="fixed bottom-6 right-6 bg-[#25D366] p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 text-white"
      >
        <MessageCircle className="h-7 w-7 fill-current" />
      </button>
    </div>
  );
};

export default HomePage;