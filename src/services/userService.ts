import api from "@/lib/api"; // Certifique-se de que o caminho está correto para o arquivo onde você criou o interceptor

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Busca usuário pelo email.
 * O token não é mais necessário como parâmetro aqui,
 * pois o interceptor injeta o Authorization: Bearer automaticamente.
 */
export const getUserByEmail = async (email: string): Promise<User> => {
  const { data } = await api.get(`/v1/users/email/${email}`);
  return data;
};

/**
 * Busca todos os usuários de uma empresa pelo companyId.
 * O token também é injetado automaticamente pelo interceptor.
 */
export const usersByCompany = async (companyId: number): Promise<User[]> => {
  const { data } = await api.get(`/v1/users/company/${companyId}`);
  return data;
};
