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

export interface TransactionData {
  id?: number;
  type:
    | "VARIABLE_INCOME"
    | "FIXED_INCOME"
    | "VARIABLE_EXPENSE"
    | "FIXED_EXPENSE";
  status: "PENDING" | "PAID" | "CANCELED";
  amount: number;
  date: string;
  dueDate?: string;
  description?: string;
  categoryId: number;
  userId?: number;
  companyId?: number;
  fee?: number;
  createdBy: number;
}

/**
 * Cria uma nova transação financeira
 */
export const createTransaction = async (data: TransactionData) => {
  const res = await api.post("/v1/transactions", data);
  return res.data;
};

/**
 * Atualiza uma transação existente
 * Geralmente o ID vai na URL: /v1/transactions/{id}
 */
export const updateTransaction = async (
  id: number,
  data: Partial<TransactionData>,
) => {
  const res = await api.put(`/v1/transactions/${id}`, data);
  return res.data;
};

export const deleteTransactions = async (id: number) => {
  const res = await api.delete(`/v1/transactions/${id}`);
  return res.data;
};
