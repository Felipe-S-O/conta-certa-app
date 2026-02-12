import { User, usersByCompany } from "@/services/userService";
import { atom } from "jotai";

// Átomo com usuário logado (já existe)
export const userAtom = atom<User | null>(null);

// Átomo assíncrono que depende do userAtom
export const usersByCompanyAtom = atom(async (get) => {
  const user = get(userAtom);
  if (!user) return []; // se não tiver usuário logado, retorna lista vazia
  return await usersByCompany(user.companyId);
});
