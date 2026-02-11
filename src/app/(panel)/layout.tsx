"use client";
import { Sidebar } from "@/components/nav/sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Importação corrigida
import { useEffect } from "react";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
    const { status, data: session } = useSession();
    const router = useRouter();

    // Redirecionamento deve ser feito dentro de um useEffect para evitar erros de renderização
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    // 1. Enquanto carrega, retorna null para o Next.js mostrar o loading.tsx
    if (status === "loading") return null;

    // 2. Proteção extra caso não haja sessão
    if (!session || !session.user) {
        return null; // O useEffect acima cuidará do push
    }

    return (
        <div className="flex min-h-screen">
            {/* 3. Pegando o role com segurança da session */}
            <Sidebar role={(session.user as any)?.role} />

            {/* lg:ml-64 deve bater com a largura da sua sidebar desktop */}
            <main className="flex-1 lg:ml-64 bg-gray-50">
                {children}
            </main>
        </div>
    );
}