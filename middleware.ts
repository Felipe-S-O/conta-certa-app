// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROLE_ROUTES, Role } from "./src/lib/permissions";
import { getToken } from "next-auth/jwt"; // Melhor forma de pegar os dados no middleware

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Pegar o token decodificado (isso é muito mais seguro que ler o cookie puro)
  // O getToken já lida com os nomes de cookies de Prod (__Secure-) e Dev
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const userRole = token?.role as Role; // O role deve estar no seu JWT do NextAuth

  // 2. Proteção de Rotas Públicas vs Privadas
  const isPublicRoute = pathname.startsWith("/auth") || pathname === "/";

  if (!isAuthenticated) {
    // Se não estiver logado e tentar acessar o painel, vai pro login
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.next();
  }

  // 3. Se estiver LOGADO
  if (isAuthenticated) {
    // Se tentar acessar o login já estando logado, manda pro dashboard
    if (pathname.startsWith("/auth/login")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 4. Validação de RBAC (Role-Based Access Control)
    // Se for uma rota do painel (não pública), verifica permissão
    if (!isPublicRoute) {
      const allowedRoutes = ROLE_ROUTES[userRole] || [];
      const isAllowed = allowedRoutes.some((route) =>
        pathname.startsWith(route),
      );

      // Se a rota não for permitida para o role dele, manda pro dashboard (página padrão)
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Roda em tudo exceto arquivos estáticos e API
    "/((?!api|_next/static|_next/image|favicon.ico|avatar.png|logo-inottec.png).*)",
  ],
};
