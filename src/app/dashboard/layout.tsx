import { Sidebar } from "@/components/nav/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Conteúdo principal */}
            <main className="flex-1 lg:ml-54">
                {children}
            </main>
        </div>
    );
}