import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// 1. Função de Refresh
async function refreshAccessToken(token) {
    try {
        const username = token.email;
        console.log("Renovando token para:", username);

        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh/${username}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token.refreshToken}`,
                },
            }
        );

        const data = response.data; // Esperado: { accessToken: "...", refreshToken: "..." }
        const decoded = jwtDecode(data.accessToken);

        return {
            ...token,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken ?? token.refreshToken,
            exp: decoded.exp,
        };
    } catch (error) {
        console.error("Erro ao renovar token:", error);
        return {
            ...token,
            accessToken: null, // força logout se falhar
            error: "RefreshAccessTokenError",
        };
    }
}

// 2. Configuração do NextAuth
const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Java Backend",
            credentials: {
                email: { type: "text" },
                password: { type: "password" }
            },
            async authorize(credentials) {
                try {
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login`,
                        {
                            email: credentials?.email,
                            password: credentials?.password,
                        }
                    );

                    if (response.data) return response.data;
                    return null;
                } catch (error) {
                    console.error("Erro no login:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Login inicial
            if (user) {
                const decoded = jwtDecode(user.accessToken);
                return {
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    email: decoded.sub,
                    role: decoded.roles ?? decoded.role, // fallback
                    exp: decoded.exp,
                };
            }

            // Verifica se falta 1 minuto para expirar
            const nowInSeconds = Math.floor(Date.now() / 1000);
            const shouldRefreshTime = token.exp - 60;

            if (nowInSeconds >= shouldRefreshTime) {
                return await refreshAccessToken(token);
            }

            return token;
        },
        async session({ session, token }) {
            // Melhor manter fora de session.user
            session.accessToken = token.accessToken;
            session.email = token.email;
            session.role = token.role;
            // @ts-ignore
            session.error = token.error;

            return session;
        },
    },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/login",
    },
});

// 3. Exportação explícita
export { handler as GET, handler as POST };