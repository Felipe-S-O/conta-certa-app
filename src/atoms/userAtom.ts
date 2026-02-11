import { atom } from "jotai";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

export const userAtom = atom<User | null>(null);
