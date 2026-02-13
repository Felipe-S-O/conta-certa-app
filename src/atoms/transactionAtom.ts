// atoms/transactionAtom.ts
import { atom } from "jotai";
import { transactionsByCompany } from "@/services/transactionService";
import { getSession } from "next-auth/react";

export const refreshTransactionAtom = atom(0);

export const transactionsByCompanyAtom = atom(async (get) => {
  // 1. Dependência para forçar reload
  const refresh = get(refreshTransactionAtom);

  // 2. Busca a sessão atualizada
  const session = await getSession();

  // 3. Verifica se existe o companyId
  const companyId = session?.user?.companyId;
  if (!companyId) {
    console.warn("Nenhum companyId encontrado na sessão.");
    return [];
  }

  // 4. Busca os usuários no backend
  try {
    return await transactionsByCompany(companyId);
  } catch (error) {
    console.error("Erro ao buscar transações por empresa:", error);
    return [];
  }
});
