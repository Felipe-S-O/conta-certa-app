// atoms/purchaseAtom.ts
import { atom } from "jotai";
import { Purchase, purchasesByCompany } from "@/services/purchaseService";
import { userAtom } from "@/atoms/userAtom";

export const purchasesByCompanyAtom = atom(async (get) => {
  const user = get(userAtom);
  if (!user) return [];
  return await purchasesByCompany(user.companyId);
});
