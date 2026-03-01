"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { LogOut, Loader2, Users, Folder, Package, ShoppingCart, Gauge, ArrowRightLeft } from "lucide-react";

interface MenuContentProps {
    role?: string;
}

function MenuContent({ role }: MenuContentProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user;

    // estado para controlar animação de navegação
    const [navegando, setNavegando] = useState<string>("");

    const navegar = (href: string, titulo: string) => {
        if (pathname !== href) {
            setNavegando(titulo);
            router.push(href);
        }
    };

    // resetar animação quando a rota mudar
    useEffect(() => {
        setNavegando("");
    }, [pathname]);

    const items = [
        { label: "Dashboard", href: "/dashboard", icon: Gauge, roles: ["ADMIN", "MANAGER", "USER"] },
        { label: "Usuários", href: "/users", icon: Users, roles: ["ADMIN"] },
        { label: "Categorias", href: "/categories", icon: Folder, roles: ["ADMIN", "MANAGER"] },
        { label: "Produtos", href: "/products", icon: Package, roles: ["ADMIN", "MANAGER", "USER"] },
        { label: "Transações", href: "/transactions", icon: ArrowRightLeft, roles: ["ADMIN", "MANAGER"] },
        { label: "Compras", href: "/purchases", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "USER"] },
    ];

    const filteredItems = items.filter((item) => {
        const currentRole = role || user?.role;
        return currentRole && item.roles.includes(currentRole);
    });

    return (
        <div className="flex flex-col h-full">
            {/* Topo */}
            <div className="p-6 border-b-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border">
                    <img
                        src={user?.image || "/avatar.png"}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${user?.name}`)}
                    />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-medium truncate">
                        {user?.firstName ?? user?.name} {user?.lastName ?? ""}
                    </p>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        {role || user?.role}
                    </span>
                </div>
            </div>

            {/* Navegação */}
            <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
                {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);

                    return (
                        <button
                            key={item.href}
                            onClick={() => navegar(item.href, item.label)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left",
                                isActive
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                            )}
                            disabled={navegando !== ""}
                        >
                            {navegando === item.label ? (
                                <>
                                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                    {item.label}
                                </>
                            ) : (
                                <>
                                    <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500")} />
                                    {item.label}
                                </>
                            )}
                        </button>
                    );
                })}

                <div className="my-2 border-t" />

                <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all text-left"
                >
                    <LogOut className="h-4 w-4" />
                    Sair da conta
                </button>
            </nav>

            {/* Footer */}
            <div className="p-6 border-t">
                <img src="/logo-paguei-certo.png" alt="Logo" className="h-14 w-auto object-contain mx-auto" />
            </div>
        </div>
    );
}

export default MenuContent;