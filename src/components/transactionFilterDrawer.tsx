"use client";

import { useForm } from "react-hook-form";
import { useAtom } from "jotai";
import { categoriesByCompanyAtom } from "@/atoms/categoryAtom";
import { usersByCompanyAtom } from "@/atoms/userAtom";
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
} from "@/components/ui/form";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, FilterX } from "lucide-react";

export interface TransactionFilters {
    type?: string;
    status?: string;
    userId?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    startDueDate?: string;
    endDueDate?: string;
    minValue?: string;
    maxValue?: string;
}

interface FilterDrawerProps {
    open: boolean;
    onClose: () => void;
    onFilter: (filters: TransactionFilters) => void; // Tipagem aqui também
}

export default function TransactionFilterDrawer({ open, onClose, onFilter }: FilterDrawerProps) {
    const [categories] = useAtom(categoriesByCompanyAtom);
    const [users] = useAtom(usersByCompanyAtom);


    const form = useForm<TransactionFilters>({
        defaultValues: {
            type: "",
            status: "",
            userId: "",
            categoryId: "",
            startDate: "",
            endDate: "",
            startDueDate: "",
            endDueDate: "",
            minValue: "",
            maxValue: "",
        },
    });

    // Limpa os filtros e volta para a regra "Ontem e Hoje" do Atom
    const handleClear = () => {
        form.reset();
        onFilter({}); // Envia objeto vazio para voltar ao padrão Ontem/Hoje
        onClose();
    };

    // const onSubmit = (data: TransactionFilters) => {
    const onSubmit = (data: TransactionFilters) => {
        // 1. Processamos os filtros limpos
        const cleanedFilters = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
        );

        // 4. Seguimos com a lógica original
        onFilter(cleanedFilters);
        onClose();
    };

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent className="max-w-md mx-auto h-[90vh]">
                <DrawerHeader className="border-b flex justify-between items-center">
                    <DrawerTitle className="flex items-center gap-2">
                        <FilterX size={18} /> Filtros Avançados
                    </DrawerTitle>
                    <DrawerClose asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <X size={20} />
                        </Button>
                    </DrawerClose>
                </DrawerHeader>

                <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
                    <Form {...form}>
                        <form id="filter-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">

                            {/* Linha: Tipo e Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger></FormControl>
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
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PENDING">Pendente</SelectItem>
                                                    <SelectItem value="PAID">Pago</SelectItem>
                                                    <SelectItem value="CANCELED">Cancelado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Linha: Responsável e Categoria */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="userId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Responsável</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {users?.map((u: any) => (
                                                        <SelectItem key={u.id} value={u.id.toString()}>
                                                            {u.firstName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Categoria</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {categories?.map((c: any) => (
                                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Seção: Datas de Emissão */}
                            <div className="space-y-2">
                                <FormLabel className="text-blue-600 font-semibold">Data de Emissão</FormLabel>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Input type="date" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Input type="date" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Seção: Valores */}
                            <div className="space-y-2">
                                <FormLabel className="text-blue-600 font-semibold">Faixa de Valor</FormLabel>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="minValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Input type="number" placeholder="Mínimo" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="maxValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Input type="number" placeholder="Máximo" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Seção: Vencimento */}
                            <div className="space-y-2">
                                <FormLabel className="text-blue-600 font-semibold">Vencimento</FormLabel>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDueDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Input type="date" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endDueDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Input type="date" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                        </form>
                    </Form>
                </ScrollArea>

                <DrawerFooter className="flex-row justify-end gap-3 border-t p-6">
                    <Button variant="outline" className="flex-1" onClick={handleClear}>
                        Limpar Filtros
                    </Button>
                    <Button
                        form="filter-form"
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                    // onClick={form.handleSubmit(onSubmit)}
                    >
                        {form.formState.isSubmitting ? "Processando..." : "Aplicar"}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}