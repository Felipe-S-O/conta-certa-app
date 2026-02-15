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

export const createProduct = async (data: {
  name: string;
  companyId: number;
}) => {
  const res = await api.post("/v1/products", data);
  return res.data;
};

export const updateProduct = async (data: { id: number; name: string }) => {
  const res = await api.put("/v1/products", data);
  return res.data;
};

export const deleteProduct = async (id: number) => {
  const res = await api.delete(`/v1/products/${id}`);
  return res.data;
};
