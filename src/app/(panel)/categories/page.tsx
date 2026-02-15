"use client";

import { useAtom } from "jotai";
import TopNav from "@/components/nav/top-nav";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { categoriesByCompanyAtom, refreshCategoriesAtom } from "@/atoms/categoryAtom";
import Loading from "@/components/loading";
import { Edit, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import CategoryDrawer from "@/components/categoryDrawer"; // Importe o Drawer novo
import { deleteCategory } from "@/services/categoryService";

const CategoriesPage = () => {
    const { data: session } = useSession();
    const [categories] = useAtom(categoriesByCompanyAtom);

    const [, setRefresh] = useAtom(refreshCategoriesAtom);

    // Estados para o Drawer
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    const [showLoading, setShowLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const canManage = session?.user.role === "ADMIN" || session?.user.role === "MANAGER";

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Excluir Categoria?",
            text: "Isso pode afetar lançamentos vinculados!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Sim, excluir",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await deleteCategory(id);
                Swal.fire("Sucesso", "Categoria removida.", "success");
                setRefresh((r) => r + 1);
                // O refresh virá pelo Atom de refresh que configuramos no Drawer
            } catch (error) {
                Swal.fire("Erro", "Não foi possível excluir.", "error");
            }
        }
    };

    return (
        <div className="p-10 font-sans">
            <TopNav title="Lista de Categorias" />

            <main className="mt-8">
                {showLoading ? (
                    <Loading />
                ) : (
                    <ul className="mt-3 space-y-2">
                        {categories?.map((c) => (
                            <li
                                key={c.id}
                                className="p-4 border rounded-lg shadow-sm flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold">{c.name}</p>
                                        {c.emphasis && (
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold uppercase">
                                                Destaque
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-3 mt-1">
                                        <span className={`text-xs font-medium ${c.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {c.type === "INCOME" ? "● Receita" : "● Despesa"}
                                        </span>
                                    </div>
                                </div>

                                {canManage && (
                                    <div className="flex gap-2">
                                        <button
                                            title="Editar Categoria"
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                            onClick={() => {
                                                setSelectedCategory(c);
                                                setDrawerOpen(true);
                                            }}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            title="Excluir Categoria"
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                            onClick={() => handleDelete(c.id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            {/* Botão Flutuante para Adicionar */}
            {canManage && (
                <button
                    title="Nova Categoria"
                    className="fixed bottom-10 right-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl transition-transform hover:scale-110"
                    onClick={() => {
                        setSelectedCategory(null);
                        setDrawerOpen(true);
                    }}
                >
                    <Plus size={28} />
                </button>
            )}

            {/* Componente Drawer */}
            <CategoryDrawer
                open={drawerOpen}
                category={selectedCategory}
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedCategory(null);
                }}
            />
        </div>
    );
};

export default CategoriesPage;