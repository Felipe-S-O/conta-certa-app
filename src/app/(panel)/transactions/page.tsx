"use client";
import { useAtom } from "jotai";
import TopNav from "@/components/nav/top-nav";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { transactionsByCompanyAtom } from "@/atoms/transactionAtom";
import Loading from "@/components/loading";
import { Edit, Trash2 } from "lucide-react";

const TransactionsPage = () => {
    const { data: session } = useSession();
    const [transactions] = useAtom(transactionsByCompanyAtom);

    const [showLoading, setShowLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setShowLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const canManage = session?.user.role === "ADMIN" || session?.user.role === "MANAGER";

    return (
        <div className="p-10 font-sans">
            <TopNav title="Lista de Transações" />

            <main className="mt-8">
                <div>

                    {showLoading ? (
                        <Loading />
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {transactions?.map((t) => (
                                <li
                                    key={t.id}
                                    className="p-2 border rounded flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-bold">{t.description}</p>
                                        <p className="text-sm text-slate-600">
                                            Tipo: {t.type} | Status: {t.status}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            Valor: R$ {t.amount.toFixed(2)} | Taxa: R$ {t.fee.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Data: {t.date} | Vencimento: {t.dueDate}
                                        </p>
                                    </div>

                                    {canManage && (
                                        <div className="flex gap-4">
                                            <button
                                                aria-label="Editar transação"
                                                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                onClick={() => console.log("Editar transação", t.id)}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                aria-label="Excluir transação"
                                                className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                                onClick={() => console.log("Excluir transação", t.id)}
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

export default TransactionsPage;