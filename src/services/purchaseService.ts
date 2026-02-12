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
