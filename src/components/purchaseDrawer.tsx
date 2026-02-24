"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useAtom, useAtomValue } from "jotai";

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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";

import { refreshPurchaseAtom } from "@/atoms/purchaseAtom";
import { productsByCompanyAtom } from "@/atoms/productAtom";
import { createPurchases, updatePurchases } from "@/services/purchaseService";

// Schema robusto: Garante que os valores sejam números válidos antes de enviar
const purchaseSchema = z.object({
    id: z.number().optional(),
    date: z.string().min(1, "A data é obrigatória"),
    items: z.array(z.object({
        id: z.number().optional(),
        purchaseId: z.number().optional(),
        productId: z.coerce.number().min(1, "Selecione um produto"),
        quantity: z.coerce.number().min(1, "Mínimo 1"),
        price: z.coerce.number().min(0.01, "Preço inválido"),
    })).min(1, "Adicione pelo menos um item"),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export default function PurchaseDrawer({ purchase, open, onClose }: any) {
    const { data: session } = useSession();
    const [, setRefresh] = useAtom(refreshPurchaseAtom);
    const products = useAtomValue(productsByCompanyAtom);

    const form = useForm<PurchaseFormValues>({
        resolver: zodResolver(purchaseSchema) as any,
        defaultValues: {
            date: new Date().toISOString().split("T")[0],
            items: [{ productId: undefined as any, quantity: 1, price: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const watchedItems = useWatch({
        control: form.control,
        name: "items",
    });

    const totalGeral = watchedItems.reduce((acc, item) => {
        return acc + (Number(item?.quantity || 0) * Number(item?.price || 0));
    }, 0);

    // Resetar formulário ao abrir/editar
    useEffect(() => {
        if (open) {
            if (purchase) {
                form.reset({
                    id: purchase.id,
                    date: purchase.date?.split("T")[0],
                    items: purchase.items?.map((item: any) => ({
                        id: item.id,
                        purchaseId: purchase.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })) || [],
                });
            } else {
                form.reset({
                    date: new Date().toISOString().split("T")[0],
                    items: [{ productId: undefined as any, quantity: 1, price: 0 }]
                });
            }
        }
    }, [purchase, open, form]);

    const onSubmit = async (data: PurchaseFormValues) => {
        try {
            // Montagem do Payload limpo
            const payload: any = {
                userId: Number(session?.user?.id),
                companyId: Number(session?.user?.companyId),
                createdBy: Number(session?.user?.id),
                date: data.date,
                total: parseFloat(totalGeral.toFixed(2)),
                items: data.items.map(item => {
                    const itemObj: any = {
                        productId: Number(item.productId),
                        quantity: Number(item.quantity),
                        price: Number(item.price)
                    };
                    // Só envia IDs se estiver editando
                    if (item.id) itemObj.id = item.id;
                    if (data.id) itemObj.purchaseId = data.id;
                    return itemObj;
                })
            };

            if (data.id) {
                payload.id = data.id;
                await updatePurchases(payload);
                toast.success("Compra atualizada com sucesso!");
            } else {
                // CADASTRO: payload vai sem a chave 'id'
                await createPurchases(payload);
                toast.success("Compra registrada com sucesso!");
            }

            setRefresh((r: number) => r + 1);
            onClose();
        } catch (error: any) {
            console.error("Erro na requisição:", error.response?.data);
            toast.error(error.response?.data?.message || "Erro ao salvar compra");
        }
    };

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent className="max-w-3xl mx-auto h-[90vh]">
                <DrawerHeader className="border-b flex flex-row justify-between items-center px-6">
                    <DrawerTitle className="flex items-center gap-2">
                        <ShoppingCart size={20} className="text-blue-600" />
                        {purchase?.id ? `Editar Compra #${purchase.id}` : "Nova Compra"}
                    </DrawerTitle>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase font-bold">Total Geral</p>
                        <p className="text-xl font-black text-blue-700">R$ {totalGeral.toFixed(2)}</p>
                    </div>
                </DrawerHeader>

                <div className="p-6 overflow-y-auto">
                    <Form {...form}>
                        <form id="purchase-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="w-full md:w-48">
                                        <FormLabel>Data</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">Itens</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ productId: undefined as any, quantity: 1, price: 0 })}
                                    >
                                        <Plus size={16} className="mr-1" /> Adicionar
                                    </Button>
                                </div>

                                {fields.map((field, index) => {
                                    const subtotal = (watchedItems[index]?.quantity || 0) * (watchedItems[index]?.price || 0);

                                    return (
                                        <div key={field.id} className="flex flex-col md:flex-row gap-3 items-end p-3 rounded-lg border">
                                            <div className="flex-1 w-full">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.productId`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Produto</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                                                <FormControl>
                                                                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {products?.map((p: any) => (
                                                                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="w-full md:w-24">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Qtd</FormLabel>
                                                            <FormControl><Input type="number" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="w-full md:w-32">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.price`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Preço Unit.</FormLabel>
                                                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="w-full md:w-32 flex flex-col gap-1.5">
                                                <span className="text-xs font-medium text-muted-foreground">Subtotal</span>
                                                <div className="h-10 flex items-center px-3 rounded-md border font-semibold text-slate-700">
                                                    R$ {subtotal.toFixed(2)}
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:bg-red-50 mb-0.5"
                                                onClick={() => remove(index)}
                                                disabled={fields.length === 1}
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </form>
                    </Form>
                </div>

                <DrawerFooter className="border-t p-4 flex flex-row justify-end gap-3">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DrawerClose>
                    <Button
                        form="purchase-form"
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-35"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? "Gravando..." : purchase?.id ? "Atualizar Compra" : "Finalizar Compra"}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}