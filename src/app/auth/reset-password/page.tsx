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
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { resetPassword } from "@/services/password";

// 🔑 Schema de validação
const resetSchema = z
    .object({
        newPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
        confirmPassword: z.string().min(6, "Confirme sua senha"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

type ResetSchemaType = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token"); // ✅ pega token da URL

    const form = useForm<ResetSchemaType>({
        resolver: zodResolver(resetSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    const onSubmit = async (data: ResetSchemaType) => {
        if (!token) {
            toast.error("Token não encontrado na URL.");
            return;
        }

        setIsSubmitting(true);
        try {
            await resetPassword(token, data.newPassword);
            toast.success("Senha alterada com sucesso!");
            router.push("/auth"); // redireciona para login
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erro ao resetar senha.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nova Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Digite sua nova senha..." {...field} />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Confirme sua nova senha..." {...field} />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full bg-primary text-slate-200 hover:brightness-90"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Alterando senha..." : "Confirmar alteração"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}