"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "./components/theme-toggle";

interface TopNavProps {
    title: string;
}

const TopNav = ({ title }: TopNavProps) => {
    return (
        <Card className="rounded-none shadow-sm py-4 border-b-0">
            <CardContent className="flex flex-row items-center justify-between">
                {/* Título dinâmico */}
                <h1 className="text-lg font-semibold">{title}</h1>

                {/* Botão de troca de tema */}
                <ThemeToggle />
            </CardContent>
        </Card>
    );
};

export default TopNav;