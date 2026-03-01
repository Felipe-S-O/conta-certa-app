import { atom } from "jotai";
import { getSession } from "next-auth/react";
import { startOfMonth, format } from "date-fns";
import {
  getBalanceCalculated,
  BalanceResponse,
} from "@/services/balanceService";

// Interface para o gráfico (Circle Packing)
export interface CategorySummary {
  name: string;
  value: number;
  tipo: "EXPENSE" | "INCOME";
  destaque: boolean;
}

/**
 * 1. ÁTOMO DE FILTRO
 * Inicia com o mês atual: 2026-02-01 até 2026-02-28
 */
export const balanceFiltersAtom = atom({
  startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
  endDate: format(new Date(), "yyyy-MM-dd"), // Ajustado para 'hoje' para evitar datas futuras
});

/**
 * 2. ÁTOMO DE DADOS BRUTOS
 * O Jotai resolve a Promise automaticamente quando usado com useAtomValue.
 */
export const balanceCalculatedAtom = atom(async (get) => {
  const filters = get(balanceFiltersAtom);

  const sDate =
    filters.startDate || format(startOfMonth(new Date()), "yyyy-MM-dd");
  const eDate = filters.endDate || format(new Date(), "yyyy-MM-dd");

  const session = await getSession();
  const companyId = session?.user?.companyId;

  if (!companyId) return null;

  try {
    return await getBalanceCalculated(sDate, eDate, Number(companyId));
  } catch (error) {
    console.error("Erro ao buscar balanço calculado:", error);
    return null;
  }
});

/**
 * 3. SELETOR PARA O GRÁFICO
 * Transformação dos dados para o Circle Packing.
 */
export const chartDataAtom = atom(async (get): Promise<CategorySummary[]> => {
  // O 'get' em um átomo async já aguarda a resolução do balanceCalculatedAtom
  const balance = await get(balanceCalculatedAtom);

  if (!balance) return [];

  try {
    // Unificamos receitas e despesas para o gráfico de bolhas
    const allCategories = [
      ...(balance.topReceitas || []),
      ...(balance.topDespesas || []),
    ];

    return allCategories.map((item) => ({
      name: item.nome,
      value: item.total,
      tipo: item.tipo as "EXPENSE" | "INCOME",
      destaque: !!item.destaque,
    }));
  } catch (error) {
    console.error("Erro ao processar chartDataAtom:", error);
    return [];
  }
});

/**
 * 4. SELETOR PARA OS CARDS DE RESUMO
 */
export const summaryCardsAtom = atom(async (get) => {
  const balance = await get(balanceCalculatedAtom);

  if (!balance) {
    return { receita: 0, compras: 0, despesas: 0, taxas: 0, saldoFinal: 0 };
  }

  return {
    receita: balance.receita,
    compras: balance.compras,
    despesas: balance.despesas,
    taxas: balance.taxas,
    saldoFinal: balance.saldoFinal,
  };
});
