import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Recuperação de senha
export const forgotPassword = async (email: string) => {
  const { data } = await api.post("/v1/password/forgot", { email });
  return data; // deve retornar { message: "..." }
};

// Reset de senha
export const resetPassword = async (token: string, newPassword: string) => {
  const { data } = await api.post("/v1/password/reset", { token, newPassword });
  return data; // deve retornar { message: "..." }
};
