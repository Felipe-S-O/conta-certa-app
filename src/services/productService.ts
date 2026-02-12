// services/productService.ts
import api from "@/lib/api";

export interface Product {
  id: number;
  name: string;
  code: string;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

export const productsByCompany = async (
  companyId: number,
): Promise<Product[]> => {
  const { data } = await api.get(`/v1/products/company/${companyId}`);
  return data;
};
