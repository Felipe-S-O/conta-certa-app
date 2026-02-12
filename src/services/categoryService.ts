// services/categoryService.ts
import api from "@/lib/api";

export interface Category {
  id: number;
  name: string;
  userId: number;
  emphasis: boolean;
  companyId: number;
  type: "EXPENSE" | "INCOME";
  createdAt: string;
  updatedAt: string;
}

export const categoriesByCompany = async (
  companyId: number,
): Promise<Category[]> => {
  const { data } = await api.get(`/v1/categories/company/${companyId}`);
  return data;
};
