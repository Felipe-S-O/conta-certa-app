// atoms/transactionAtom.ts
import { atom } from "jotai";
import { transactionsByCompany } from "@/services/transactionService";
import { userAtom } from "@/atoms/userAtom";

export const transactionsByCompanyAtom = atom(async (get) => {
  const user = get(userAtom);
  if (!user) return [];
  return await transactionsByCompany(user.companyId);
});
