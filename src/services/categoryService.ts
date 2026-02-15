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

export const createCategory = async (data: {
  name: string;
  userId: number;
  emphasis: boolean;
  companyId: number;
  type: "EXPENSE" | "INCOME";
}) => {
  const res = await api.post("/v1/categories", data);
  return res.data;
};

export const updateCategory = async (data: {
  id: number;
  name: string;
  userId: number;
  emphasis: boolean;
  type: "EXPENSE" | "INCOME";
}) => {
  const res = await api.put("/v1/categories", data);
  return res.data;
};

export const deleteCategory = async (id: number) => {
  const res = await api.delete(`/v1/categories/${id}`);
  return res.data;
};
