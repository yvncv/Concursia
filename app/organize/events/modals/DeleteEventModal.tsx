import React, { useState } from "react";
import { doc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db,storage } from "@/app/firebase/config";
import { CustomEvent } from "@/app/types/eventType";
import { deleteObject, ref } from "firebase/storage";

interface DeleteEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CustomEvent;
}

const DeleteEventModal: React.FC<DeleteEventModalProps> = ({ isOpen, onClose, event }) => {
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (input === event.name) {
      try {
        // Delete associated tickets
        const ticketsQuery = query(collection(db, "tickets"), where("eventId", "==", event.id));
        const ticketsSnapshot = await getDocs(ticketsQuery);
        const deletePromises = ticketsSnapshot.docs.map((ticketDoc) => deleteDoc(ticketDoc.ref));
        await Promise.all(deletePromises);

        // Delete associated images
        const bannerImageRef = ref(storage, event.bannerImage);
        const smallImageRef = ref(storage, event.smallImage);
        await deleteObject(bannerImageRef);
        await deleteObject(smallImageRef);

        // Delete event document
        await deleteDoc(doc(db, "eventos", event.id));
        onClose();
      } catch (error) {
        console.error("Error deleting event or tickets:", error);
      }
    } else {
      alert("El nombre no coincide. No se puede eliminar.");
    }
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10" onClick={onClose}>
        <div className="bg-white backdrop-blur-xl p-6 rounded-2xl shadow-lg w-[90%] sm:w-[400px] max-w-lg" onClick={(e) => e.stopPropagation()}>
          <h2 className="font-semibold text-center mb-4 text-gray-600 text-2xl">
            ¿Seguro que desea eliminar el evento{" "}
            <span className="text-red-500 underline">{event.name}</span>?
          </h2>
          <input
              type="text"
              className="w-full p-3 placeholder:text-red-200 mt-2 border border-gray-300 rounded-full shadow-sm"
              placeholder={event.name}
              value={input}
              onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex justify-between mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 hover:bg-gray-400 rounded-full">
              Cancelar
            </button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white hover:bg-red-500 rounded-full">
              Eliminar
            </button>
          </div>
        </div>
      </div>
  );
};

export default DeleteEventModal;