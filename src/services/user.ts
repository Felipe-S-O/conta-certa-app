import axios from "axios";

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

// Criamos a instância com uma verificação simples
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getUserByEmail = async (
  email: string,
  token: string,
): Promise<User> => {
  // Verificação de segurança para evitar chamadas inválidas ao Java
  if (!email || !token || token === "undefined") {
    throw new Error("Email ou Token não fornecidos para a busca de usuário.");
  }

  const { data } = await api.get<User>(`/v1/users/email/${email}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export default api;
