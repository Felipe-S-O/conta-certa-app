"use client";

import TopNav from "@/components/nav/top-nav";
import { useSession } from "next-auth/react";

export default function Dashboard() {
    const { data: session } = useSession();

    return (
        <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
            <TopNav title="Dashboard" />


            <main style={{ marginTop: "30px" }}>
                <h2>Conteúdo Protegido</h2>
                <p>Este conteúdo só é visível porque estás autenticado via Java Backend.</p>

                {session?.user && (session.user as any).role === "ADMIN" && (
                    <div style={{ marginTop: "20px", padding: "20px", border: "2px dashed #ef4444", borderRadius: "8px" }}>
                        <h3 style={{ color: "#ef4444" }}>Zona de Administrador</h3>
                        <p>Tens permissões totais sobre o sistema.</p>
                        <button>Gerir Utilizadores</button>
                    </div>
                )}
            </main>
        </div>
    );
}