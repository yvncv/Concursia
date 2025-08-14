// app/admin/vistaUsuario.tsx
import React from "react";
import {User} from "@/app/types/userType";
import { decryptDni } from "@/app/utils/security/dni/decryptDni";


interface VistaUsuarioProps {
    user: User | null;
    onClose: () => void;
}

export default function VistaUsuario({ user, onClose }: VistaUsuarioProps) {
    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg min-w-[300px]">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Datos del Usuario</h3>
                {user.profileImage && (
                    <div className="mb-4 flex justify-center">
                        <img
                            src={
                                typeof user.profileImage === "string"
                                    ? user.profileImage
                                    : user.profileImage
                                        ? URL.createObjectURL(user.profileImage)
                                        : ""
                            }
                            alt="Foto de perfil"
                            className="w-40 h-32 object-contain rounded-xl border border-gray-300 dark:border-slate-700"
                        />
                    </div>
                )}
                <p className="px-4 py-2 text-gray-900 dark:text-gray-100" ><strong>Nombre:</strong> {user.firstName} {user.lastName}</p>
                <p className="px-4 py-2 text-gray-900 dark:text-gray-100"><strong>Correo:</strong> {Array.isArray(user.email) ? user.email[0] : user.email}</p>
                <p className="px-4 py-2 text-gray-900 dark:text-gray-100">
                    <strong>DNI:</strong>{" "}
                    {user.dni ? decryptDni(user.dni) ?? user.dni : "-"}
                </p>
                <p className="px-4 py-2 text-gray-900 dark:text-gray-100"><strong>Rol:</strong> {user.roleId ?? "-"}</p>
                <p className="px-4 py-2 text-gray-900 dark:text-gray-100"><strong>Género:</strong> {user.gender ?? "-"}</p>
                <p className="px-4 py-2 text-gray-900 dark:text-gray-100"><strong>Fecha Nacimiento:</strong> {user.birthDate.toDate().toLocaleDateString() ?? "-"}</p>
                <p className="px-4 py-2 text-gray-900 dark:text-gray-100"><strong>Fecha Creación:</strong> {user.createdAt.toDate().toLocaleDateString() ?? "-"}</p>
                <p className="px-4 py-2 text-gray-900 dark:text-gray-100"><strong>Academia:</strong> {user.marinera.academyName ?? "-"}</p>
                <p className="px-4 py-2 text-gray-900 dark:text-gray-100"><strong>Categoria:</strong> {user.marinera.participant.category ?? "-"}</p>
                <p className="px-4 py-2 text-gray-900 dark:text-gray-100"><strong>Número:</strong> {user.phoneNumber ?? "-"}</p>
                <button
                    className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    onClick={onClose}
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}