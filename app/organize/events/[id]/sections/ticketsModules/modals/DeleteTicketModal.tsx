import React, { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { Ticket } from "@/app/types/ticketType";
import { AlertTriangle, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

interface DeleteTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket;
}

const DeleteTicketModal: React.FC<DeleteTicketModalProps> = ({ isOpen, onClose, ticket }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const handleDelete = async () => {
        setIsDeleting(true);

        // Toast de loading
        const loadingToast = toast.loading('Eliminando ticket...', {
            position: 'top-right',
        });

        try {
            await deleteDoc(doc(db, "tickets", ticket.id));

            // Toast de éxito
            toast.success(
                `Ticket #${ticket.id.slice(0, 8)} eliminado exitosamente.`,
                {
                    position: 'top-right',
                    duration: 3000,
                    style: {
                        background: '#10B981',
                        color: 'white',
                        fontWeight: '500',
                    },
                    iconTheme: {
                        primary: 'white',
                        secondary: '#10B981',
                    },
                }
            );

            // Cerrar el loading toast
            toast.dismiss(loadingToast);
            
            onClose();
        } catch (error) {
            console.error("Error deleting ticket:", error);
            
            // Toast de error
            toast.error(
                "Error al eliminar el ticket. Por favor, intenta de nuevo.",
                {
                    position: 'top-right',
                    duration: 4000,
                    style: {
                        background: '#EF4444',
                        color: 'white',
                        fontWeight: '500',
                    },
                    iconTheme: {
                        primary: 'white',
                        secondary: '#EF4444',
                    },
                }
            );

            // Cerrar el loading toast
            toast.dismiss(loadingToast);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

                {/* Header con ícono de advertencia */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white text-center">
                    <div className="flex justify-center mb-3">
                        <div className="p-3 bg-white bg-opacity-20 rounded-full">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold">Eliminar Ticket</h2>
                    <p className="text-red-100 mt-1">Esta acción no se puede deshacer</p>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-4">
                    {/* Información del ticket */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600">Ticket a eliminar:</p>
                            <div className="space-y-1">
                                <p className="font-mono text-lg font-bold text-gray-800">#{ticket.id.slice(0, 8)}</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        ticket.status === 'Pagado' ? 'bg-green-100 text-green-700' :
                                        ticket.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {ticket.status}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                        {ticket.inscriptionType}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Total: <span className="font-semibold">S/ {ticket.totalAmount.toFixed(2)}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mensaje de advertencia */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-semibold text-red-800 mb-1">¿Estás seguro?</p>
                                <p className="text-red-700">
                                    Esta acción eliminará permanentemente el ticket y toda su información asociada.
                                    No podrás recuperar estos datos una vez eliminados.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Eliminando...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteTicketModal;