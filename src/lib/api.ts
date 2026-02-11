import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // URL da sua API definida no .env
});

// Interceptor para injetar o accessToken do Java em todas as chamadas
api.interceptors.request.use(async (config) => {
  const session = (await getSession()) as any;

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

export default api;
