// atoms/productAtom.ts
import { atom } from "jotai";
import { productsByCompany } from "@/services/productService";
import { getSession } from "next-auth/react";

export const refreshProductsAtom = atom(0);

export const productsByCompanyAtom = atom(async (get) => {
  // 1. Dependência para forçar reload
  const refresh = get(refreshProductsAtom);

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
    return await productsByCompany(companyId);
  } catch (error) {
    console.error("Erro ao buscar produto por empresa:", error);
    return [];
  }
});
