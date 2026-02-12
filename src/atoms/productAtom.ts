// atoms/productAtom.ts
import { atom } from "jotai";
import { Product, productsByCompany } from "@/services/productService";
import { userAtom } from "@/atoms/userAtom";

export const productsByCompanyAtom = atom(async (get) => {
  const user = get(userAtom);
  if (!user) return [];
  return await productsByCompany(user.companyId);
});
