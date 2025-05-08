import React, { useState } from "react";
import { Ticket, TicketData } from "@/app/types/ticketType";
import { doc, setDoc, Timestamp, addDoc, collection } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { Participant } from "@/app/types/participantType";
import { Users, User, AlertCircle, CheckCircle } from "lucide-react";

interface ConfirmTicketProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket;
}

const ConfirmTicket: React.FC<ConfirmTicketProps> = ({ isOpen, onClose, ticket }) => {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [participantCodes, setParticipantCodes] = useState<Record<number, string>>({});

    if (!ticket) {
        return null;
    }

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (input !== "Pagado") {
            alert("Por favor, escribe 'Pagado' para confirmar el pago.");
            return;
        }

        setLoading(true);

        try {
            // Actualizar el ticket a pagado
            const ticketData: TicketData = {
                ...ticket,
                paymentDate: Timestamp.fromDate(new Date()),
                status: "Pagado"
            };

            await setDoc(doc(db, "tickets", ticket.id), ticketData, { merge: true });

            // Crear participantes según las entries del ticket
            for (let i = 0; i < ticket.entries.length; i++) {
                const entry = ticket.entries[i];
                
                const participantData: Omit<Participant, 'id'> = {
                    code: participantCodes[i] || "", // Código de espalda si fue proporcionado
                    usersId: entry.usersId,
                    eventId: ticket.eventId,
                    category: entry.category,
                    level: entry.level,
                    scoreIds: [],
                    ticketId: ticket.id,
                    phase: "initial",
                    status: "active",
                    createdAt: Timestamp.fromDate(new Date()),
                    updatedAt: Timestamp.fromDate(new Date())
                };

                await addDoc(collection(db, "participants"), participantData);
            }

            alert(`Pago confirmado. Se crearon ${ticket.entries.length} participante(s) exitosamente.`);
            onClose();
        } catch (error) {
            console.error("Error confirmando el pago del ticket:", error);
            alert("Error confirmando el pago del ticket.");
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (index: number, value: string) => {
        setParticipantCodes({
            ...participantCodes,
            [index]: value
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-[90%] sm:w-[600px] max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Confirmar Pago del Ticket
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            #{ticket.id.slice(0, 8)}
                        </span>
                        <span className="flex items-center gap-1">
                            {ticket.inscriptionType === 'Grupal' ? 
                                <Users className="w-4 h-4" /> : 
                                <User className="w-4 h-4" />
                            }
                            {ticket.inscriptionType}
                        </span>
                    </div>
                </div>

                {/* Ticket Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-600">Estado Actual</p>
                            <p className="font-semibold text-yellow-600">{ticket.status}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total a Pagar</p>
                            <p className="font-semibold text-lg">S/ {ticket.totalAmount.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Entries */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">Inscripciones a Confirmar</h3>
                        <div className="space-y-3">
                            {ticket.entries.map((entry, index) => (
                                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {entry.level} - {entry.category}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {entry.usersId.length} participante(s)
                                            </p>
                                        </div>
                                        <span className="text-sm font-medium text-blue-600">
                                            S/ {entry.amount.toFixed(2)}
                                        </span>
                                    </div>
                                    
                                    {/* Campo opcional para código de espalda */}
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            placeholder="Código de espalda (opcional)"
                                            value={participantCodes[index] || ""}
                                            onChange={(e) => handleCodeChange(index, e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Confirmation Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Para confirmar el pago, escribe "Pagado"
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Escribe 'Pagado' para confirmar"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />
                </div>

                {/* Info Alert */}
                <div className="mb-6 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Información importante:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Al confirmar, se creará(n) {ticket.entries.length} participante(s)</li>
                            <li>El ticket cambiará su estado a "Pagado"</li>
                            <li>Esta acción no puede deshacerse</li>
                            <li>Los códigos de espalda son opcionales y pueden agregarse después</li>
                        </ul>
                    </div>
                </div>

                {/* Success Preview */}
                {input === "Pagado" && (
                    <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-4">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-green-800">
                            Listo para confirmar el pago y crear {ticket.entries.length} participante(s)
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        className={`px-6 py-2 text-white rounded-lg transition-colors ${
                            loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700'
                        }`}
                        disabled={loading || input !== "Pagado"}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Confirmando...
                            </div>
                        ) : (
                            'Confirmar Pago'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmTicket;