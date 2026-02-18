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
  // --- NOVOS CAMPOS RETORNADOS PELA API ---
  installmentNumber?: number; // Ex: 1
  totalInstallments?: number; // Ex: 12
  isFixed: boolean; // Identifica se é fixa
}

export interface TransactionData {
  id?: number;
  type:
    | "VARIABLE_INCOME"
    | "FIXED_INCOME"
    | "VARIABLE_EXPENSE"
    | "FIXED_EXPENSE";
  status: "PENDING" | "COMPLETED"; // Ajustado para bater com seu transaction_status do SQL
  amount: number;
  date: string;
  dueDate?: string;
  description?: string;
  categoryId: number;
  userId?: number;
  companyId?: number;
  fee?: number;
  createdBy: number;
  // --- NOVOS CAMPOS PARA ENVIO ---
  totalInstallments?: number; // Quantas vezes parcelar
  isFixed?: boolean; // Se é uma conta fixa
}

/**
 * Busca transações por empresa
 */
export const transactionsByCompany = async (
  companyId: number,
): Promise<Transaction[]> => {
  const { data } = await api.get(`/v1/transactions/company/${companyId}`);
  return data || []; // Retorna array vazio caso venha 204 No Content
};

/**
 * Filtra transações (Usado para o dashboard e relatórios)
 */
export const filterTransactions = async (
  filters: any,
): Promise<Transaction[]> => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();

  console.log(
    "🚀 Chamada API com Filtros:",
    `/v1/transactions/filter?${queryString}`,
  );

  const { data } = await api.get(`/v1/transactions/filter?${queryString}`);
  return data || [];
};

/**
 * Cria uma nova transação (Agora suporta parcelamento no Back-end)
 */
export const createTransaction = async (data: TransactionData) => {
  // O Java agora recebe totalInstallments e gera os registros no banco
  const res = await api.post("/v1/transactions", data);
  return res.data;
};

/**
 * Atualiza uma transação existente
 */
export const updateTransaction = async (data: Partial<TransactionData>) => {
  const res = await api.put(`/v1/transactions`, data);
  return res.data;
};

/**
 * Exclui uma transação específica
 */
export const deleteTransactions = async (id: number) => {
  const res = await api.delete(`/v1/transactions/${id}`);
  return res.data;
};
