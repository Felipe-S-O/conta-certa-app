// atoms/categoryAtom.ts
import { atom } from "jotai";
import { categoriesByCompany } from "@/services/categoryService";
import { userAtom } from "@/atoms/userAtom";

export const categoriesByCompanyAtom = atom(async (get) => {
  const user = get(userAtom);
  if (!user) return [];
  return await categoriesByCompany(user.companyId);
});
