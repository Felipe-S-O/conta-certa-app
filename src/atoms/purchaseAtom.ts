// atoms/purchaseAtom.ts
import { atom } from "jotai";
import { purchasesByCompany } from "@/services/purchaseService";
import { getSession } from "next-auth/react";

export const refreshPurchaseAtom = atom(0);

export const purchasesByCompanyAtom = atom(async (get) => {
  // 1. Dependência para forçar reload
  const refresh = get(refreshPurchaseAtom);

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
    return await purchasesByCompany(companyId);
  } catch (error) {
    console.error("Erro ao buscar compras por empresa:", error);
    return [];
  }
});
