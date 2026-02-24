// services/purchaseService.ts
import api from "@/lib/api";

export interface Purchase {
  id: number;
  companyId: number;
  userId: number;
  createdBy: number;
  date: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export const purchasesByCompany = async (
  companyId: number,
): Promise<Purchase[]> => {
  const { data } = await api.get(`/v1/purchases/company/${companyId}`);
  return data;
};

export interface PurchasesData {
  id?: number;
  companyId: number;
  userId: number;
  createdBy: number;
  date: string;
  total: number;
}

/**
 * Cria um novo registro de compra
 */
export const createPurchases = async (data: PurchasesData) => {
  const res = await api.post("/v1/purchases", data);
  return res.data;
};

/**
 * Atualiza uma compra existente
 */
export const updatePurchases = async (data: Partial<PurchasesData>) => {
  // Se 'data' já tem o id (o que o formulário envia),
  // basta passar o data diretamente.
  const res = await api.put(`/v1/purchases`, data);
  return res.data;
};

/**
 * Remove uma compra
 */
export const deletePurchases = async (id: number) => {
  const res = await api.delete(`/v1/purchases/${id}`);
  return res.data;
};
