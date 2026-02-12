"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import { getUserByEmail } from "@/services/user";
import { useSession } from "next-auth/react";
import Loading from "@/components/loading";

export default function LoadingPage() {
    const router = useRouter();
    const setUser = useSetAtom(userAtom);

    // Pega a sessão conforme configurada no seu NextAuth
    const { data: session, status } = useSession();

    // useRef impede que o React tente buscar o usuário várias vezes
    const hasCalledApi = useRef(false);

    useEffect(() => {
        // 1. Se o NextAuth confirmar que não há sessão, volta para o login
        if (status === "unauthenticated") {
            router.push("/auth/login");
            return;
        }

        // 2. Aguarda o status ficar 'authenticated'
        if (status === "authenticated" && session?.user) {

            // AJUSTE AQUI: No seu NextAuth, você salvou o token DENTRO de session.user
            const token = (session.user as any).accessToken;
            const email = session.user.email;

            // Se temos o que é preciso e ainda não chamamos a API
            if (token && email && !hasCalledApi.current) {
                hasCalledApi.current = true;

                const fetchData = async () => {
                    try {
                        // Busca os dados no servidor Java
                        const userData = await getUserByEmail(email, token);

                        // Salva no Jotai
                        setUser(userData);

                        // Redireciona para o painel
                        router.push("/dashboard");
                    } catch (err) {
                        console.error("Erro ao integrar com API Java:", err);
                        // Em caso de erro na API, limpa a tentativa e volta ao login
                        hasCalledApi.current = false;
                        router.push("/auth/login");
                    }
                };

                fetchData();
            }
        }
    }, [status, session, router, setUser]);

    // Mantido seu retorno visual original
    return <Loading />;
}