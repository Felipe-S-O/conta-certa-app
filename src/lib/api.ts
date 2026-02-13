import axios from "axios";
import { getSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // fallback para a rota se o centralizado falhar, ou verifique se o arquivo existe em @/lib/auth.ts

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    let token;

    if (typeof window !== "undefined") {
      // ESTAMOS NO NAVEGADOR (Client-side)
      const session = await getSession();
      token = session?.accessToken;
    } else {
      // ESTAMOS NO NODE.JS (Server-side / Actions)
      // Importante: getServerSession precisa das authOptions
      const session: any = await getServerSession(authOptions as any);
      token = session?.accessToken;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
