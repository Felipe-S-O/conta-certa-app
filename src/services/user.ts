import axios from "axios";

// Tipagem do usuário conforme sua API
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

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Buscar usuário por email
export const getUserByEmail = async (
  email: string,
  token: string,
): Promise<User> => {
  const { data } = await api.get<User>(`/v1/users/email/${email}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data; // retorna objeto tipado User
};

export default api;
