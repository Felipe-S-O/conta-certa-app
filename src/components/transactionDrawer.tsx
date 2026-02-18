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
    FormDescription,
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
import { usersByCompanyAtom } from "@/atoms/userAtom";
import { createTransaction, updateTransaction } from "@/services/transactionService";
import { refreshTransactionAtom } from "@/atoms/transactionAtom";
import { Checkbox } from "./ui/checkbox";

const transactionSchema = z.object({
    id: z.number().optional(),
    type: z.enum(["VARIABLE_INCOME", "FIXED_INCOME", "VARIABLE_EXPENSE", "FIXED_EXPENSE"]),
    status: z.enum(["PENDING", "COMPLETED"]),
    amount: z.coerce.number().positive("O valor deve ser positivo"),
    date: z.string().min(1, "A data é obrigatória"),
    dueDate: z.string().optional(),
    description: z.string().min(1, "A descrição é obrigatória"),
    categoryId: z.coerce.number().min(1, "A categoria é obrigatória"),
    userId: z.coerce.number().positive("O valor deve ser positivo"),
    fee: z.coerce.number().default(0),
    // --- NOVOS CAMPOS ---
    totalInstallments: z.coerce.number().min(1).max(120).optional().default(1),
    isFixed: z.boolean().default(false),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function TransactionDrawer({ transaction, open, onClose }: any) {
    const { data: session } = useSession();
    const [categories] = useAtom(categoriesByCompanyAtom);
    const [users] = useAtom(usersByCompanyAtom);
    const [, setRefresh] = useAtom(refreshTransactionAtom);

    const form = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: {
            type: "VARIABLE_EXPENSE",
            status: "COMPLETED",
            amount: 0,
            date: new Date().toISOString().split("T")[0],
            dueDate: new Date().toISOString().split("T")[0],
            description: "", // Obrigatório no schema, deve estar aqui
            categoryId: undefined, // Ou 0, se o back aceitar
            userId: undefined,
            fee: 0,
            totalInstallments: 1,
            isFixed: false,
        },
    });

    const selectedType = form.watch("type");
    const isFixedChecked = form.watch("isFixed");

    // Lógica para mostrar parcelas: apenas se não for fixo e for variável
    const showInstallments = !isFixedChecked && selectedType?.includes("VARIABLE");

    const filteredCategories = useMemo(() => {
        if (!categories || !Array.isArray(categories)) return [];
        const isExpense = selectedType?.includes("EXPENSE");
        return categories.filter((c: any) =>
            isExpense ? c.type === "EXPENSE" : c.type === "INCOME"
        );
    }, [categories, selectedType]);

    useEffect(() => {
        if (open) {
            if (transaction) {
                form.reset({
                    ...transaction,
                    date: transaction.date?.split("T")[0],
                    dueDate: transaction.dueDate?.split("T")[0],
                    totalInstallments: transaction.totalInstallments || 1,
                    isFixed: transaction.isFixed || false,
                });
            } else {
                form.reset({
                    type: "VARIABLE_EXPENSE",
                    status: "PENDING",
                    amount: 0,
                    date: new Date().toISOString().split("T")[0],
                    fee: 0,
                    description: "",
                    totalInstallments: 1,
                    isFixed: false,
                });
            }
        }
    }, [transaction, open, form, session]);

    const onSubmit = async (data: TransactionFormData) => {
        try {
            const payload = {
                ...data,
                companyId: Number(session?.user?.companyId),
                createdBy: Number(session?.user?.id || 0),
                // Se for fixo, ignoramos parcelas no envio para o back
                totalInstallments: data.isFixed ? 1 : data.totalInstallments,
            };

            if (data.id) {
                await updateTransaction(payload);
                toast.success("Atualizado com sucesso!");
            } else {
                await createTransaction(payload);
                toast.success(data.totalInstallments! > 1 ? `Geradas ${data.totalInstallments} parcelas!` : "Lançamento realizado!");
            }

            setRefresh((r: number) => r + 1);
            onClose();
        } catch (error) {
            toast.error("Erro ao salvar lançamento");
        }
    };

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent className="max-w-2xl mx-auto h-[95vh] flex flex-col">
                <DrawerHeader className="relative border-b flex-none">
                    <DrawerTitle className="text-xl font-bold justify-center items-center flex">
                        <div className={`w-3 h-3 rounded-full mr-1 ${selectedType?.includes('EXPENSE') ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        {transaction?.id ? "Editar Lançamento" : "Novo Lançamento"}
                    </DrawerTitle>
                    <DrawerClose asChild>
                        <Button variant="ghost" className="absolute right-4 top-4 h-8 w-8 p-0">✕</Button>
                    </DrawerClose>
                </DrawerHeader>

                <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
                    <Form {...form}>
                        <form id="trans-form" onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-5 pb-6">

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Categoria</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
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

                                <FormField
                                    control={form.control}
                                    name="userId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Responsável</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {users?.map((u: any) => (
                                                        <SelectItem key={u.id} value={u.id.toString()}>{u.firstName} {u.lastName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* RECORRÊNCIA E PARCELAS */}
                            <div className="p-4 rounded-lg border space-y-4">
                                <FormField
                                    control={form.control}
                                    name="isFixed"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Lançamento Fixo / Recorrente</FormLabel>
                                                <FormDescription>Marque para contas que se repetem todo mês (ex: Aluguel).</FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {showInstallments && !transaction?.id && (
                                    <FormField
                                        control={form.control}
                                        name="totalInstallments"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Número de Parcelas</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="1" {...field} placeholder="Ex: 12" />
                                                </FormControl>
                                                <FormDescription>O sistema criará automaticamente os lançamentos mensais.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

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
                                {!isFixedChecked && <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PENDING">Pendente</SelectItem>
                                                    <SelectItem value="COMPLETED">Pago / Recebido</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />}
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </ScrollArea>

                <DrawerFooter className="flex-row justify-end gap-3 border-t p-6">
                    <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
                    <Button
                        form="trans-form"
                        type="submit"
                        className={`text-white ${selectedType?.includes("EXPENSE") ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                    >
                        {form.formState.isSubmitting ? "Processando..." : transaction?.id ? "Salvar Alterações" : "Confirmar Lançamento"}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}