// atoms/categoryAtom.ts
import { atom } from "jotai";
import { categoriesByCompany } from "@/services/categoryService";
import { getSession } from "next-auth/react";

export const categoriesByCompanyAtom = atom(async (get) => {
  // 1. Busca a sessão atualizada (lê direto do cookie/JWT)
  const session = await getSession();

  // 2. Verifica se existe o companyId na sessão
  const companyId = session?.user?.companyId;

  if (!companyId) {
    console.warn("Nenhum companyId encontrado na sessão.");
    return [];
  }

  // 3. Busca os categorias no backend Java
  try {
    return await categoriesByCompany(companyId);
  } catch (error) {
    console.error("Erro ao buscar categorias por empresa:", error);
    return [];
  }
});
