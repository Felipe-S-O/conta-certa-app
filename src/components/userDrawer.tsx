"use client";

import { use, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// UI Components
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { createUser, updateUser } from "@/services/userService";
import { useAtom } from "jotai";
import { refreshUsersAtom } from "@/atoms/userAtom";

// Schema de validação
const userSchema = z.object({
    id: z.number().optional(),
    firstName: z.string().min(2, "Primeiro nome obrigatório"),
    lastName: z.string().min(2, "Sobrenome obrigatório"),
    email: z.string().email("Email inválido"),
    password: z.string().optional(), // senha opcional
    role: z.enum(["ADMIN", "MANAGER", "USER"]),
    companyId: z.number().optional(),
    enabled: z.boolean().optional(),
}).refine((data) => {
    // Se for criação (sem id), senha deve ter pelo menos 6 caracteres
    if (!data.id && (!data.password || data.password.length < 6)) {
        return false;
    }
    return true;
}, {
    message: "Senha deve ter pelo menos 6 caracteres",
    path: ["password"],
});

type UserFormData = z.infer<typeof userSchema>;

interface UserDrawerProps {
    user?: UserFormData;
    open: boolean;
    onClose: () => void;
}

const USER_ROLES = [
    { id: "ADMIN", nome: "ADMIN - Gestor Total" },
    { id: "MANAGER", nome: "MANAGER - Gerente" },
    { id: "USER", nome: "USER - Operador" },
];

export default function UserDrawer({ user, open, onClose }: UserDrawerProps) {
    const { data: session } = useSession();
    const [, setRefresh] = useAtom(refreshUsersAtom);
    const companyId = session?.user?.companyId;

    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            password: "",
            role: user?.role || "USER",
            enabled: true,
        },
    });

    useEffect(() => {

        if (!open && !user) {
            form.reset({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                role: "USER",
                enabled: true,
            });
        }

        if (user?.id) {
            form.reset({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: "",
                role: user.role,
                enabled: true,
                id: user.id,
            });
        }
    }, [user, open, form]);

    const onSubmit = async (data: UserFormData) => {
        try {

            if (data.id) {
                await updateUser({
                    id: data.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    role: data.role,
                    enabled: true,
                    companyId: companyId as number
                });

                toast.success("Usuário atualizado!");

            } else {
                await createUser({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password: data.password!,
                    role: data.role,
                    companyId: companyId as number
                });
                toast.success("Usuário criado com sucesso!");
            }

            // força reload da lista
            setRefresh((r) => r + 1);

            onClose();
        } catch (error: any) {
            const backendError = error.response?.data?.message || error.message || "Erro interno";
            toast.error(`Falha no servidor: ${backendError}`);
        }
    };

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent className="max-w-2xl mx-auto">
                <DrawerHeader className="relative border-b">
                    <DrawerTitle className="text-xl font-bold">
                        {user?.id ? "Editar Usuário" : "Novo Usuário"}
                    </DrawerTitle>
                    <DrawerClose asChild>
                        <Button variant="ghost" className="absolute right-4 top-4 h-8 w-8 p-0">✕</Button>
                    </DrawerClose>
                </DrawerHeader>

                <ScrollArea className="h-[60vh] px-6 py-4">
                    <Form {...form}>
                        <form id="user-form" onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Primeiro Nome</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: João" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sobrenome</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Silva" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>E-mail Profissional</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="usuario@empresa.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {!user?.id && <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>
                                            Senha de Acesso
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />}
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Perfil de Acesso</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um nível" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {USER_ROLES.map((role) => (
                                                    <SelectItem key={role.id} value={role.id}>
                                                        {role.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </ScrollArea>

                <DrawerFooter className="flex-row justify-end gap-3 border-t p-6">
                    <Button variant="outline" onClick={onClose} type="button">
                        Cancelar
                    </Button>
                    <Button
                        form="user-form"
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {form.formState.isSubmitting ? "Processando..." : user?.id ? "Salvar Alterações" : "Cadastrar Usuário"}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}