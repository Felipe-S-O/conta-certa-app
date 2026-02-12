"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { userAtom } from "@/atoms/userAtom";

// Ícones
import {
    Users,
    Folder,
    Package,
    ShoppingCart,
    Settings,
    Gauge,
    ArrowRightLeft,
    LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface MenuContentProps {
    role?: string; // Recebido da Sidebar
}

function MenuContent({ role }: MenuContentProps) {
    const pathname = usePathname();
    const user = useAtomValue(userAtom);

    // Definição dos itens com controle de permissão (RBAC)
    const items = [
        { label: "Dashboard", href: "/dashboard", icon: Gauge, roles: ["ADMIN", "MANAGER", "USER"] },
        { label: "Usuários", href: "/usuarios", icon: Users, roles: ["ADMIN"] },
        { label: "Categorias", href: "/categorias", icon: Folder, roles: ["ADMIN", "MANAGER"] },
        { label: "Produtos", href: "/produtos", icon: Package, roles: ["ADMIN", "MANAGER", "USER"] },
        { label: "Transações", href: "/transacoes", icon: ArrowRightLeft, roles: ["ADMIN", "MANAGER"] },
        { label: "Compras", href: "/compras", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "USER"] },
        { label: "Configurações", href: "/settings", icon: Settings, roles: ["ADMIN"] },
    ];

    // Filtra os itens baseado no role passado pela Sidebar
    const filteredItems = items.filter((item) =>
        role && item.roles.includes(role)
    );

    return (
        <div className="flex flex-col h-full">
            {/* Topo: Informações do Usuário */}
            <div className="p-6 border-b-2 flex items-center gap-3">
                <img
                    src="/avatar.png"
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                />
                <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-medium truncate">
                        {user?.firstName} {user?.lastName}
                    </p>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        {role}
                    </span>
                </div>
            </div>

            {/* Navegação Principal */}
            <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
                {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-slate-300 dark:hover:bg-slate-700"
                            )}
                        >
                            <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500")} />
                            {item.label}
                        </Link>
                    );
                })}

                {/* Divisor Sutil antes do Sair */}
                <div className="my-2 border-t-2" />

                {/* Botão de Sair */}
                <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all text-left"
                >
                    <LogOut className="h-4 w-4" />
                    Sair da conta
                </button>
            </nav>

            {/* Footer: Logo Inottec */}
            <div className="p-6 border-t-2">
                <img
                    src="/logo-inottec.png"
                    alt="Inottec Logo"
                    className="h-8 w-auto object-contain mx-auto"
                />
            </div>
        </div>
    );
}

export default MenuContent;