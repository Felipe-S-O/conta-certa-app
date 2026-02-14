import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
      // CLIENTE: getSession() funciona via cookies do browser
      const session = await getSession();
      token = session?.accessToken;
    } else {
      // SERVIDOR: Requer authOptions.
      // Importante: Em Server Components, o ideal é injetar o token
      // antes da chamada, mas este interceptor tentará buscar a sessão.
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Importante: No servidor, não tentamos refresh via interceptor,
      // deixamos o NextAuth resolver isso na próxima requisição de página.
      if (typeof window === "undefined") return Promise.reject(error);

      const session = await getSession();

      if (
        session?.accessToken &&
        session?.error !== "RefreshAccessTokenError"
      ) {
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        return api(originalRequest);
      } else {
        // Se a sessão tem erro, o refresh token na API Java expirou de vez
        signOut({ callbackUrl: "/auth/login" });
      }
    }
    return Promise.reject(error);
  },
);

export default api;
