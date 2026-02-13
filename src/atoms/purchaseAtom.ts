// atoms/purchaseAtom.ts
import { atom } from "jotai";
import { purchasesByCompany } from "@/services/purchaseService";
import { getSession } from "next-auth/react";

export const purchasesByCompanyAtom = atom(async (get) => {
  // 1. Busca a sessão atualizada (lê direto do cookie/JWT)
  const session = await getSession();

  // 2. Verifica se existe o companyId na sessão
  const companyId = session?.user?.companyId;

  if (!companyId) {
    console.warn("Nenhum companyId encontrado na sessão.");
    return [];
  }

  // 3. Busca os compras no backend Java
  try {
    return await purchasesByCompany(companyId);
  } catch (error) {
    console.error("Erro ao buscar compras por empresa:", error);
    return [];
  }
});
