import { atom } from "jotai";
import { categoriesByCompany } from "@/services/categoryService";
import { companyIdAtom } from "./companyIdAtom";

export const refreshCategoriesAtom = atom(0);

export const categoriesByCompanyAtom = atom(async (get) => {
  // 1. Escuta o companyIdAtom (que é alimentado pelo PanelLayout)
  const companyId = get(companyIdAtom);

  // 2. Escuta o gatilho de reload
  get(refreshCategoriesAtom);

  // 3. Se o companyId ainda não estiver disponível, retorna vazio
  // Isso evita o erro de "Nenhum companyId encontrado" na Vercel
  if (!companyId) {
    return [];
  }

  // 4. Busca as categorias no backend do Cloud Run
  try {
    return await categoriesByCompany(companyId);
  } catch (error) {
    console.error("Erro ao buscar categorias por empresa:", error);
    return [];
  }
});
