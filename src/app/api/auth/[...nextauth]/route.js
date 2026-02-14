import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

async function refreshAccessToken(token) {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh/${token.email}`;

        const res = await axios.put(url, {}, {
            headers: {
                Authorization: `Bearer ${token.refreshToken}`, // usa refreshToken no header
            },
        });

        const refreshedTokens = res.data;
        const decoded = jwtDecode(refreshedTokens.accessToken);

        console.log("Token renovado com sucesso!");

        return {
            accessToken: refreshedTokens.accessToken,
            refreshToken: refreshedTokens.refreshToken, // mantém o novo refreshToken
            email: decoded.sub,
            role: decoded.roles ?? decoded.role,
            accessTokenExp: decoded.exp,
            // Usamos 'accessTokenExp' em vez de 'exp' porque o NextAuth já gera um campo 'exp' interno
            // com valor padrão de 30 dias para controlar a sessão.
            // Se sobrescrevêssemos 'exp', esse valor seria substituído pelo padrão do NextAuth.
            // Por isso criamos 'accessTokenExp' para armazenar a expiração real do JWT do backend
            // e usamos esse campo para validar e renovar o token corretamente.
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            companyId: decoded.companyId,
        };
    } catch (error) {
        console.error("Erro ao renovar token:", error.response?.data || error.message);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Java Backend",
            credentials: {
                email: { type: "text" },
                password: { type: "password" }
            },
            async authorize(credentials) {
                try {
                    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login`, {
                        email: credentials?.email,
                        password: credentials?.password,
                    });

                    return { ...res.data, email: credentials?.email };
                } catch (error) {
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
                    refreshToken: user.refreshToken, // guarda refreshToken
                    email: user.email || decoded.sub,
                    role: decoded.roles ?? decoded.role,
                    accessTokenExp: decoded.exp, // exp direto do backend
                    id: user.id ?? decoded.id,
                    firstName: user.firstName ?? decoded.firstName,
                    lastName: user.lastName ?? decoded.lastName,
                    companyId: user.companyId ?? decoded.companyId,
                };
            }

            // Verificação de validade (10 segundos de margem)
            const nowInSeconds = Math.floor(Date.now() / 1000);
            const shouldRefresh = token.accessTokenExp - 10 < nowInSeconds;

            // console.group("Relatório de Validação do Token");
            // console.log("ID do Usuário (sub):", token.email);
            // console.log("Agora (em segundos):", nowInSeconds);
            // console.log("Expira em (token.accessTokenExp):", token.accessTokenExp);
            // console.log("Segundos restantes até expirar:", token.accessTokenExp - nowInSeconds);
            // console.log("Precisa renovar?", shouldRefresh ? "SIM ✅" : "NÃO ❌");
            // console.groupEnd();

            if (shouldRefresh) {
                return await refreshAccessToken(token);
            }

            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;
            session.error = token.error;
            session.user = {
                id: token.id,
                firstName: token.firstName,
                lastName: token.lastName,
                companyId: token.companyId,
                role: token.role,
                email: token.email,
            };
            return session;
        },
    },
    session: {
        strategy: "jwt",
        // não precisa definir maxAge fixo, usamos accessTokenExp do backend
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };