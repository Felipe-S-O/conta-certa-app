// atoms/productAtom.ts
import { atom } from "jotai";
import { productsByCompany } from "@/services/productService";
import { getSession } from "next-auth/react";

export const productsByCompanyAtom = atom(async (get) => {
  // 1. Busca a sessão atualizada (lê direto do cookie/JWT)
  const session = await getSession();

  // 2. Verifica se existe o companyId na sessão
  const companyId = session?.user?.companyId;

  if (!companyId) {
    console.warn("Nenhum companyId encontrado na sessão.");
    return [];
  }

  // 3. Busca os produto no backend Java
  try {
    return await productsByCompany(companyId);
  } catch (error) {
    console.error("Erro ao buscar produto por empresa:", error);
    return [];
  }
});
