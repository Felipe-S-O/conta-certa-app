"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { login } from "@/api/auth";
import { forgotPassword } from "@/api/password";

// Schemas de validação
const formSchema = z.object({
    email: z.string().trim().min(1, "E-mail é obrigatório").email("Formato de e-mail inválido"),
    password: z.string().trim().min(1, "Senha é obrigatória"),
});

const recoverySchema = z.object({
    emailrest: z.string().trim().min(1, "E-mail é obrigatório").email("Formato de e-mail inválido"),
});

type FormSchemaType = z.infer<typeof formSchema>;
type RecoverySchemaType = z.infer<typeof recoverySchema>;

export default function AuthPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRecovery, setShowRecovery] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const router = useRouter();

    // Formulário de login
    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
        shouldUnregister: true,
    });

    // Formulário de recuperação
    const recoveryForm = useForm<RecoverySchemaType>({
        resolver: zodResolver(recoverySchema),
        defaultValues: { emailrest: "" },
        shouldUnregister: true,
    });

    // Função de login
    const handleLogin = async (email: string, password: string) => {
        try {
            const data = await login(email, password);
            if (data.token) {
                localStorage.setItem("authToken", data.token);
                toast.success("Login realizado com sucesso!");
                router.push("/dashboard");
            } else {
                throw new Error("Token não recebido da API");
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || error.message || "Erro ao realizar login.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmit = async (data: FormSchemaType) => {
        setIsSubmitting(true);
        await handleLogin(data.email, data.password);
    };

    // Função de recuperação
    const onRecover = async (data: RecoverySchemaType) => {
        try {
            const result = await forgotPassword(data.emailrest);
            toast.success(result.message || "E-mail de recuperação enviado!");
            setCountdown(30);
        } catch (error: any) {
            const message = error?.response?.data?.message || error.message || "Erro ao enviar e-mail de recuperação.";
            toast.error(message);
        }
    };

    // efeito para reduzir contador
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-[url('/finance.jpg')] sm:bg-cover bg-right sm:bg-center">
            <Card className="w-full max-w-xs p-6">
                <CardHeader className="flex items-center justify-center">
                    <Image
                        src="/logo-inottec.png"
                        alt="Logo"
                        height={24}
                        width={140}
                        priority
                    />
                </CardHeader>
                <CardContent>
                    {!showRecovery ? (
                        // 🔑 Card de Login
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>E-mail</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Digite seu e-mail..." {...field} />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Digite sua senha..." {...field} />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" className="accent-primary" />
                                        Lembrar de mim
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowRecovery(true)}
                                        className="text-primary hover:underline"
                                    >
                                        Esqueceu sua senha?
                                    </button>
                                </div>
                                <Button type="submit" className="w-full bg-primary text-slate-200 hover:brightness-90">
                                    {isSubmitting ? "EFETUANDO LOGIN..." : "ENTRAR"}
                                </Button>
                            </form>
                        </Form>
                    ) : (
                        // 🔑 Card de Recuperação
                        <Form {...recoveryForm}>
                            <form onSubmit={recoveryForm.handleSubmit(onRecover)} className="space-y-6">
                                //TODO: ajusta Input não etsa funcionando
                                <FormField
                                    control={recoveryForm.control}
                                    name="emailrest"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Digite seu e-mail para recuperar</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Digite seu e-mail..." {...field} />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full bg-primary text-slate-200 hover:brightness-90"
                                    disabled={countdown > 0}
                                >
                                    {countdown > 0 ? `Aguarde ${countdown}s` : "Recuperar senha"}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setShowRecovery(false)}
                                    className="w-full text-sm text-gray-500 hover:underline"
                                >
                                    Voltar ao login
                                </button>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}