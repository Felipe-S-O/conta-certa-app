"use client";

import { Activity } from "lucide-react"; // Importando o Activity
import HistoryChart from "./historyChart";

const HistorySevenDays = () => {
    return (
        <section className="flex h-full flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between">
                {/* Ícone adicionado antes do título com alinhamento flex */}
                <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <h1 className="text-lg font-semibold">Fluxo dos Últimos 7 Dias</h1>
                </div>
            </div>

            <div className="relative w-full h-85 mt-2">
                <HistoryChart />
            </div>

        </section>
    );
};

export default HistorySevenDays;