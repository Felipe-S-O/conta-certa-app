"use client";
import { useAtom } from "jotai";
import TopNav from "@/components/nav/top-nav";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { purchasesByCompanyAtom } from "@/atoms/purchaseAtom";
import Loading from "@/components/loading";
import { Edit, Trash2 } from "lucide-react";

const PurchasesPage = () => {
    const { data: session } = useSession();
    const [purchases] = useAtom(purchasesByCompanyAtom);

    const [showLoading, setShowLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setShowLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const canManage = session?.role === "ADMIN" || session?.role === "MANAGER" || session?.role === "USER";

    return (
        <div className="p-10 font-sans">
            <TopNav title="Lista de Compras" />

            <main className="mt-8">
                <div>

                    {showLoading ? (
                        <Loading />
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {purchases?.map((p) => (
                                <li
                                    key={p.id}
                                    className="p-2 border rounded flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-bold">Compra #{p.id}</p>
                                        <p className="text-sm text-slate-600">
                                            Data: {p.date} | Total: R$ {p.total.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Criado por usuário {p.createdBy}
                                        </p>
                                    </div>

                                    {canManage && (
                                        <div className="flex gap-4">
                                            <button
                                                aria-label="Editar compra"
                                                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                onClick={() => console.log("Editar compra", p.id)}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                aria-label="Excluir compra"
                                                className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                                onClick={() => console.log("Excluir compra", p.id)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PurchasesPage;