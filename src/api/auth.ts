import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Login
export const login = async (email: string, password: string) => {
  const { data } = await api.post("/v1/auth/login", { email, password });
  return data; // deve retornar { token: "..." }
};

export default api;
