"use client";

import { ThemeToggle } from "./components/theme-toggle";

interface TopNavProps {
    title: string;
}

const TopNav = ({ title }: TopNavProps) => {
    return (
        <header className="flex justify-between items-center border-b border-gray-300 pb-5">
            <h1 className="text-lg font-semibold">{title}</h1>
            <ThemeToggle />
        </header>
    );
};

export default TopNav;