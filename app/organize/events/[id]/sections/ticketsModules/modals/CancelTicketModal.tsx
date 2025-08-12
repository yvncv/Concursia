import React, { useState, useEffect } from "react";
import { doc, updateDoc, Timestamp, query, where, collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { Ticket } from "@/app/types/ticketType";
import { Participant } from "@/app/types/participantType";
import { AlertTriangle, Ban, X, Users, CreditCard, FileText, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface CancelTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket;
    onSuccess?: () => void;
}

const CancelTicketModal: React.FC<CancelTicketModalProps> = ({ 
    isOpen, 
    onClose, 
    ticket, 
    onSuccess 
}) => {
    const [isCancelling, setIsCancelling] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [reason, setReason] = useState('');
    const [confirmAction, setConfirmAction] = useState(false);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    const predefinedReasons = [
        'Cancelación por parte del cliente',
        'Error en el registro',
        'Problema de pago',
        'Evento cancelado',
        'Solicitud de reembolso',
        'Otro'
    ];

    // Cargar participantes relacionados al ticket
    useEffect(() => {
        if (isOpen && ticket.status === 'Pagado') {
            loadParticipants();
        }
    }, [isOpen, ticket]);

    const loadParticipants = async () => {
        setLoadingParticipants(true);
        try {
            const participantsQuery = query(
                collection(db, 'participants'),
                where('ticketId', '==', ticket.id)
            );
            const participantsSnapshot = await getDocs(participantsQuery);
            const participantsData = participantsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Participant[];
            
            setParticipants(participantsData);
        } catch (error) {
            console.error('Error loading participants:', error);
        } finally {
            setLoadingParticipants(false);
        }
    };

    const handleCancel = async () => {
        if (!reason.trim() || !confirmAction) return;
        
        setIsCancelling(true);

        const loadingToast = toast.loading('Anulando ticket y participantes...', {
            position: 'top-right',
        });

        try {
            const batch = writeBatch(db);
            const now = Timestamp.now();

            // 1. Anular el ticket principal
            const ticketRef = doc(db, "tickets", ticket.id);
            batch.update(ticketRef, {
                status: 'Anulado',
                cancelledDate: now,
                cancellationReason: reason,
                cancelledBy: 'admin' // TODO: Obtener del contexto de usuario
            });

            // 2. Anular todas las entries del ticket
            const updatedEntries = ticket.entries.map(entry => ({
                ...entry,
                status: 'Anulado',
                cancelledDate: now,
                cancellationReason: reason,
                cancelledBy: 'admin'
            }));

            batch.update(ticketRef, {
                entries: updatedEntries
            });

            // 3. Anular todos los participantes relacionados (si existen)
            if (participants.length > 0) {
                participants.forEach(participant => {
                    const participantRef = doc(db, "participants", participant.id);
                    batch.update(participantRef, {
                        status: 'Anulado',
                        cancelledDate: now,
                        cancellationReason: `Ticket ${ticket.id.slice(0, 8)} anulado: ${reason}`,
                        cancelledBy: 'admin'
                    });
                });
            }

            // 4. TODO: Aquí podrías agregar lógica adicional como:
            // - Liberar cupos en el evento
            // - Crear nota de crédito
            // - Notificar al sistema de pagos
            
            // Ejecutar todas las operaciones en batch
            await batch.commit();

            toast.dismiss(loadingToast);

            // Toast de éxito con detalles
            const participantCount = participants.length;
            const entryCount = ticket.entries.length;
            
            toast.success(
                `Ticket #${ticket.id.slice(0, 8)} anulado exitosamente.
                ${entryCount} inscripción(es) y ${participantCount} participante(s) anulados.`,
                {
                    position: 'top-right',
                    duration: 5000,
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
            
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error cancelling ticket:", error);
            
            toast.dismiss(loadingToast);
            
            toast.error(
                "Error al anular el ticket. Por favor, intenta de nuevo.",
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
        } finally {
            setIsCancelling(false);
        }
    };

    const handleClose = () => {
        if (!isCancelling) {
            setReason('');
            setConfirmAction(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    const isPaidTicket = ticket.status === 'Pagado';
    const totalParticipants = ticket.entries.reduce((total, entry) => total + entry.usersId.length, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">

                {/* Header con ícono de advertencia */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white text-center">
                    <div className="flex justify-center mb-3">
                        <div className="p-3 bg-white bg-opacity-20 rounded-full">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold">Anular Ticket Completo</h2>
                    <p className="text-red-100 mt-1">
                        {isPaidTicket ? 'Anulación de ticket pagado con participantes' : 'El ticket pasará a estado "Anulado"'}
                    </p>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-6">
                    {/* Información del ticket */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="text-center space-y-3">
                            <p className="text-sm text-gray-600">Ticket a anular:</p>
                            <div className="space-y-2">
                                <p className="font-mono text-lg font-bold text-gray-800">#{ticket.id.slice(0, 8)}</p>
                                <div className="flex items-center justify-center gap-2 flex-wrap">
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
                                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                                    <div className="flex items-center justify-center gap-1">
                                        <Users className="w-4 h-4 text-gray-500" />
                                        <span>{totalParticipants} participante(s)</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1">
                                        <CreditCard className="w-4 h-4 text-gray-500" />
                                        <span className="font-semibold">S/ {ticket.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Impacto de la anulación */}
                    {isPaidTicket && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-red-800 mb-2">Impacto de la anulación:</p>
                                    <ul className="space-y-1 text-red-700">
                                        <li>• Se anuları́n {ticket.entries.length} inscripción(es)</li>
                                        {loadingParticipants ? (
                                            <li>• Cargando participantes...</li>
                                        ) : (
                                            <li>• Se anuları́n {participants.length} participante(s) confirmado(s)</li>
                                        )}
                                        <li>• Se liberará cupo en el evento</li>
                                        <li>• Se requerirá gestión de reembolso</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Participantes afectados */}
                    {isPaidTicket && participants.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Participantes que serán anulados:
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600 max-h-24 overflow-y-auto">
                                {participants.map((participant, index) => (
                                    <div key={participant.id} className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                                            {index + 1}
                                        </span>
                                        <span>{participant.code || 'Sin código'} - {participant.category}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Motivo de anulación */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Motivo de la anulación *
                        </label>
                        <div className="space-y-2">
                            {predefinedReasons.map((predefinedReason, index) => (
                                <label key={index} className="flex items-start space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={predefinedReason}
                                        checked={reason === predefinedReason}
                                        onChange={(e) => setReason(e.target.value)}
                                        disabled={isCancelling}
                                        className="mt-1 w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 disabled:opacity-50"
                                    />
                                    <span className="text-sm text-gray-700">{predefinedReason}</span>
                                </label>
                            ))}
                        </div>
                        
                        {reason === 'Otro' && (
                            <div className="mt-3">
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Describe el motivo de la anulación..."
                                    disabled={isCancelling}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none disabled:opacity-50"
                                    rows={3}
                                    maxLength={200}
                                />
                                <p className="text-xs text-gray-500 mt-1">{reason.length}/200 caracteres</p>
                            </div>
                        )}
                    </div>

                    {/* Confirmación */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={confirmAction}
                                onChange={(e) => setConfirmAction(e.target.checked)}
                                disabled={isCancelling}
                                className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50"
                            />
                            <span className="text-sm text-gray-700">
                                Confirmo que entiendo que esta acción anulará permanentemente el ticket completo, 
                                {isPaidTicket && ' incluyendo todos los participantes confirmados,'} y que se 
                                requerirá gestión manual para reembolsos si aplica.
                            </span>
                        </label>
                    </div>

                    {/* Información de próximos pasos */}
                    {isPaidTicket && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-blue-800 mb-1">Próximos pasos:</p>
                                    <ul className="space-y-1 text-blue-700">
                                        <li>1. Contactar al cliente para informar la anulación</li>
                                        <li>2. Procesar reembolso según políticas de la empresa</li>
                                        <li>3. Verificar liberación de cupos en el evento</li>
                                        <li>4. Documentar el caso para auditoría</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Botones de acción */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            disabled={isCancelling}
                            className="flex-1 px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-gray-300"
                        >
                            <X className="w-4 h-4" />
                            Cancelar
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isCancelling || !reason.trim() || !confirmAction}
                            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                !reason.trim() || !confirmAction
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                            }`}
                        >
                            {isCancelling ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Anulando...
                                </>
                            ) : (
                                <>
                                    <Ban className="w-4 h-4" />
                                    Anular Ticket Completo
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancelTicketModal;