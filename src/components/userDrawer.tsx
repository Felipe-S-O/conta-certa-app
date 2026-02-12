"use client";
import { useEffect } from "react";
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
import { createUser, updateUser } from "@/services/userService";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";

// Schema de validação
const userSchema = z.object({
    id: z.number().optional(),
    firstName: z.string().min(2, "Primeiro nome obrigatório"),
    lastName: z.string().min(2, "Sobrenome obrigatório"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
    role: z.enum(["ADMIN", "MANAGER", "USER"]),
    companyId: z.number().optional(),
    enabled: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserDrawer({
    user,
    open,
    onClose,
}: {
    user?: UserFormData;
    open: boolean;
    onClose: () => void;
}) {
    const [loggedUser] = useAtom(userAtom);
    const companyId = loggedUser?.companyId ?? 0;

    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            role: "USER",
            companyId,
            enabled: true,
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
                enabled: user.enabled,
            });
        } else {
            form.reset({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                role: "USER",
                companyId,
                enabled: true,
            });
        }
    }, [user, form, companyId]);

    const onSubmit = async (data: UserFormData) => {
        try {
            if (data.id) {
                await updateUser({
                    id: data.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    role: data.role,
                    enabled: data.enabled ?? true,
                    companyId,
                });
                toast.success("Usuário atualizado com sucesso!");
            } else {
                await createUser({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password: data.password!,
                    role: data.role,
                    companyId,
                });
                toast.success("Usuário criado com sucesso!");
            }
            onClose();
        } catch (error) {
            toast.error("Erro ao salvar usuário!");
        }
    };

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{user?.id ? "Editar Usuário" : "Adicionar Usuário"}</DrawerTitle>
                    {/* Botão de fechar no topo */}
                    <DrawerClose asChild>
                        <Button variant="ghost" className="absolute right-2 top-2">
                            ✕
                        </Button>
                    </DrawerClose>
                </DrawerHeader>

                {/* ScrollArea para rolagem */}
                <ScrollArea className="h-[60vh] px-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Primeiro Nome</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Digite o primeiro nome" {...field} />
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
                                            <Input placeholder="Digite o sobrenome" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Digite o email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {!user?.id && (
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Digite a senha" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecione o papel" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                                                    <SelectItem value="MANAGER">MANAGER</SelectItem>
                                                    <SelectItem value="USER">USER</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </ScrollArea>

                <DrawerFooter>
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="text-white"
                        onClick={form.handleSubmit(onSubmit)}
                    >
                        {form.formState.isSubmitting
                            ? "Salvando..."
                            : user?.id
                                ? "Salvar Alterações"
                                : "Criar Usuário"}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}