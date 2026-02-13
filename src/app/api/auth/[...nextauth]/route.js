import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

async function refreshAccessToken(token) {
    try {
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh/${token.email}`,
            {},
            { headers: { Authorization: `Bearer ${token.refreshToken}` } }
        );

        const { accessToken, refreshToken } = response.data;
        const decoded = jwtDecode(accessToken);

        return {
            ...token,
            accessToken,
            refreshToken: refreshToken ?? token.refreshToken,
            exp: decoded.exp,
        };
    } catch (error) {
        return { ...token, accessToken: "", error: "RefreshAccessTokenError" };
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
                    return res.data; // Retorna { accessToken, refreshToken }
                } catch (error) {
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                const decoded = jwtDecode(user.accessToken);
                return {
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    email: decoded.sub,
                    role: decoded.roles ?? decoded.role,
                    exp: decoded.exp,
                };
            }

            // IMPORTANTE: Atualiza o JWT com os dados do banco enviados pelo front
            if (trigger === "update" && session) {
                return { ...token, ...session };
            }

            const nowInSeconds = Math.floor(Date.now() / 1000);
            if (nowInSeconds >= token.exp - 60) {
                return await refreshAccessToken(token);
            }

            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.error = token.error;
            session.user = {
                id: token.id,
                firstName: token.firstName,
                lastName: token.lastName,
                companyId: token.companyId,
                role: token.role,
                email: token.email
            };
            return session;
        },
    },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };