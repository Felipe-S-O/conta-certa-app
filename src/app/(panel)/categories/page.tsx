"use client";
import { useAtom } from "jotai";
import TopNav from "@/components/nav/top-nav";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { categoriesByCompanyAtom } from "@/atoms/categoryAtom";
import Loading from "@/components/loading";
import { Edit, Trash2 } from "lucide-react";

const CategoriesPage = () => {
    const { data: session } = useSession();
    const [categories] = useAtom(categoriesByCompanyAtom);

    const [showLoading, setShowLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setShowLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const canManage = session?.role === "ADMIN" || session?.role === "MANAGER";

    return (
        <div className="p-10 font-sans">
            <TopNav title="Lista de Categorias" />

            <main className="mt-8">
                <div>

                    {showLoading ? (
                        <Loading />
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {categories?.map((c) => (
                                <li
                                    key={c.id}
                                    className="p-2 border rounded flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-bold">{c.name}</p>
                                        <p className="text-sm text-slate-600">Tipo: {c.type}</p>
                                        <p className="text-xs text-slate-500">
                                            Ênfase: {c.emphasis ? "Sim" : "Não"}
                                        </p>
                                    </div>

                                    {canManage && (
                                        <div className="flex gap-4">
                                            <button
                                                aria-label="Editar categoria"
                                                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                onClick={() => console.log("Editar categoria", c.id)}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                aria-label="Excluir categoria"
                                                className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                                onClick={() => console.log("Excluir categoria", c.id)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CategoriesPage;