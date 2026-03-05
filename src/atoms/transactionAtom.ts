import { atom } from "jotai";

export const transactionsAtom = atom<any[]>([]); // Armazenamento
export const transactionFiltersAtom = atom<any>({}); // Filtros ativos
export const refreshTransactionAtom = atom(0); // Gatilho de recarga
