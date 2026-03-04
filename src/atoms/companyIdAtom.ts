import { atom } from "jotai";
import { usersByCompany } from "@/services/userService";

// 1. O Átomo de "Depósito": Ele guarda o companyId.
// Começa como null e será preenchido pelo seu PanelLayout.
export const companyIdAtom = atom<number | null>(null);

// 2. O Átomo de "Gatilho": Serve para você forçar um reload manual se precisar.
export const refreshUsersAtom = atom(0);

// 3. O Átomo de "Busca" (TUDO EM UM):
// Ele observa os dois acima e só vai no Cloud Run quando o ID aparece.
export const usersByCompanyAtom = atom(async (get) => {
  const companyId = get(companyIdAtom); // Escuta o ID
  get(refreshUsersAtom); // Escuta o refresh

  // Se o ID ainda não chegou (comum na Vercel no primeiro segundo),
  // ele retorna vazio e não quebra a aplicação.
  if (!companyId) {
    return [];
  }

  try {
    // Agora que temos o ID de Março/2026, fazemos a busca real
    return await usersByCompany(companyId);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
});
