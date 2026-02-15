"use client";

import { useAtom } from "jotai";
import { productsByCompanyAtom, refreshProductsAtom } from "@/atoms/productAtom";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import TopNav from "@/components/nav/top-nav";
import Loading from "@/components/loading";
import { Edit, Plus, Trash2, Package } from "lucide-react";
import Swal from "sweetalert2";
import { deleteProduct } from "@/services/productService";
import ProductDrawer from "@/components/ProductDrawer";

const ProductsPage = () => {
    const { data: session } = useSession();
    const [products] = useAtom(productsByCompanyAtom);
    const [, setRefresh] = useAtom(refreshProductsAtom);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showLoading, setShowLoading] = useState(true);

    // Simula um loading inicial para suavizar o carregamento dos dados do Atom
    useEffect(() => {
        const timer = setTimeout(() => setShowLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const canManage = session?.user.role === "ADMIN" || session?.user.role === "MANAGER";

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Excluir Produto?",
            text: "Esta ação removerá o produto permanentemente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Sim, excluir",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await deleteProduct(id);
                setRefresh((prev) => prev + 1); // Atualiza a lista automaticamente
                Swal.fire("Sucesso", "Produto removido com sucesso.", "success");
            } catch (error) {
                Swal.fire("Erro", "Não foi possível excluir o produto.", "error");
            }
        }
    };

    return (
        <div className="p-10 font-sans">
            <TopNav title="Catálogo de Produtos" />

            <main className="mt-8">
                {showLoading ? (
                    <Loading />
                ) : !products || products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-slate-500">
                        <Package size={48} className="mb-4" />
                        <p>Nenhum produto cadastrado.</p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-3">
                        {products.map((p) => (
                            <li
                                key={p.id}
                                className="p-4 border rounded-xl shadow-sm flex justify-between items-center hover:border-blue-300 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-50 dark:bg-slate-900 text-blue-600 p-2.5 rounded-lg dark:group-hover:bg-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{p.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">ID: #{p.id}</p>
                                    </div>
                                </div>

                                {canManage && (
                                    <div className="flex gap-1">
                                        <button
                                            aria-label="Editar"
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            onClick={() => {
                                                setSelectedProduct(p);
                                                setDrawerOpen(true);
                                            }}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            aria-label="Excluir"
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            onClick={() => handleDelete(p.id)}
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

            {/* Floating Action Button */}
            {canManage && (
                <button
                    aria-label="Adicionar produto"
                    className="fixed bottom-10 right-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95"
                    onClick={() => {
                        setSelectedProduct(null);
                        setDrawerOpen(true);
                    }}
                >
                    <Plus size={28} />
                </button>
            )}

            <ProductDrawer
                open={drawerOpen}
                product={selectedProduct}
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedProduct(null);
                }}
            />
        </div>
    );
};

export default ProductsPage;