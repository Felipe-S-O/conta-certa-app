"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// importe os ícones do Lucide
import {
    LayoutDashboard,
    Users,
    Folder,
    Package,
    CreditCard,
    ShoppingCart,
    Settings,
    Gauge,
    ArrowRightLeft,
} from "lucide-react";

function MenuContent() {
    const pathname = usePathname();

    const items = [
        { label: "Dashboard", href: "/dashboard", icon: Gauge },
        { label: "Usuários", href: "/usuarios", icon: Users },
        { label: "Categorias", href: "/categorias", icon: Folder },
        { label: "Produtos", href: "/produtos", icon: Package },
        { label: "Transações", href: "/transacoes", icon: ArrowRightLeft },
        { label: "Compras", href: "/compras", icon: ShoppingCart },
        { label: "Configurações", href: "/settings", icon: Settings },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Topo: usuário */}
            <div className="p-4 border-b-2 flex items-center gap-3">
                <img
                    src="/avatar.png"
                    alt="Usuário"
                    className="w-10 h-10 rounded-full"
                />
                <div>
                    <p className="text-sm font-medium">Felipe</p>
                    <p className="text-xs text-muted-foreground">Admin</p>
                </div>
            </div>

            {/* Menu principal */}
            <nav className="flex-1 flex flex-col gap-2 p-4">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-primary-foreground dark:text-slate-300",
                                pathname.startsWith(item.href)
                                    ? "bg-slate-200 dark:bg-slate-800"
                                    : "hover:bg-slate-300 dark:hover:bg-slate-700"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer: logo da empresa */}
            <div className="p-4 flex items-center justify-center">
                <img
                    src="/logo-inottec.png"
                    alt="Logo da empresa"
                    className="h-8 object-contain"
                />
            </div>
        </div>
    );
}

export default MenuContent;