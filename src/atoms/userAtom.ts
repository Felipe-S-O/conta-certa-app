import { User, usersByCompany } from "@/services/userService";
import { atom } from "jotai";

// Átomo com usuário logado (já existe)
export const userAtom = atom<User | null>(null);

// Átomo assíncrono que depende do userAtom
export const refreshUsersAtom = atom(0);

export const usersByCompanyAtom = atom(async (get) => {
  const user = get(userAtom);
  const refresh = get(refreshUsersAtom); // dependência para forçar reload
  if (!user) return [];
  return await usersByCompany(user.companyId);
});
