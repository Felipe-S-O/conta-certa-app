"use client"

import { usersAtom } from "@/atoms/userAtom";
import { usersByCompany } from "@/services/userService";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import Loading from "@/components/loading";
import { UserCircle } from "lucide-react";

const Page = () => {
    const { data: session } = useSession();
    // Estados do Jotai
    const [users, setUsers] = useAtom(usersAtom);
    const [loading, setLoading] = useState(true);

    const loadUsers = useCallback(async () => {
        const companyId = session?.user?.companyId;
        if (!companyId) return;

        setLoading(true);
        try {
            const data = await usersByCompany(companyId);
            setUsers(data);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            // Opcional: Notificar erro ao usuário aqui
        } finally {
            setLoading(false);
        }
    }, [session?.user?.companyId, setUsers]);

    /**
         * Efeito que monitora a Sessão e o gatilho de Refresh
         */
    useEffect(() => {
        if (session?.user?.companyId) {
            loadUsers();
        }
    }, [session?.user?.companyId, loadUsers]);

    return (
        <div className="p-8">
            <h1>teste</h1>
            {loading ? (
                <Loading />
            ) : !users || users.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-20 text-slate-500">
                    <UserCircle size={48} className="mb-4" />
                    <p>Nenhum usuário encontrado.</p>
                </div>
            ) : (
                <div className="mt-4">
                    {users.map((u: any) => (
                        <h1 key={u.id} className="text-xl font-bold">{u.firstName} {u.lastName}</h1>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Page;