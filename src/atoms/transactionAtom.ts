import { atom } from "jotai";
import { filterTransactions } from "@/services/transactionService";
import { getSession } from "next-auth/react";

export const refreshTransactionAtom = atom(0);
export const transactionFiltersAtom = atom<any>({});

export const transactionsByCompanyAtom = atom(async (get) => {
  // 1. Dependências reativas
  const filters = get(transactionFiltersAtom);
  get(refreshTransactionAtom);

  const session = await getSession();
  const companyId = session?.user?.companyId;
  if (!companyId) return [];

  // Função auxiliar para garantir formato yyyy-MM-dd
  const formatDate = (d: Date | string) => {
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleDateString("sv-SE");
  };

  // 2. Limpeza e Formatação de Datas Manuais
  const activeFilters = Object.fromEntries(
    Object.entries(filters)
      .filter(([_, v]) => v !== "" && v !== null && v !== undefined)
      .map(([key, value]) => {
        // Se a chave for de data, aplica a formatação ISO local
        if (
          key.toLowerCase().includes("date") ||
          key.toLowerCase().includes("duedate")
        ) {
          return [key, formatDate(value as string)];
        }
        return [key, value];
      }),
  );

  console.log(
    "Requisitando dados novos da API com filtros formatados:",
    activeFilters,
  );

  try {
    // Se houver filtro manual, chama a API de filtro com datas formatadas
    if (Object.keys(activeFilters).length > 0) {
      return await filterTransactions({ ...activeFilters, companyId });
    }

    // --- LÓGICA PADRÃO (Sem filtros manuais) ---
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1); // Seus 30 dias de intervalo

    return await filterTransactions({
      companyId,
      startDate: formatDate(ontem),
      endDate: formatDate(hoje),
    });
  } catch (error) {
    console.error("Erro ao buscar na API:", error);
    return [];
  }
});
