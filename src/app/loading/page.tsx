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

    const { data: session, status } = useSession();

    const hasCalledApi = useRef(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
            return;
        }

        if (status === "authenticated" && session?.email) {
            const email = session.email;

            if (email && !hasCalledApi.current) {
                hasCalledApi.current = true;

                const fetchData = async () => {
                    try {
                        const userData = await getUserByEmail(email);

                        setUser(userData);

                        router.push("/dashboard");
                    } catch (err) {
                        console.error("Erro ao buscar usuário:", err);
                        router.push("/auth/login");
                    }
                };

                fetchData();
            }
        }
    }, [status, session, router, setUser]);

    return <Loading />;
}