import { atom } from "jotai";
import { getSession } from "next-auth/react";
import { usersByCompany } from "@/services/userService";

export const refreshUsersAtom = atom(0);

export const usersByCompanyAtom = atom(async (get) => {
  // 1. Dependência para forçar reload
  const refresh = get(refreshUsersAtom);

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
    return await usersByCompany(companyId);
  } catch (error) {
    console.error("Erro ao buscar usuários por empresa:", error);
    return [];
  }
});
