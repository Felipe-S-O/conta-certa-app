"use client";

import { useAtom } from "jotai";
import { refreshTransactionAtom, transactionFiltersAtom, transactionsAtom } from "@/atoms/transactionAtom";
import { useEffect, useState, useMemo, useCallback } from "react";
import TopNav from "@/components/nav/top-nav";
import Loading from "@/components/loading";
import {
    Edit, Plus, Trash2,
    ArrowUpCircle, ArrowDownCircle,
    Calendar, ReceiptText, Filter,
    User,
    XCircle
} from "lucide-react";
import Swal from "sweetalert2";
import TransactionDrawer from "@/components/transactionDrawer";
import TransactionFilterDrawer from "@/components/transactionFilterDrawer"; // 1. Importe o novo componente
import { deleteTransactions, filterTransactions } from "@/services/transactionService";
import { categoriesByCompanyAtom } from "@/atoms/categoryAtom";
import { Button } from "@/components/ui/button";
import { usersByCompanyAtom } from "@/atoms/companyIdAtom";
import { getSession } from "next-auth/react";

const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pendente", color: "bg-amber-100 text-amber-700" },
    PAID: { label: "Pago", color: "bg-emerald-100 text-emerald-700" },
    CANCELED: { label: "Cancelado", color: "bg-slate-100 text-slate-500" },
};

