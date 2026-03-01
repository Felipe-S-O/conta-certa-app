"use client";

import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CirclePercent } from "lucide-react";
import CategoryChart from "./categoryChart";



const SummaryCategory = () => {
    const [filter, setFilter] = useState<"EXPENSE" | "INCOME">("EXPENSE");

    return (
        <section className="flex flex-col h-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CirclePercent className="h-5 w-5 text-primary" />
                    <h1 className="text-lg font-semibold whitespace-nowrap">
                        Destaque de
                    </h1>

                    <Select
                        value={filter}
                        onValueChange={(value: "EXPENSE" | "INCOME") => setFilter(value)}
                    >
                        <SelectTrigger className="w-32.5 h-8 border-none bg-secondary/60 font-bold text-primary focus:ring-0">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="EXPENSE">Despesas</SelectItem>
                            <SelectItem value="INCOME">Receitas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="relative w-full h-85 mt-2">
                <CategoryChart filter={filter} />
            </div>
        </section>
    );
};

export default SummaryCategory;