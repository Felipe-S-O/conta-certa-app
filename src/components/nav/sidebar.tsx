"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import MenuContent from "./components/menu-content";
import { ArrowRightToLine } from "lucide-react";

// Definimos o tipo das props
interface SidebarProps {
    role?: string;
}

export function Sidebar({ role }: SidebarProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Mobile: Drawer */}
            <div className="lg:hidden fixed top-16 left-2 z-50">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button className="bg-slate-200 dark:bg-slate-800 text-primary-foreground dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                            variant="outline" size="icon">
                            <ArrowRightToLine />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64"> {/* Ajustado largura para caber menu */}
                        <MenuContent role={role} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop: Sidebar fixa */}
            <aside
                className={cn(
                    "hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:fixed lg:left-0 lg:top-0 border-r bg-bg-menu"
                )}
            >
                <MenuContent role={role} />
            </aside>
        </>
    );
}