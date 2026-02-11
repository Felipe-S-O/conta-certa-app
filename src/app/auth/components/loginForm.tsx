"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

const loginSchema = z.object({
    email: z.string().email("Formato inválido"),
    password: z.string().min(1, "Senha obrigatória"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginForm({
    onShowRecovery,
}: { onShowRecovery: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginSchema) => {
        setIsSubmitting(true);

        try {
            const result = await signIn("credentials", {
                email: data.email, // importante: NextAuth espera "username"
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Erro ao logar! Verifique as credenciais.");
            } else {
                toast.success("Login realizado com sucesso!");
                // router.push("/loading");
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err: any) {
            toast.error("Ocorreu um erro inesperado");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
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
                            <FormMessage />
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
                                <Input
                                    type="password"
                                    placeholder="Digite sua senha..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-between text-sm">
                    <button
                        type="button"
                        onClick={onShowRecovery}
                        className="text-primary hover:underline"
                    >
                        Esqueceu sua senha?
                    </button>
                </div>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-slate-200"
                >
                    {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
            </form>
        </Form>
    );
}