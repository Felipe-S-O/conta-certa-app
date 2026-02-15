"use client";

import { useAtom } from "jotai";
import { usersByCompanyAtom, refreshUsersAtom } from "@/atoms/userAtom";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import TopNav from "@/components/nav/top-nav";
import Loading from "@/components/loading";
import { Edit, Plus, Trash2, UserCircle, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import UserDrawer from "@/components/userDrawer";
import { deleteUser } from "@/services/userService";

const roleMap: Record<string, string> = {
    ADMIN: "Administrador",
    MANAGER: "Gerente",
    USER: "Operador",
};

const UsersPage = () => {
    const { data: session } = useSession();
    const [users] = useAtom(usersByCompanyAtom);
    const [, setRefresh] = useAtom(refreshUsersAtom);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showLoading, setShowLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const canManage = session?.user.role === "ADMIN";

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Remover Usuário?",
            text: "Este usuário perderá o acesso ao sistema imediatamente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Sim, remover",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await deleteUser(id);
                setRefresh((prev) => prev + 1);
                Swal.fire("Removido!", "O acesso foi revogado com sucesso.", "success");
            } catch (error) {
                Swal.fire("Erro!", "Não foi possível excluir o usuário.", "error");
            }
        }
    };

    return (
        <div className="p-10 font-sans">
            <TopNav title="Gestão de Usuários" />

            <main className="mt-8">
                {showLoading ? (
                    <Loading />
                ) : !users || users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-slate-500">
                        <UserCircle size={48} className="mb-4" />
                        <p>Nenhum usuário encontrado.</p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-3">
                        {users.map((u) => (
                            <li
                                key={u.id}
                                className="p-4 border rounded-xl shadow-sm flex justify-between items-center hover:border-blue-300 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-slate-100  dark:bg-slate-900 p-2.5 rounded-lg dark:group-hover:bg-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <UserCircle size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">
                                                {u.firstName} {u.lastName}
                                            </p>
                                            {u.id === session?.user.id && (
                                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                                    Você
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <p className="text-sm text-slate-500">{u.email}</p>
                                            <span className="text-slate-300">|</span>
                                            <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                                                <ShieldCheck size={12} />
                                                {roleMap[u.role] || u.role}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {canManage && (
                                    <div className="flex gap-1">
                                        <button
                                            aria-label="Editar"
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            onClick={() => {
                                                setSelectedUser(u);
                                                setDrawerOpen(true);
                                            }}
                                        >
                                            <Edit size={18} />
                                        </button>

                                        {u.id !== session?.user.id && (
                                            <button
                                                aria-label="Excluir"
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                onClick={() => handleDelete(u.id)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            {/* Floating Action Button */}
            {canManage && (
                <button
                    aria-label="Adicionar usuário"
                    className="fixed bottom-10 right-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95"
                    onClick={() => {
                        setSelectedUser(null);
                        setDrawerOpen(true);
                    }}
                >
                    <Plus size={28} />
                </button>
            )}

            <UserDrawer
                user={selectedUser}
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedUser(null);
                }}
            />
        </div>
    );
};

export default UsersPage;