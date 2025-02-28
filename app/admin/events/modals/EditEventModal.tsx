import React, { useState } from "react";
import { CustomEvent } from "@/app/types/eventType";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { Timestamp } from "firebase/firestore";

interface EventEditModalProps {
  event: CustomEvent;
  onClose: () => void;
}

const EventEditModal: React.FC<EventEditModalProps> = ({ event, onClose }) => {
  const [editedEvent, setEditedEvent] = useState<CustomEvent>(event);

  const handleChange = <K extends keyof CustomEvent>(key: K, value: CustomEvent[K]) => {
    setEditedEvent((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleLocationChange = <K extends keyof CustomEvent["location"]>(
      key: K,
      value: CustomEvent["location"][K]
  ) => {
    setEditedEvent((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [key]: value,
      },
    }));
  };

  const handleCoordinatesChange = <K extends keyof CustomEvent["location"]["coordinates"]>(
      key: K,
      value: CustomEvent["location"]["coordinates"][K]
  ) => {
    setEditedEvent((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...prev.location.coordinates,
          [key]: value,
        },
      },
    }));
  };


  const handleSettingsChange = <K extends keyof CustomEvent["settings"]>(
      key: K,
      value: CustomEvent["settings"][K]
  ) => {
    setEditedEvent((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }));
  };

  const handleLevelChange = (level: string, key: keyof CustomEvent["settings"]["levels"][string], value: number|boolean) => {
    setEditedEvent((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        levels: {
          ...prev.settings.levels,
          [level]: {
            ...prev.settings.levels[level],
            [key]: value,
          },
        },
      },
    }));
  };

  const formatDateTimeLocal = (timestamp: Timestamp | Date) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString().slice(0, 16);
    } else {
      return timestamp.toISOString().slice(0, 16);
    }
  };

  type FirestoreData = {
    [key: string]: string | number | boolean | FirestoreData | FirestoreData[];
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "eventos", event.id), editedEvent as unknown as FirestoreData);
      onClose();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto transform transition-all ease-in-out duration-300">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex justify-between items-center rounded-t-xl z-10">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Editar {event.name}
            </h2>
            <button
                onClick={onClose}
                className="text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 text-3xl font-light transition-colors"
            >
              &times;
            </button>
          </div>

          <div className="p-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Nombre:</label>
                <input
                    type="text"
                    value={editedEvent.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Descripción:</label>
                <input
                    type="text"
                    value={editedEvent.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Fecha de Inicio:</label>
                <input
                    type="datetime-local"
                    value={formatDateTimeLocal(editedEvent.startDate)}
                    onChange={(e) => handleChange("startDate", Timestamp.fromDate(new Date(e.target.value)))}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Fecha Fin:</label>
                <input
                    type="datetime-local"
                    value={formatDateTimeLocal(editedEvent.endDate)}
                    onChange={(e) => handleChange("endDate", Timestamp.fromDate(new Date(e.target.value)))}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Capacidad:</label>
                <input
                    type="number"
                    value={editedEvent.capacity}
                    onChange={(e) => handleChange("capacity", e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Tipo de Evento:</label>
                <input
                    type="text"
                    value={editedEvent.eventType}
                    onChange={(e) => handleChange("eventType", e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Nombre del Lugar:</label>
                <input
                    type="text"
                    value={editedEvent.location.placeName}
                    onChange={(e) => handleLocationChange("placeName", e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Calle:</label>
                <input
                    type="text"
                    value={editedEvent.location.street}
                    onChange={(e) => handleLocationChange("street", e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Distrito:</label>
                <input
                    type="text"
                    value={editedEvent.location.district}
                    onChange={(e) => handleLocationChange("district", e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Provincia:</label>
                <input
                    type="text"
                    value={editedEvent.location.province}
                    onChange={(e) => handleLocationChange("province", e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Departamento:</label>
                <input
                    type="text"
                    value={editedEvent.location.department}
                    onChange={(e) => handleLocationChange("department", e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Latitud:</label>
                <input
                    type="text"
                    value={editedEvent.location.coordinates.latitude}
                    onChange={(e) => handleCoordinatesChange("latitude", e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Longitud:</label>
                <input
                    type="text"
                    value={editedEvent.location.coordinates.longitude}
                    onChange={(e) => handleCoordinatesChange("longitude", e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Categorías:</label>
                <input
                    type="text"
                    value={editedEvent.settings.categories.join(", ")}
                    onChange={(e) => handleSettingsChange("categories", e.target.value.split(",").map((item) => item.trim()))}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-gray-600 dark:text-gray-400">Niveles:</label>
                {Object.entries(editedEvent.settings.levels).map(([level, info]) => (
                    <div key={level} className="border p-2 mb-2 rounded">
                      <div className="mb-1 font-bold">Nivel: {level}</div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm">Precio:</label>
                        <input
                            type="number"
                            value={info.price}
                            className="w-20 bg-gray-50 dark:bg-gray-700 p-1 rounded border dark:border-gray-600"
                            onChange={(e) => handleLevelChange(level, "price", parseFloat(e.target.value))}
                        />
                        <label className="text-sm">Pareja:</label>
                        <input
                            type="checkbox"
                            checked={info.couple}
                            onChange={(e) => handleLevelChange(level, "couple", e.target.checked)}
                        />
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 flex justify-end space-x-4 border-t dark:border-gray-700">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
            <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
  );
};

export default EventEditModal;