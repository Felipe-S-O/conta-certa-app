"use client";
import { useAtom } from "jotai";
import TopNav from "@/components/nav/top-nav";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usersByCompanyAtom } from "@/atoms/userAtom";
import Loading from "@/components/loading";
import { Edit, Trash2 } from "lucide-react";

const UsersPage = () => {
    const { data: session } = useSession();
    const [users] = useAtom(usersByCompanyAtom);

    const [showLoading, setShowLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setShowLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="p-10 font-sans">
            <TopNav title="Lista de Usuários" />

            <main className="mt-8">
                <div >

                    {showLoading ? (
                        <Loading />
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {users?.map((u) => (
                                <li
                                    key={u.id}
                                    className="p-2 border rounded flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-bold">
                                            {u.firstName} {u.lastName}
                                        </p>
                                        <p className="text-sm text-slate-600">{u.email}</p>
                                        <p className="text-xs text-slate-500">Role: {u.role}</p>
                                    </div>

                                    {session?.role === "ADMIN" && (
                                        <div className="flex gap-4">
                                            <button
                                                aria-label="Editar usuário"
                                                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                onClick={() => console.log("Editar usuário", u.id)}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                aria-label="Excluir usuário"
                                                className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                                onClick={() => console.log("Excluir usuário", u.id)}
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

export default UsersPage;