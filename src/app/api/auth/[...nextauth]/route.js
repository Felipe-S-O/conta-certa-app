import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Você precisará rodar: npm install jwt-decode

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Java Backend",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Senha", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login`,
                        {
                            email: credentials?.email,
                            password: credentials?.password,
                        }, {
                        headers: { "Content-Type": "application/json" }
                    });

                    const data = response.data; // Esperado: { accessToken: "...", refreshToken: "..." }

                    if (data && data.accessToken) {
                        return data; // Retornamos o objeto com os tokens para o callback JWT
                    }
                    return null;
                } catch (error) {
                    console.error("Erro na autenticação:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // No momento do login, o 'user' contém o que retornamos no authorize
            if (user) {
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;

                // Decodificamos o accessToken para extrair os dados do payload
                try {
                    const decoded = jwtDecode(user.accessToken);

                    // Mapeamos os campos do seu JWT Java para o token do NextAuth
                    token.role = decoded.roles;       // "ADMIN"
                    token.email = decoded.sub;        // "felipe.silva... @gmail.com"
                    // Caso seu Java mande firstName no JWT, adicione aqui:
                    // token.firstName = decoded.firstName;
                } catch (e) {
                    console.error("Erro ao decodificar JWT da API:", e);
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Repassamos os dados decodificados para a sessão do cliente
            if (session.user) {
                session.user.role = token.role;
                session.user.accessToken = token.accessToken;
                session.user.email = token.email;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };