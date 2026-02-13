"use client";
import { useAtom } from "jotai";
import TopNav from "@/components/nav/top-nav";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { productsByCompanyAtom } from "@/atoms/productAtom";
import Loading from "@/components/loading";
import { Edit } from "lucide-react";

const ProductsPage = () => {
    const { data: session } = useSession();
    const [products] = useAtom(productsByCompanyAtom);

    const [showLoading, setShowLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setShowLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const canManage = session?.user.role === "ADMIN" || session?.user.role === "MANAGER";

    return (
        <div className="p-10 font-sans">
            <TopNav title="Produtos" />

            <main className="mt-8">
                <div className="mt-8">
                    <h3 className="text-lg font-semibold">Lista de Produtos</h3>

                    {showLoading ? (
                        <Loading />
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {products?.map((p) => (
                                <li
                                    key={p.id}
                                    className="p-2 border rounded flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-bold">{p.name}</p>
                                        <p className="text-sm text-slate-600">Código: {p.code}</p>
                                        <p className="text-xs text-slate-500">
                                            Criado em: {new Date(p.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    {canManage && (
                                        <div className="flex gap-2">
                                            <button
                                                aria-label="Editar produto"
                                                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                onClick={() => console.log("Editar produto", p.id)}
                                            >
                                                <Edit size={18} />
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

export default ProductsPage;