"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import Swal from 'sweetalert2'
import { forgotPassword } from "@/services/password";

const recoverySchema = z.object({
    email: z.string().email("Formato inválido"),
});
type RecoverySchema = z.infer<typeof recoverySchema>;

export default function RecoveryForm({ onBack }: { onBack: () => void }) {
    const [countdown, setCountdown] = useState(0);
    const [started, setStarted] = useState(false);


    const form = useForm<RecoverySchema>({
        resolver: zodResolver(recoverySchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (data: RecoverySchema) => {
        setCountdown(30);
        try {
            const result = await forgotPassword(data.email);
            setStarted(true);
        } catch (err: any) {
            setCountdown(0);
            toast.error(err?.response?.data?.message || "Erro ao enviar e-mail");
        }
    };

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
            return () => clearTimeout(timer);
        }

        if (countdown === 0 && started) {
            Swal.fire({
                title: "E-mail de recuperação enviado. Verifique seu e-mail!",
                icon: "success",
                draggable: true
            });
            setStarted(false);
        }
    }, [countdown]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Digite seu e-mail para recuperar</FormLabel>
                            <FormControl>
                                <Input placeholder="Digite seu e-mail..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full bg-primary text-slate-200" disabled={countdown > 0}>
                    {countdown > 0 ? `Aguarde ${countdown}s` : "Recuperar senha"}
                </Button>

                <button type="button" onClick={onBack} className="w-full text-sm text-gray-500 hover:underline">
                    Voltar ao login
                </button>
            </form>
        </Form>
    );
}