const TransactionsPage = () => {
    // Jotai
    const [transactions, setTransactions] = useAtom(transactionsAtom);
    const [activeFilters, setActiveFilters] = useAtom(transactionFiltersAtom);
    const [refresh, setRefresh] = useAtom(refreshTransactionAtom);
    const [categories] = useAtom(categoriesByCompanyAtom);
    const [users] = useAtom(usersByCompanyAtom);

    // Local UI
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Função auxiliar de data movida para cá
    const formatDate = (d: Date | string) => {
        const date = typeof d === "string" ? new Date(d) : d;
        return date.toLocaleDateString("sv-SE"); // yyyy-MM-dd
    };

    /**
     * Lógica de Busca movida do Atom para a Página
     */
    const loadTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const session = await getSession();
            const companyId = session?.user?.companyId;
            if (!companyId) return;

            // 1. Formata os filtros antes de enviar
            const formattedParams = Object.fromEntries(
                Object.entries(activeFilters)
                    .filter(([_, v]) => v !== "" && v !== null && v !== undefined)
                    .map(([key, value]) => {
                        if (key.toLowerCase().includes("date")) {
                            return [key, formatDate(value as string)];
                        }
                        return [key, value];
                    })
            );

            let data;
            if (Object.keys(formattedParams).length > 0) {
                // Busca com filtros manuais
                data = await filterTransactions({ ...formattedParams, companyId });
            } else {
                // Busca padrão (últimos 30 dias)
                const hoje = new Date();
                const trintaDiasAtras = new Date();
                trintaDiasAtras.setDate(hoje.getDate() - 30);

                data = await filterTransactions({
                    companyId,
                    startDate: formatDate(trintaDiasAtras),
                    endDate: formatDate(hoje),
                });
            }

            setTransactions(data);
        } catch (error) {
            console.error("Erro ao carregar transações:", error);
        } finally {
            setLoading(false);
        }
    }, [activeFilters, setTransactions]);

    // Dispara a busca quando filtros ou refresh mudarem
    useEffect(() => {
        loadTransactions();
    }, [loadTransactions, refresh]);

    // Estatísticas (Calculadas sobre os dados que vieram da API)
    const stats = useMemo(() => {
        if (!transactions) return { income: 0, expense: 0, balance: 0 };
        return transactions.reduce((acc: any, t: any) => {
            const amount = Number(t.amount);
            if (t.type.includes("INCOME")) acc.income += amount;
            else acc.expense += amount;
            acc.balance = acc.income - acc.expense;
            return acc;
        }, { income: 0, expense: 0, balance: 0 });
    }, [transactions]);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Excluir lançamento?",
            text: "Esta ação não pode ser desfeita e afetará o saldo!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Sim, excluir",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await deleteTransactions(id);
                setRefresh((prev) => prev + 1);
                Swal.fire("Excluído!", "Lançamento removido.", "success");
            } catch (error) {
                Swal.fire("Erro", "Não foi possível excluir.", "error");
            }
        }
    };

    return (
        <div className="p-8 font-sans">
            <TopNav title="Fluxo de Caixa" />

            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="p-5 rounded-2xl border shadow-sm">
                    <p className="text-sm font-medium ">Entradas</p>
                    <h3 className="text-2xl font-bold text-emerald-600">R$ {stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="p-5 rounded-2xl border shadow-sm">
                    <p className="text-sm font-medium ">Saídas</p>
                    <h3 className="text-2xl font-bold text-rose-600">R$ {stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="p-5 rounded-2xl border shadow-sm">
                    <p className="text-sm font-medium ">Saldo Atual</p>
                    <h3 className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                        R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                </div>
            </div>

            <main className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold tracking-tight">Lançamentos</h2>
                        {/* 5. Indicador de filtros ativos */}
                        {Object.keys(activeFilters).length > 0 && (
                            <button
                                onClick={() => setActiveFilters({})}
                                className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                                <XCircle size={12} /> Limpar Filtros
                            </button>
                        )}
                    </div>

                    {/* Botão que abre o Filtro */}
                    <button
                        onClick={() => setFilterDrawerOpen(true)}
                        className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all  ${Object.keys(activeFilters).length > 0
                            ? "text-blue-600"
                            : "text-white "
                            }`}
                    >
                        <Filter size={16} />
                        {Object.keys(activeFilters).length > 0 ? "Filtrado" : "Filtrar"}
                    </button>
                </div>

                {loading ? (
                    <Loading />
                ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-slate-500">
                        <ReceiptText size={48} className="mb-4 opacity-20" />
                        <p>Nenhuma transação encontrada.</p>
                        {Object.keys(activeFilters).length > 0 && (
                            <Button variant="link" onClick={() => setActiveFilters({})} className="text-blue-600">
                                Remover todos os filtros
                            </Button>
                        )}
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-3">
                        {transactions.map((t: any) => {
                            const isIncome = t.type.includes("INCOME");
                            const isFixed = t.type.includes("FIXED");
                            const categoryName = t.category?.name || categories?.find((c: any) => c.id === t.categoryId)?.name || "Geral";
                            const user = users?.find((u: any) => u.id === t.userId);
                            const responsibleName = user ? `${user.firstName} ${user.lastName}` : "Sistema";

                            return (
                                <li key={t.id} className="p-4 border rounded-xl shadow-sm flex justify-between items-center hover:border-blue-300 transition-all group bg-white dark:bg-slate-950">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-1.5 rounded-lg transition-colors ${isIncome
                                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600  group-hover:bg-emerald-600 dark:group-hover:bg-emerald-600 group-hover:text-white'
                                            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 group-hover:bg-rose-600 dark:group-hover:bg-rose-600 group-hover:text-white'
                                            }`}>
                                            {isIncome ? <ArrowUpCircle size={28} /> : <ArrowDownCircle size={28} />}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{t.description || "Sem descrição"}</p>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase border ${isFixed
                                                    ? 'border-blue-200 bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                                                    : 'border-slate-200 bg-slate-50 text-slate-500 dark:bg-slate-800/40'
                                                    }`}>
                                                    {isFixed ? "Fixo" : "Variável"}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-xs mt-1">
                                                <span className="flex items-center gap-1 font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                    <ReceiptText size={12} className="opacity-70" />
                                                    {categoryName}
                                                </span>
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    <Calendar size={12} />
                                                    {new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                                </span>
                                                <span className="flex items-center gap-1 text-slate-500 border-l pl-3 border-slate-200">
                                                    <User size={12} />
                                                    {responsibleName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className={`font-bold text-lg ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                                                {isIncome ? "+" : "-"} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${statusMap[t.status]?.color}`}>
                                                {statusMap[t.status]?.label}
                                            </span>
                                        </div>

                                        <div className="flex gap-1">
                                            <button title="Editar lançamento" onClick={() => { setSelectedTransaction(t); setDrawerOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                <Edit size={18} />
                                            </button>
                                            <button title="Excluir lançamento" onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </main>

            <button
                title="Novo lançamento"
                className="fixed bottom-10 right-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                onClick={() => { setSelectedTransaction(null); setDrawerOpen(true); }}
            >
                <Plus size={28} />
            </button>

            {/* Drawer de Cadastro/Edição */}
            <TransactionDrawer
                open={drawerOpen}
                transaction={selectedTransaction}
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedTransaction(null);
                }}
            />

            {/* 6. Renderização do Drawer de Filtro */}
            <TransactionFilterDrawer
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                onFilter={(filters: any) => {
                    setActiveFilters(filters);
                    // Opcional: setRefresh((prev) => prev + 1); // Se quiser recarregar da API
                }}
            />
        </div>
    );
};

export default TransactionsPage;