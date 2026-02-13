"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserByEmail } from "@/services/userService";
import { useSession } from "next-auth/react";
import Loading from "@/components/loading";

export default function LoadingPage() {
    const router = useRouter();
    const { data: session, status, update } = useSession();
    const hasCalledApi = useRef(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
            return;
        }

        const email = session?.user?.email;
        if (status === "authenticated" && email && !hasCalledApi.current) {
            hasCalledApi.current = true;

            const fetchData = async () => {
                try {
                    const userData = await getUserByEmail(email);

                    // 2. Salva na Session do NextAuth (Persistência no Cookie para F5)
                    await update({
                        id: userData.id,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        companyId: userData.companyId,
                        role: userData.role
                    });

                    router.push("/dashboard");
                } catch (err) {
                    console.error("Erro ao carregar dados do usuário", err);
                    router.push("/auth/login");
                }
            };

            fetchData();
        }
    }, [status, session, router, update]);

    return <Loading />;
}