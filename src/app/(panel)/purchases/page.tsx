"use client";

import { useAtom } from "jotai";
import { purchasesByCompanyAtom, refreshPurchaseAtom, } from "@/atoms/purchaseAtom";
import { useState, useEffect } from "react";
import TopNav from "@/components/nav/top-nav";
import Loading from "@/components/loading";
import { Plus, ShoppingBag, Calendar, Trash2, Edit } from "lucide-react";
import PurchaseDrawer from "@/components/purchaseDrawer";
import Swal from "sweetalert2";
import { deletePurchases } from "@/services/purchaseService";

const PurchasesPage = () => {
    const [purchases] = useAtom(purchasesByCompanyAtom);
    const [, setRefresh] = useAtom(refreshPurchaseAtom);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
    const [showLoading, setShowLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setShowLoading(false), 800);
    }, []);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Remover compra?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, excluir",
            confirmButtonColor: "#ef4444"
        });

        if (result.isConfirmed) {
            await deletePurchases(id);
            setRefresh((r) => r + 1);
        }
    };

    return (
        <div className="p-10 font-sans min-h-screen">
            <TopNav title="Compras e Suprimentos" />

            <main className="mt-8">
                {showLoading ? <Loading /> : !purchases || purchases.length === 0 ? (
                    <div className="flex flex-col items-center mt-20 text-slate-500">
                        <ShoppingBag size={48} className="mb-2" />
                        <p>Nenhuma compra registrada.</p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-3">
                        {purchases.map((p: any) => (
                            <li key={p.id} className="p-4 border rounded-xl shadow-sm flex justify-between items-center hover:border-blue-300 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-50 dark:bg-slate-900 text-blue-600 p-2.5 rounded-lg dark:group-hover:bg-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <ShoppingBag size={22} />
                                    </div>
                                    <div>
                                        <p className="font-bold">Compra #{p.id}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Calendar size={12} />
                                            {new Date(p.date).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <p className="font-bold text-lg">
                                        R$ {Number(p.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>

                                    {/* <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"> */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => { setSelectedPurchase(p); setDrawerOpen(true); }}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Editar compra"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Excluir compra"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            <button
                className="fixed bottom-10 right-10 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                onClick={() => { setSelectedPurchase(null); setDrawerOpen(true); }}
                title="Adicionar nova compra"
            >
                <Plus size={28} />
            </button>

            <PurchaseDrawer
                open={drawerOpen}
                purchase={selectedPurchase}
                onClose={() => setDrawerOpen(false)}
            />
        </div>
    );
};

export default PurchasesPage;