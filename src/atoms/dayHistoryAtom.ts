import {
  getLastSevenDaysHistory,
  DailyBalance,
} from "@/services/balanceService";
import { atom } from "jotai";
import { getSession } from "next-auth/react";

export const dayHistoryAtom = atom(async (get) => {
  const session = await getSession();
  const companyId = session?.user?.companyId;

  if (!companyId) return [];

  try {
    const history: DailyBalance[] = await getLastSevenDaysHistory(
      Number(companyId),
    );

    return history.flatMap((item) => {
      // Formata a data de 2026-02-21 para 21/02
      const [year, month, day] = item.date.split("-");
      const dateFormatted = `${day}/${month}`;

      return [
        {
          date: dateFormatted,
          category: "Receita",
          value: item.receita,
        },
        {
          date: dateFormatted,
          category: "Despesa",
          value: item.despesa,
        },
      ];
    });
  } catch (error) {
    console.error("Erro no histórico:", error);
    return [];
  }
});
