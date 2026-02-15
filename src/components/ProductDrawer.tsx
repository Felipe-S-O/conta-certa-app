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

import { refreshProductsAtom } from "@/atoms/productAtom";
import { createProduct, updateProduct } from "@/services/productService";

const productSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(3, "O nome do produto deve ter pelo menos 3 caracteres"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductDrawerProps {
    product?: any;
    open: boolean;
    onClose: () => void;
}

export default function ProductDrawer({ product, open, onClose }: ProductDrawerProps) {
    const { data: session } = useSession();
    const [, setRefresh] = useAtom(refreshProductsAtom);
    const companyId = session?.user?.companyId;

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (product) {
                form.reset({
                    id: product.id,
                    name: product.name,
                });
            } else {
                form.reset({
                    name: "",
                });
            }
        }
    }, [product, open, form]);

    const onSubmit = async (data: ProductFormData) => {
        try {
            const payload = {
                name: data.name,
                companyId: companyId as number,
            };

            if (data.id) {
                await updateProduct({ ...payload, id: data.id } as any);
                toast.success("Produto atualizado com sucesso!");
            } else {
                await createProduct(payload);
                toast.success("Produto cadastrado!");
            }

            setRefresh((r) => r + 1);
            onClose();
        } catch (error: any) {
            toast.error("Erro ao salvar o produto");
        }
    };

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent className="max-w-md mx-auto">
                <DrawerHeader className="border-b">
                    <DrawerTitle className="text-lg font-bold">
                        {product?.id ? "Editar Produto" : "Novo Produto"}
                    </DrawerTitle>
                </DrawerHeader>

                <Form {...form}>
                    <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="p-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Produto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Notebook Dell Inspiron" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <p className="text-[10px] text-slate-400 mt-4 italic">
                            ID da Empresa: {companyId} (Vínculo Automático)
                        </p>
                    </form>
                </Form>

                <DrawerFooter className="flex-row justify-end gap-3 border-t p-4">
                    <DrawerClose asChild>
                        <Button variant="ghost">Cancelar</Button>
                    </DrawerClose>
                    <Button
                        form="product-form"
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? "Salvando..." : "Salvar Produto"}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}