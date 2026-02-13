"use client";
import { useAtom } from "jotai";
import { usersByCompanyAtom } from "@/atoms/userAtom";
import { useSession } from "next-auth/react";
import { useState } from "react";
import TopNav from "@/components/nav/top-nav";
import Loading from "@/components/loading";
import { Edit, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import UserDrawer from "@/components/userDrawer";
import { deleteUser } from "@/services/userService";

const UsersPage = () => {
    const { data: session } = useSession();
    const [users] = useAtom(usersByCompanyAtom);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const canManage = session?.user.role === "ADMIN";

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Tem certeza?",
            text: "Essa ação não pode ser desfeita!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sim, excluir!",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await deleteUser(id);
                Swal.fire("Excluído!", "O usuário foi removido com sucesso.", "success");
            } catch (error) {
                Swal.fire("Erro!", "Não foi possível excluir o usuário.", "error");
            }
        }
    };

    return (
        <div className="p-10 font-sans">
            <TopNav title="Lista de Usuários" />

            <main className="mt-8">
                {!users ? (
                    <Loading />
                ) : (
                    <ul className="mt-3 space-y-2">
                        {users.map((u) => (
                            <li
                                key={u.id}
                                className="p-2 border rounded flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-bold">{u.firstName} {u.lastName}</p>
                                    <p className="text-sm text-slate-600">{u.email}</p>
                                    <p className="text-xs text-slate-500">Role: {u.role}</p>
                                </div>

                                {canManage && (
                                    <div className="flex gap-2">
                                        <button
                                            aria-label="Editar usuário"
                                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                            onClick={() => { setSelectedUser(u); setDrawerOpen(true); }}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            aria-label="Excluir usuário"
                                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                            onClick={() => handleDelete(u.id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            {canManage && (
                <button
                    aria-label="Adicionar usuário"
                    className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
                    onClick={() => { setSelectedUser(null); setDrawerOpen(true); }}
                >
                    <Plus size={24} />
                </button>
            )}

            <UserDrawer
                user={selectedUser}
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                }}
            />
        </div>
    );
};

export default UsersPage;