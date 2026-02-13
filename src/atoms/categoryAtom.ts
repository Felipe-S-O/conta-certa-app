// atoms/categoryAtom.ts
import { atom } from "jotai";
import { categoriesByCompany } from "@/services/categoryService";
import { getSession } from "next-auth/react";

export const refreshCategoriesAtom = atom(0);

export const categoriesByCompanyAtom = atom(async (get) => {
  // 1. Dependência para forçar reload
  const refresh = get(refreshCategoriesAtom);

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
    return await categoriesByCompany(companyId);
  } catch (error) {
    console.error("Erro ao buscar categorias por empresa:", error);
    return [];
  }
});
