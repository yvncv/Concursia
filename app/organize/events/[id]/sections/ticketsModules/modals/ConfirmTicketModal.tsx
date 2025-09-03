import React, { useEffect, useState } from "react";
import { Ticket, TicketData } from "@/app/types/ticketType";
import { doc, setDoc, Timestamp, addDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { Participant } from "@/app/types/participantType";
import { CheckCircle, X, AlertCircle, Users, CreditCard, Hash, User } from "lucide-react";
import toast from "react-hot-toast";
import useUsers from "@/app/hooks/useUsers";

interface ConfirmTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket;
}

const ConfirmTicketModal: React.FC<ConfirmTicketModalProps> = ({ isOpen, onClose, ticket }) => {
    const [loading, setLoading] = useState(false);
    const [previewCodes, setPreviewCodes] = useState<Record<string, number>>({});
    const [loadingPreview, setLoadingPreview] = useState(true);
    const users = useUsers();

    // Cargar preview al abrir el modal
    useEffect(() => {
        if (isOpen && ticket) {
            loadCodesPreview();
        }
    }, [isOpen, ticket]);

    if (!ticket || !isOpen) return null;

    // Función para obtener información del usuario por ID
    const getUserInfo = (userId: string) => {
        const user = users.find(u => u.id === userId);
        return {
            name: user?.name || `Usuario ${userId.slice(0, 8)}`,
            photo: user?.photo || null,
            email: user?.email || '',
        };
    };

    // Función para obtener el siguiente código disponible para un level específico
    const getNextCodeForLevel = async (level: string, eventId: string): Promise<string> => {
        try {
            // Consultar todos los participantes del mismo level y evento
            const participantsQuery = query(
                collection(db, "participants"),
                where("level", "==", level),
                where("eventId", "==", eventId)
            );

            const snapshot = await getDocs(participantsQuery);

            if (snapshot.empty) {
                // No hay participantes en este level, empezar desde 1
                return "1";
            }

            // Obtener todos los códigos y encontrar el máximo
            let maxCode = 0;
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const code = parseInt(data.code) || 0;
                if (code > maxCode) {
                    maxCode = code;
                }
            });

            const nextCode = maxCode + 1;
            return nextCode.toString();
        } catch (error) {
            console.error("Error obteniendo el próximo código:", error);
            // En caso de error, generar un código basado en timestamp para evitar duplicados
            return Date.now().toString().slice(-6);
        }
    };

    // Función para cargar la preview de códigos
    const loadCodesPreview = async () => {
        setLoadingPreview(true);
        try {
            const uniqueLevels = [...new Set(ticket.entries.map(entry => entry.level))];
            const codes: Record<string, number> = {};

            for (const level of uniqueLevels) {
                const nextCode = await getNextCodeForLevel(level, ticket.eventId);
                codes[level] = parseInt(nextCode);
            }

            setPreviewCodes(codes);
        } catch (error) {
            console.error("Error cargando preview de códigos:", error);
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);

        // Toast de loading
        const loadingToast = toast.loading('Procesando pago y generando códigos...', {
            position: 'top-right',
        });

        try {
            // Actualizar el ticket a pagado
            const ticketData: TicketData = {
                ...ticket,
                paymentDate: Timestamp.fromDate(new Date()),
                status: "Pagado"
            };

            await setDoc(doc(db, "tickets", ticket.id), ticketData, { merge: true });

            // Crear un mapa para llevar el control de códigos por level
            const codeCounterByLevel: Record<string, number> = {};

            // Usar los códigos ya calculados de la preview
            Object.keys(previewCodes).forEach(level => {
                codeCounterByLevel[level] = previewCodes[level];
            });

            let totalParticipantsCreated = 0;

            // Crear participantes según las entries del ticket
            for (let i = 0; i < ticket.entries.length; i++) {
                const entry = ticket.entries[i];

                // Generar código secuencial para este level (SIEMPRE NÚMERO)
                const participantCode = codeCounterByLevel[entry.level];
                codeCounterByLevel[entry.level]++; // Incrementar para la próxima entry de este level

                // Crear UN SOLO participante con TODOS los usersId de la entry
                const participantData: Omit<Participant, 'id'> = {
                    code: participantCode.toString(), // Convertir a string para almacenar
                    usersId: entry.usersId, // TODOS los usuarios de la entry comparten el mismo código
                    academiesId: entry.academiesId,
                    academiesName: entry.academiesName,
                    eventId: ticket.eventId,
                    category: entry.category,
                    level: entry.level,
                    scoreIds: [],
                    ticketId: ticket.id,
                    phase: "",
                    status: "Pagado",
                    createdAt: Timestamp.fromDate(new Date()),
                    updatedAt: Timestamp.fromDate(new Date())
                };

                await addDoc(collection(db, "participants"), participantData);
                totalParticipantsCreated++;
            }

            // Toast de éxito
            toast.success(
                `Pago confirmado exitosamente. Se crearon ${totalParticipantsCreated} participante(s) con códigos automáticos.`,
                {
                    position: 'top-right',
                    duration: 4000,
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
            console.error("Error confirmando el pago del ticket:", error);

            // Toast de error
            toast.error(
                "Error al confirmar el pago del ticket. Por favor, intenta de nuevo.",
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
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">

                {/* Header con gradiente verde */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white bg-opacity-20 rounded-full">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Confirmar Pago</h2>
                                <p className="text-green-100 text-sm">Procesar pago y crear participantes</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-red-200 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Contenido scrolleable */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div className="p-4 space-y-4">

                        {/* Información del ticket */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Hash className="w-3 h-3 text-blue-600" />
                                        <span className="text-xs text-blue-600 uppercase tracking-wide font-medium">Ticket</span>
                                    </div>
                                    <p className="font-mono text-sm font-bold text-blue-800">#{ticket.id.slice(0, 8)}</p>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Users className="w-3 h-3 text-blue-600" />
                                        <span className="text-xs text-blue-600 uppercase tracking-wide font-medium">Tipo</span>
                                    </div>
                                    <p className="text-sm font-semibold text-blue-800">{ticket.inscriptionType}</p>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <CreditCard className="w-3 h-3 text-blue-600" />
                                        <span className="text-xs text-blue-600 uppercase tracking-wide font-medium">Total</span>
                                    </div>
                                    <p className="text-lg font-bold text-blue-800">S/ {ticket.totalAmount.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Estado actual */}
                        <div className="flex items-center justify-center gap-2 text-sm">
                            <span className="px-3 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                                Actual: {ticket.status}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="px-3 py-1 rounded-full font-medium bg-green-100 text-green-700 border border-green-200">
                                Será: Pagado
                            </span>
                        </div>

                        {/* Resumen de inscripciones */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <div className="w-1.5 h-5 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                                Inscripciones
                                <span className="text-sm font-normal text-gray-500">({ticket.entries.length})</span>
                            </h3>

                            {/* Tabla compacta de inscripciones con usuarios */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="text-left p-3 font-semibold text-gray-700">#</th>
                                                <th className="text-left p-3 font-semibold text-gray-700">Participante(s)</th>
                                                <th className="text-left p-3 font-semibold text-gray-700">Modalidad</th>
                                                <th className="text-left p-3 font-semibold text-gray-700">Categoría</th>
                                                <th className="text-center p-3 font-semibold text-gray-700">Código</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(() => {
                                                let participantNumber = 1;
                                                let codesByLevel: Record<string, number> = {};

                                                // Inicializar códigos por level
                                                Object.keys(previewCodes).forEach(level => {
                                                    codesByLevel[level] = previewCodes[level];
                                                });

                                                return ticket.entries.map((entry, entryIndex) => {
                                                    const participantCode = codesByLevel[entry.level];
                                                    // Incrementar código para la próxima entry de este level
                                                    codesByLevel[entry.level]++;

                                                    const currentParticipantNumber = participantNumber++;

                                                    return (
                                                        <tr key={entryIndex} className="hover:bg-gray-50 transition-colors">
                                                            <td className="p-3 font-medium text-gray-600">
                                                                {String(currentParticipantNumber).padStart(2, '0')}
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="space-y-2">
                                                                    {entry.usersId.map((userId, userIndex) => {
                                                                        const userInfo = getUserInfo(userId);
                                                                        return (
                                                                            <div key={userIndex} className="flex items-center gap-2">
                                                                                {/* Foto del usuario */}
                                                                                <div className="flex-shrink-0">
                                                                                    {userInfo.photo ? (
                                                                                        <img 
                                                                                            src={userInfo.photo} 
                                                                                            alt={userInfo.name}
                                                                                            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                                                                                            onError={(e) => {
                                                                                                // Si la imagen falla, mostrar avatar por defecto
                                                                                                e.currentTarget.style.display = 'none';
                                                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                                            }}
                                                                                        />
                                                                                    ) : null}
                                                                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ${userInfo.photo ? 'hidden' : ''}`}>
                                                                                        <User className="w-4 h-4 text-white" />
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                {/* Información del usuario */}
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="font-medium text-gray-800 truncate">
                                                                                        {userInfo.name}
                                                                                    </p>
                                                                                    {userInfo.email && (
                                                                                        <p className="text-xs text-gray-500 truncate">
                                                                                            {userInfo.email}
                                                                                        </p>
                                                                                    )}
                                                                                </div>

                                                                                {/* Indicador de posición en pareja */}
                                                                                {entry.usersId.length > 1 && (
                                                                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium">
                                                                                        {userIndex + 1}/{entry.usersId.length}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-gray-800">{entry.level}</span>
                                                                    {entry.usersId.length > 1 && (
                                                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                                                            Pareja
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="p-3 text-gray-700 font-medium">{entry.category}</td>
                                                            <td className="p-3 text-center">
                                                                {loadingPreview ? (
                                                                    <div className="flex items-center justify-center">
                                                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                                                                            #{participantCode}
                                                                        </span>
                                                                        {entry.usersId.length > 1 && (
                                                                            <span className="text-xs text-blue-600 font-medium">
                                                                                Compartido
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Estadísticas compactas */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                                    <p className="text-xl font-bold text-blue-600">{ticket.entries.length}</p>
                                    <p className="text-xs text-blue-700 font-medium">Inscripciones</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                                    <p className="text-xl font-bold text-purple-600">
                                        {ticket.entries.reduce((total, entry) => total + entry.usersId.length, 0)}
                                    </p>
                                    <p className="text-xs text-purple-700 font-medium">Participantes</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                                    <p className="text-xl font-bold text-green-600">S/ {ticket.totalAmount.toFixed(2)}</p>
                                    <p className="text-xs text-green-700 font-medium">Total</p>
                                </div>
                            </div>
                        </div>

                        {/* Información importante compacta */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-blue-800">
                                    <p className="font-semibold mb-1">Al confirmar:</p>
                                    <ul className="space-y-0.5">
                                        <li>• Se crearán {ticket.entries.reduce((total, entry) => total + entry.usersId.length, 0)} participante(s) con los códigos mostrados arriba</li>
                                        <li>• Los códigos se asignarán secuencialmente por modalidad (level)</li>
                                        <li>• Estado cambiará a "Pagado"</li>
                                        <li>• Se registrará fecha/hora del pago</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="border-t border-gray-200 p-4">
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="w-4 h-4" />
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading || loadingPreview}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Procesando...
                                </>
                            ) : loadingPreview ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Calculando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Confirmar Pago
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmTicketModal;