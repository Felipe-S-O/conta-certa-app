"use client";

import { useEffect, useMemo } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";

import { categoriesByCompanyAtom } from "@/atoms/categoryAtom";
import { createTransaction, updateTransaction } from "@/services/transactionService";
import { refreshTransactionAtom } from "@/atoms/transactionAtom";

const transactionSchema = z.object({
    id: z.number().optional(),
    type: z.enum(["VARIABLE_INCOME", "FIXED_INCOME", "VARIABLE_EXPENSE", "FIXED_EXPENSE"]),
    status: z.enum(["PENDING", "PAID", "CANCELED"]),
    amount: z.coerce.number().positive("O valor deve ser positivo"),
    date: z.string().min(1, "A data é obrigatória"),
    dueDate: z.string().optional(),
    description: z.string().optional(),
    categoryId: z.coerce.number({ message: "A categoria é obrigatória" }).min(1, "A categoria é obrigatória"),
    fee: z.coerce.number().default(0),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function TransactionDrawer({ transaction, open, onClose }: any) {
    const { data: session } = useSession();
    const [categories] = useAtom(categoriesByCompanyAtom);
    const [, setRefresh] = useAtom(refreshTransactionAtom);

    const form = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: {
            type: "VARIABLE_EXPENSE",
            status: "PAID",
            amount: 0,
            date: new Date().toISOString().split("T")[0],
            fee: 0,
        },
    });

    const selectedType = form.watch("type");

    // Filtro de categorias baseado no tipo (Income vs Expense)
    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        const isExpense = selectedType?.includes("EXPENSE");
        return categories.filter((c: any) => isExpense ? c.type === "EXPENSE" : c.type === "INCOME");
    }, [categories, selectedType]);

    useEffect(() => {
        if (open) {
            if (transaction) {
                form.reset({
                    ...transaction,
                    date: transaction.date?.split("T")[0],
                    dueDate: transaction.dueDate?.split("T")[0],
                });
            } else {
                form.reset({
                    type: "VARIABLE_EXPENSE",
                    status: "PENDING",
                    amount: 0,
                    date: new Date().toISOString().split("T")[0],
                    fee: 0,
                    description: "",
                });
            }
        }
    }, [transaction, open, form]);

    const onSubmit = async (data: TransactionFormData) => {
        try {
            const payload = {
                ...data,
                companyId: Number(session?.user?.companyId),
                createdBy: Number(session?.user?.id || 0),
            };

            if (data.id) {
                await updateTransaction(data.id, payload);
                toast.success("Atualizado com sucesso!");
            } else {
                await createTransaction(payload);
                toast.success("Lançamento realizado!");
            }

            setRefresh((r: number) => r + 1);
            onClose();
        } catch (error) {
            toast.error("Erro ao salvar lançamento");
        }
    };

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent className="max-w-2xl mx-auto">
                <DrawerHeader className="border-b">
                    <DrawerTitle className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${selectedType?.includes('EXPENSE') ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        {transaction?.id ? "Editar Lançamento" : "Novo Lançamento"}
                    </DrawerTitle>
                </DrawerHeader>

                <ScrollArea className="max-h-[85vh] p-6">
                    <Form {...form}>
                        <form id="trans-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-6">

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Movimentação</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="VARIABLE_INCOME">Receita Variável</SelectItem>
                                                    <SelectItem value="FIXED_INCOME">Receita Fixa</SelectItem>
                                                    <SelectItem value="VARIABLE_EXPENSE">Despesa Variável</SelectItem>
                                                    <SelectItem value="FIXED_EXPENSE">Despesa Fixa</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status do Pagamento</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PENDING">Pendente</SelectItem>
                                                    <SelectItem value="PAID">Pago / Recebido</SelectItem>
                                                    <SelectItem value="CANCELED">Cancelado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Categoria ({selectedType?.includes('EXPENSE') ? 'Despesa' : 'Receita'})</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {filteredCategories.map((c: any) => (
                                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Valor Principal (R$)</FormLabel>
                                            <FormControl><Input type="number" step="0.01" {...field} className="font-bold text-lg" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fee"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Taxas / Juros (R$)</FormLabel>
                                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Data de Emissão</FormLabel>
                                            <FormControl><Input type="date" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Data de Vencimento</FormLabel>
                                            <FormControl><Input type="date" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl><Input placeholder="Ex: Referente a consultoria X" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </ScrollArea>

                <DrawerFooter className="flex-row justify-end gap-3 border-t p-4 bg-slate-50">
                    <DrawerClose asChild>
                        <Button variant="ghost">Cancelar</Button>
                    </DrawerClose>
                    <Button
                        form="trans-form"
                        type="submit"
                        className={`w-full sm:w-auto ${selectedType?.includes("EXPENSE") ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                    >
                        {transaction?.id ? "Salvar Alterações" : "Confirmar Lançamento"}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}