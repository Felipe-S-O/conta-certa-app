"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useAtom } from "jotai";

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

import { createCategory, updateCategory } from "@/services/categoryService";
import { refreshCategoriesAtom } from "@/atoms/categoryAtom";
import { Switch } from "./ui/switch";

// Schema alinhado com seus dados
const categorySchema = z.object({
    name: z.string().min(2, "O nome é obrigatório"),
    type: z.enum(["INCOME", "EXPENSE"]),
    emphasis: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryDrawerProps {
    category?: any; // Recebe o objeto completo do seu JSON
    open: boolean;
    onClose: () => void;
}

export default function CategoryDrawer({ category, open, onClose }: CategoryDrawerProps) {
    const { data: session } = useSession();
    const [, setRefresh] = useAtom(refreshCategoriesAtom);
    const companyId = session?.user?.companyId;

    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            type: "EXPENSE",
            emphasis: true,
        },
    });

    useEffect(() => {
        if (open) {
            if (category) {
                form.reset({
                    name: category.name,
                    type: category.type,
                    emphasis: category.emphasis,
                });
            } else {
                form.reset({
                    name: "",
                    type: "EXPENSE",
                    emphasis: false,
                });
            }
        }
    }, [category, open, form]);

    const onSubmit = async (data: CategoryFormData) => {
        try {
            const payload = {
                ...data,
                companyId: companyId as number,
                userId: Number(session?.user?.id),
            };

            if (category?.id) {
                await updateCategory({ ...payload, id: Number(category.id) });
                toast.success("Categoria atualizada!");
            } else {
                await createCategory(payload as any);
                toast.success("Categoria criada com sucesso!");
            }

            setRefresh((r) => r + 1);
            onClose();
        } catch (error: any) {
            toast.error("Erro ao salvar categoria");
        }
    };

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent className="max-w-md mx-auto">
                <DrawerHeader className="border-b">
                    <DrawerTitle className="text-lg font-bold">
                        {category?.id ? "Editar Categoria" : "Nova Categoria"}
                    </DrawerTitle>
                </DrawerHeader>

                <Form {...form}>
                    <form id="category-form" onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">

                        {/* Nome: "Motobo" */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Motoboy, Aluguel..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tipo: INCOME/EXPENSE apresentado em PT-BR */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Lançamento</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="INCOME">Receita</SelectItem>
                                            <SelectItem value="EXPENSE">Despesa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Emphasis: Destaque */}
                        <FormField
                            control={form.control}
                            name="emphasis"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-md border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Destaque</FormLabel>
                                        <p className="text-xs text-muted-foreground">Dar ênfase a esta categoria</p>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                <DrawerFooter className="flex-row justify-end gap-3 border-t p-4">
                    <DrawerClose asChild>
                        <Button variant="ghost">Cancelar</Button>
                    </DrawerClose>
                    <Button
                        form="category-form"
                        type="submit"
                        className=" bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? "Salvando..." : "Salvar Categoria"}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}