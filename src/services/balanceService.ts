import api from "@/lib/api";

// Interface para o resumo das categorias dentro do balanço
export interface CategorySummary {
  id: number;
  nome: string;
  total: number;
  tipo: "EXPENSE" | "INCOME";
  destaque: boolean;
}

// Interface para a resposta do balanço detalhado
export interface BalanceResponse {
  receita: number;
  compras: number;
  despesas: number;
  taxas: number;
  saldoFinal: number;
  topReceitas: CategorySummary[];
  topDespesas: CategorySummary[];
}

// Interface para os itens do gráfico de 7 dias
export interface DailyBalance {
  date: string;
  receita: number;
  despesa: number;
  saldo: number;
}

/**
 * Busca o balanço detalhado com base em um intervalo de datas e ID da empresa.
 * Usando o endpoint GET com PathVariables conforme configurado.
 */
export const getBalanceCalculated = async (
  startDate: string,
  endDate: string,
  companyId: number,
): Promise<BalanceResponse> => {
  const { data } = await api.get(
    `/v1/balance/calculate/${startDate}/${endDate}/${companyId}`,
  );
  return data;
};

/**
 * Busca o histórico dos últimos 7 dias (excluindo hoje) para gráficos.
 */
export const getLastSevenDaysHistory = async (
  companyId: number,
): Promise<DailyBalance[]> => {
  const { data } = await api.get(`/v1/balance/history-seven-days/${companyId}`);
  return data;
};
