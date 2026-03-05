import { atom } from "jotai";

// Átomo simples para armazenar a lista
export const usersAtom = atom<any[]>([]);

// Mantemos o refresh apenas se você ainda precisar disparar
// re-execuções de useEffects em outros lugares
export const refreshUsersAtom = atom(0);
