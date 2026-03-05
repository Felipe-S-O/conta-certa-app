// src/lib/permissions.ts
export const ROLE_ROUTES = {
  ADMIN: [
    "/users",
    "/configuracoes",
    "/transactions",
    "/categories",
    "/products",
    "/purchases",
    "/dashboard",
  ],
  MANAGER: [
    "/categories",
    "/products",
    "/transactions",
    "/purchases",
    "/dashboard",
  ],
  USER: ["/products", "/purchases", "/dashboard"],
} as const;

export type Role = keyof typeof ROLE_ROUTES;
