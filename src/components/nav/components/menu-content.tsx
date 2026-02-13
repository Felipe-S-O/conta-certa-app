"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react"; // Importação da session

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

interface MenuContentProps {
    role?: string;
}

function MenuContent({ role }: MenuContentProps) {
    const pathname = usePathname();

    // Pegamos os dados diretamente da session do NextAuth
    const { data: session } = useSession();
    const user = session?.user;

    // Definição dos itens com controle de permissão (RBAC)
    const items = [
        { label: "Dashboard", href: "/dashboard", icon: Gauge, roles: ["ADMIN", "MANAGER", "USER"] },
        { label: "Usuários", href: "/users", icon: Users, roles: ["ADMIN"] },
        { label: "Categorias", href: "/categories", icon: Folder, roles: ["ADMIN", "MANAGER"] },
        { label: "Produtos", href: "/products", icon: Package, roles: ["ADMIN", "MANAGER", "USER"] },
        { label: "Transações", href: "/transactions", icon: ArrowRightLeft, roles: ["ADMIN", "MANAGER"] },
        { label: "Compras", href: "/purchases", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "USER"] },
    ];

    const filteredItems = items.filter((item) =>
        role && item.roles.includes(role)
    );

    return (
        <div className="flex flex-col h-full">
            {/* Topo: Informações do Usuário vindas da Session */}
            <div className="p-6 border-b-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border">
                    <img
                        src="/avatar.png"
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        // Fallback caso a imagem falhe
                        onError={(e) => (e.currentTarget.src = "https://ui-avatars.com/api/?name=" + user?.firstName)}
                    />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-medium truncate">
                        {/* Acessando os dados que salvamos via update() */}
                        {user?.firstName} {user?.lastName}
                    </p>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        {role || user?.role}
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
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                            )}
                        >
                            <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500")} />
                            {item.label}
                        </Link>
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