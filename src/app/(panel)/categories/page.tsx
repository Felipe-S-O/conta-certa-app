"use client";

import { useAtom } from "jotai";
import TopNav from "@/components/nav/top-nav";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { categoriesByCompanyAtom, refreshCategoriesAtom } from "@/atoms/categoryAtom";
import Loading from "@/components/loading";
import { Edit, Plus, Trash2, Tag, Star } from "lucide-react";
import Swal from "sweetalert2";
import CategoryDrawer from "@/components/categoryDrawer";
import { deleteCategory } from "@/services/categoryService";

const CategoriesPage = () => {
    const { data: session } = useSession();
    const [categories] = useAtom(categoriesByCompanyAtom);
    const [, setRefresh] = useAtom(refreshCategoriesAtom);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [showLoading, setShowLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const canManage = session?.user.role === "ADMIN" || session?.user.role === "MANAGER";

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Excluir Categoria?",
            text: "Isso pode afetar os lançamentos financeiros vinculados!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Sim, excluir",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await deleteCategory(id);
                setRefresh((r) => r + 1);
                Swal.fire("Sucesso", "Categoria removida.", "success");
            } catch (error) {
                Swal.fire("Erro", "Não foi possível excluir.", "error");
            }
        }
    };

    return (
        <div className="p-10 font-sans">
            <TopNav title="Categorias Financeiras" />

            <main className="mt-8">
                {showLoading ? (
                    <Loading />
                ) : !categories || categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-slate-500">
                        <Tag size={48} className="mb-4" />
                        <p>Nenhuma categoria encontrada.</p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-3">
                        {categories.map((c) => (
                            <li
                                key={c.id}
                                className="p-4 border rounded-xl shadow-sm flex justify-between items-center hover:border-blue-300 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Ícone Dinâmico: Muda de cor no hover baseada no tipo */}
                                    <div className={`p-2.5 rounded-lg transition-colors ${c.type === 'INCOME'
                                        ? 'bg-emerald-50  dark:bg-slate-900 text-emerald-600 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-600 group-hover:text-white'
                                        : 'bg-rose-50  dark:bg-slate-900 text-rose-600 group-hover:bg-rose-600 dark:group-hover:bg-rose-600 group-hover:text-white'
                                        }`}>
                                        <Tag size={20} />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-slate-700">{c.name}</p>
                                            {c.emphasis && (
                                                <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                    <Star size={10} fill="currentColor" />
                                                    Destaque
                                                </div>
                                            )}
                                        </div>
                                        <p className={`text-xs font-medium mt-0.5 ${c.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
                                            }`}>
                                            {c.type === "INCOME" ? "Receita" : "Despesa"}
                                        </p>
                                    </div>
                                </div>

                                {canManage && (
                                    <div className="flex gap-1">
                                        <button
                                            title="Editar"
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            onClick={() => {
                                                setSelectedCategory(c);
                                                setDrawerOpen(true);
                                            }}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            title="Excluir"
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

            {/* FAB - Botão Flutuante */}
            {canManage && (
                <button
                    title="Adicionar Categoria"
                    className="fixed bottom-10 right-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95"
                    onClick={() => {
                        setSelectedCategory(null);
                        setDrawerOpen(true);
                    }}
                >
                    <Plus size={28} />
                </button>
            )}

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