// atoms/transactionAtom.ts
import { atom } from "jotai";
import { transactionsByCompany } from "@/services/transactionService";
import { getSession } from "next-auth/react";

export const transactionsByCompanyAtom = atom(async (get) => {
  // 1. Busca a sessão atualizada (lê direto do cookie/JWT)
  const session = await getSession();

  // 2. Verifica se existe o companyId na sessão
  const companyId = session?.user?.companyId;

  if (!companyId) {
    console.warn("Nenhum companyId encontrado na sessão.");
    return [];
  }

  // 3. Busca os transações no backend Java
  try {
    return await transactionsByCompany(companyId);
  } catch (error) {
    console.error("Erro ao buscar transações por empresa:", error);
    return [];
  }
});
