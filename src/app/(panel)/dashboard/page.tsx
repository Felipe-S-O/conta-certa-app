"use client";

import TopNav from "@/components/nav/top-nav";
import { useSession } from "next-auth/react";

export default function Dashboard() {
    const { data: session } = useSession();

    return (
        <div className="p-10 font-sans">
            <TopNav title="Dashboard" />

            <main className="mt-8">
                <h2 className="text-2xl font-bold">Conteúdo Protegido</h2>
                <p className="text-slate-600">
                    Bem-vindo, Este conteúdo é exclusivo via Java Backend.
                </p>

                {/* Validação de ADMIN usando session.role */}
                {session?.role === "ADMIN" && (
                    <div className="mt-5 p-5 border-2 border-dashed border-red-500 rounded-lg bg-red-50 dark:bg-red-950/10">
                        <h3 className="text-red-600 font-bold text-lg">Zona de Administrador</h3>
                        <p className="text-red-500 text-sm">Tens permissões totais sobre o sistema.</p>
                        <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                            Gerir Utilizadores
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}