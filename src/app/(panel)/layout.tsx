"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAtom } from "jotai"; // 1. Importe o hook do Jotai
import Loading from "@/components/loading";
import { Sidebar } from "@/components/nav/sidebar";
import { companyIdAtom } from "@/atoms/companyIdAtom";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
    const { status, data: session } = useSession();
    const router = useRouter();

    // 3. Hook para atualizar o átomo global
    const [, setCompanyId] = useAtom(companyIdAtom);

    useEffect(() => {
        // Redirecionamento se não autenticado
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }

        // Logout se houver erro de refresh do token
        if (session?.error === "RefreshAccessTokenError") {
            signOut({ callbackUrl: "/auth/login" });
        }

        // 4. ATUALIZAÇÃO DO ÁTOMO: Sempre que a sessão carregar, injetamos o companyId
        if (session?.user?.companyId) {
            setCompanyId(session.user.companyId);
        }
    }, [status, session, router, setCompanyId]); // Adicionado setCompanyId às dependências

    if (status === "loading") return <Loading />;

    // Proteção extra para garantir que só renderize com token
    if (!session?.accessToken) return null;

    return (
        <div className="flex min-h-screen">
            {/* O Sidebar já recebe a role da sessão, o que é ótimo */}
            <Sidebar role={session.user.role} />
            <main className="flex-1 lg:ml-64 bg-transparent">
                {children}
            </main>
        </div>
    );
}