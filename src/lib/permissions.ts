// src/lib/permissions.ts
export const ROLE_ROUTES = {
  ADMIN: [
    "/usuarios",
    "/configuracoes",
    "/transacoes",
    "/categorias",
    "/produtos",
    "/compras",
    "/dashboard",
  ],
  MANAGER: [
    "/categorias",
    "/produtos",
    "/transacoes",
    "/compras",
    "/dashboard",
  ],
  USER: ["/produtos", "/compras", "/dashboard"],
} as const;

export type Role = keyof typeof ROLE_ROUTES;
