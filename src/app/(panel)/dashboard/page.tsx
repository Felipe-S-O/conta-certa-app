"use client";

import { Suspense } from "react";
import { useAtomValue } from "jotai";
import TopNav from "@/components/nav/top-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { addThousandsSeparator } from "@/lib/utils";

// Componentes internos
import HistorySevenDays from "@/components/chart-blocks/charts/history-seven-days/page";
import SummaryCategory from "@/components/chart-blocks/charts/summary-category/page";
import { DateFilter } from "@/components/DateFilter";
import { balanceFiltersAtom, summaryCardsAtom } from "@/atoms/balanceAtom";

export default function DashboardPage() {

    const filters = useAtomValue(balanceFiltersAtom);
    const filterKey = `${filters.startDate}-${filters.endDate}`;
    return (
        <div className="p-10 font-sans bg-background min-h-screen text-foreground">
            <TopNav title="Dashboard Financeiro" />

            <main className="mt-8 space-y-8">
                {/* Filtro de Data no topo à direita */}
                <div className="flex justify-end">
                    <DateFilter />
                </div>

                {/* Cards de Resumo com Suspense */}
                <Suspense fallback={<CardGridSkeleton />}>
                    <SummaryCardsSection />
                </Suspense>

                {/* Seção de Gráficos (Histórico + Categorias) */}
                <div className="grid grid-cols-1 border rounded-xl bg-card border-border lg:grid-cols-12 overflow-hidden shadow-sm">
                    <div className="p-6 lg:col-span-8 border-b lg:border-b-0 lg:border-r">
                        <Suspense fallback={<Skeleton className="h-87.5 w-full" />}>
                            <HistorySevenDays />
                        </Suspense>
                    </div>

                    <div className="p-6 lg:col-span-4 bg-muted/5">
                        <Suspense fallback={<Skeleton className="h-87.5 w-full" />}>
                            <SummaryCategory key={`cat-${filterKey}`} />
                        </Suspense>
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- SUB-COMPONENTES AUXILIARES ---

function SummaryCardsSection() {
    const summary = useAtomValue(summaryCardsAtom);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <CardSummary title="Receita" value={summary.receita} colorClass="text-emerald-600" />
            <CardSummary title="Compras" value={summary.compras} colorClass="text-orange-500" />
            <CardSummary title="Despesas" value={summary.despesas} colorClass="text-rose-500" />
            <CardSummary title="Taxas" value={summary.taxas} colorClass="text-slate-600" />
            <CardSummary
                title="Saldo Final"
                value={summary.saldoFinal}
                isBold
                colorClass={summary.saldoFinal >= 0 ? 'text-blue-600' : 'text-rose-700'}
            />
        </div>
    );
}
interface CardSummaryProps {
    title: string;
    value: number;
    colorClass: string;
    isBold?: boolean;
}

function CardSummary({ title, value, colorClass, isBold = false }: CardSummaryProps) {
    return (
        <div className="p-5 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
            <h3 className={`text-xl mt-1 ${isBold ? 'font-black' : 'font-bold'} ${colorClass}`}>
                R$ {addThousandsSeparator(value || 0)}
            </h3>
        </div>
    );
}

function CardGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="p-5 rounded-2xl border bg-card">
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-7 w-24" />
                </div>
            ))}
        </div>
    );
}