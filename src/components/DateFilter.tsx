"use client";

import * as React from "react";
import { useAtom } from "jotai";
import { format, parseISO, differenceInDays, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { balanceFiltersAtom } from "@/atoms/balanceAtom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function DateFilter() {
    const [filters, setFilters] = useAtom(balanceFiltersAtom);

    const dateRange: DateRange | undefined = {
        from: filters.startDate ? parseISO(filters.startDate) : undefined,
        to: filters.endDate ? parseISO(filters.endDate) : undefined,
    };

    const handleSelect = (range: DateRange | undefined) => {
        // Regra: Limite de 3 meses (aprox. 90 dias)
        if (range?.from && range?.to) {
            const daysDiff = differenceInDays(range.to, range.from);
            if (daysDiff > 90) {
                alert("O período máximo permitido é de 3 meses.");
                return; // Bloqueia a seleção se for maior que 90 dias
            }
        }

        setFilters((prev) => ({
            ...prev,
            startDate: range?.from ? format(range.from, "yyyy-MM-dd") : "",
            endDate: range?.to ? format(range.to, "yyyy-MM-dd") : "",
        }));
    };

    return (
        <div className="flex items-center gap-3">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-70 justify-start text-left font-normal bg-card h-12 border-border",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                                Período (Máx 3 meses)
                            </span>
                            <span className="text-sm font-medium">
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "dd/MM/yy")
                                    )
                                ) : (
                                    <span>Selecione o período</span>
                                )}
                            </span>
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from || new Date()}
                        selected={dateRange}
                        onSelect={handleSelect}
                        numberOfMonths={2}
                        locale={ptBR}
                        // TRAVA 1: Não permite selecionar datas futuras (depois de hoje)
                        disabled={{ after: new Date() }}
                        // TRAVA 2: Visualmente ajuda a entender o limite de 3 meses (opcional)
                        fromDate={subMonths(new Date(), 12)} // Exemplo: permite navegar até 1 ano atrás
                        toDate={new Date()}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}