"use client";
import { Sidebar } from "@/components/nav/sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "../../components/loading";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
    const { status, data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    // Importante: Não retorne null diretamente se quiser manter a estrutura do CSS
    // Se o estilo global não pegar, pode ser porque o 'loading' remove a árvore do DOM
    if (status === "loading") {
        return <Loading />;
    }

    if (!session?.user) return null;

    return (
        <div className="flex min-h-screen">
            {/* Sidebar fixa */}
            <Sidebar role={(session.user as any)?.role} />

            {/* O bg-transparent garante que o fundo venha do globals.css (body) */}
            <main className="flex-1 lg:ml-64 bg-transparent">
                {children}
            </main>
        </div>
    );
}