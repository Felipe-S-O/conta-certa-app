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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ShoppingCart } from "lucide-react";
import { refreshPurchaseAtom } from "@/atoms/purchaseAtom";
import { createPurchases, updatePurchases } from "@/services/purchaseService";

// Supondo que você criará esses serviços e atoms


const purchaseSchema = z.object({
    id: z.number().optional(),
    total: z.coerce.number().positive("O valor deve ser positivo"),
    date: z.string().min(1, "A data é obrigatória"),
});

export default function PurchaseDrawer({ purchase, open, onClose }: any) {
    const { data: session } = useSession();
    const [, setRefresh] = useAtom(refreshPurchaseAtom);

    const form = useForm<z.infer<typeof purchaseSchema>>({
        resolver: zodResolver(purchaseSchema) as any,
        defaultValues: {
            total: 0,
            date: new Date().toISOString().split("T")[0],
        },
    });

    useEffect(() => {
        if (open) {
            if (purchase) {
                form.reset({
                    ...purchase,
                    date: purchase.date?.split("T")[0],
                });
            } else {
                form.reset({ total: 0, date: new Date().toISOString().split("T")[0] });
            }
        }
    }, [purchase, open, form]);

    const onSubmit = async (data: z.infer<typeof purchaseSchema>) => {
        try {
            const payload = {
                ...data,
                companyId: Number(session?.user?.companyId),
                userId: Number(session?.user?.id),
                createdBy: Number(session?.user?.id),
            };

            if (data.id) {
                await updatePurchases(data.id, payload);
                toast.success("Compra atualizada!");
            } else {
                await createPurchases(payload);
                toast.success("Compra registrada!");
            }

            setRefresh((r: number) => r + 1);
            onClose();
        } catch (error) {
            toast.error("Erro ao processar compra");
        }
    };

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent className="max-w-md mx-auto">
                <DrawerHeader className="border-b">
                    <DrawerTitle className="flex items-center gap-2">
                        <ShoppingCart size={20} className="text-blue-600" />
                        {purchase?.id ? "Editar Compra" : "Nova Compra"}
                    </DrawerTitle>
                </DrawerHeader>

                <div className="p-6">
                    <Form {...form}>
                        <form id="purchase-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="total"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Total da Compra (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} className="text-lg font-bold" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data da Compra</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>

                <DrawerFooter className="border-t p-4 flex-row justify-end gap-3">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DrawerClose>
                    <Button form="purchase-form" type="submit" className="bg-blue-600">
                        Salvar Compra
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}