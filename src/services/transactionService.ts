// services/transactionService.ts
import api from "@/lib/api";

export interface Transaction {
  id: number;
  type: string;
  amount: number;
  date: string;
  dueDate: string;
  description: string;
  categoryId: number;
  userId: number;
  companyId: number;
  status: string;
  fee: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export const transactionsByCompany = async (
  companyId: number,
): Promise<Transaction[]> => {
  const { data } = await api.get(`/v1/transactions/company/${companyId}`);
  return data;
};
