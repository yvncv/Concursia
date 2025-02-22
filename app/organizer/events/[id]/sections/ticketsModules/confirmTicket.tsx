import React, { useState } from "react";

import {Ticket, TicketData} from "@/app/types/ticketType";
import {doc, setDoc, Timestamp} from "firebase/firestore";
import {db} from "@/app/firebase/config";

interface ConfirmTicketProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket;
}

const ConfirmTicket: React.FC<ConfirmTicketProps> = ({ isOpen, onClose, ticket }) => {
    const [input, setInput] = useState("");

    if (!ticket) {
        return null; // Return null if ticket is null or undefined
    }

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (input === "Cancelado") {
            const ticketData: TicketData = {
                ...ticket,
                paymentDate: Timestamp.fromDate(new Date()), // Actualiza la fecha de pago
                status: "Cancelado" // Actualiza el estado del ticket
            };

            try {
                await setDoc(doc(db, "tickets", ticket.id), ticketData, { merge: true });
                alert("Pago confirmado exitosamente.");
                onClose();
            } catch (error) {
                console.error("Error confirmando el pago del ticket:", error);
                alert("Error confirmando el pago del ticket.");
            }
        } else {
            alert("La palabra clave no coincide. No se puede confirmar el pago.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10" onClick={onClose}>
            <div className="bg-white backdrop-blur-xl p-6 rounded-2xl shadow-lg w-[90%] sm:w-[400px] max-w-lg" onClick={(e) => e.stopPropagation()}>
                <h2 className="font-semibold text-center mb-4 text-gray-600 text-2xl">
                    ¿Seguro que desea confirmar el pago del ticket{" "}
                    <span className="text-green-500 underline">{ticket.id}</span>?
                </h2>
                <input
                    type="text"
                    className="w-full p-3 placeholder:text-green-400 mt-2 border border-gray-300 rounded-full shadow-sm"
                    placeholder="Cancelado"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <div className="flex justify-between mt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 hover:bg-gray-400 rounded-full">
                        Cancelar
                    </button>
                    <button onClick={handleConfirm} className="px-4 py-2 bg-green-600 text-white hover:bg-green-500 rounded-full">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmTicket;