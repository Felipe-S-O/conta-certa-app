"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/components/loading";
import { Sidebar } from "@/components/nav/sidebar";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
    const { status, data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }

        if (session?.error === "RefreshAccessTokenError") {
            signOut({ callbackUrl: "/auth/login" });
        }
    }, [status, session, router]);

    if (status === "loading") return <Loading />;
    if (!session?.accessToken) return null;

    return (
        <div className="flex min-h-screen">
            <Sidebar role={session.user.role} />
            <main className="flex-1 lg:ml-64 bg-transparent">
                {children}
            </main>
        </div>
    );
}