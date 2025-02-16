"use client";
import React, { useState } from "react";
import { Event } from "@/app/types/eventType";
import { FieldDefinition, getFieldDefinitions } from "./EventFieldDefinitions";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { Timestamp } from "firebase/firestore";

interface EventEditModalProps {
  event: Event;
  onClose: () => void;
}

/**
 * Función auxiliar para obtener el valor del campo, teniendo en cuenta
 * que algunos campos están anidados (location.coordinates o settings).
 */
const getFieldValue = (key: string, event: Event) => {
  if (["placeName", "street", "district", "province", "department"].includes(key)) {
    return event.location ? event.location[key] : "";
  }
  if (["latitude", "longitude"].includes(key)) {
    return event.location && event.location.coordinates
      ? event.location.coordinates[key]
      : "";
  }
  if (["categories", "levels", "registrationType"].includes(key)) {
    return event.settings ? event.settings[key] : "";
  }
  return event[key];
};

const EventEditModal: React.FC<EventEditModalProps> = ({ event, onClose }) => {
  // Se inicializa el estado con el objeto event recibido.
  const [editedEvent, setEditedEvent] = useState<{ [key: string]: any }>(event);
  const fields: FieldDefinition[] = getFieldDefinitions(event);

  /**
   * Actualiza el valor de un campo.
   * Si el campo pertenece a una propiedad anidada en "location" (o "location.coordinates")
   * o en "settings", se actualiza la parte correspondiente del objeto.
   */
  const handleChange = (key: string, value: any) => {
    // Campos anidados en location (nivel superior)
    if (["placeName", "street", "district", "province", "department"].includes(key)) {
      setEditedEvent((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [key]: value,
        },
      }));
      return;
    } 
    // Para latitud y longitud, que están dentro de location.coordinates
    if (["latitude", "longitude"].includes(key)) {
      setEditedEvent((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: {
            ...prev.location?.coordinates,
            [key]: value,
          },
        },
      }));
      return;
    }
    // Para arrays (categorías o tipos de inscripción)
    if (["categories", "registrationType"].includes(key)) {
      setEditedEvent((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          [key]: value,
        },
      }));
      return;
    }
    // Para el objeto "levels" (se actualiza de forma completa)
    if (key === "levels") {
      setEditedEvent((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          levels: value,
        },
      }));
      return;
    }
    // Para campos de nivel superior
    setEditedEvent((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Función para formatear el valor de fecha a "YYYY-MM-DDTHH:MM"
   * requerido por el input "datetime-local".
   */
  const formatDateTimeLocal = (timestamp: any) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString().slice(0, 16);
    } else if (timestamp instanceof Date) {
      return timestamp.toISOString().slice(0, 16);
    }
    return "";
  };

  /**
   * Al presionar "Guardar", se actualiza la fecha de actualización,
   * se llama a updateDoc para actualizar el documento en Firestore y,
   * si todo es correcto, se cierra el modal y se notifica al componente padre.
   */
     const handleSave = async () => {
       try {
         await updateDoc(doc(db, "eventos", event.id), editedEvent);
         onClose();
       } catch (error) {
         console.error("Error updating event:", error);
       }
     };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto transform transition-all ease-in-out duration-300">
        {/* Cabecera del Modal */}
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

        {/* Contenido del Modal */}
        <div className="p-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field, index) => {
              // Renderizado personalizado para arrays (categorías y tipos de inscripción)
              if (field.key === "categories" || field.key === "registrationType") {
                const arrayValue =
                  (editedEvent.settings && editedEvent.settings[field.key]) ||
                  (Array.isArray(editedEvent[field.key]) ? editedEvent[field.key] : []);
                const valueStr = Array.isArray(arrayValue) ? arrayValue.join(", ") : "";
                return (
                  <div key={index} className={field.span === 2 ? "md:col-span-2" : ""}>
                    <label className="block mb-1 text-gray-600 dark:text-gray-400">
                      {field.label}:
                    </label>
                    <input
                      type="text"
                      value={valueStr}
                      onChange={(e) => {
                        const newArray = e.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter((item) => item);
                        handleChange(field.key, newArray);
                      }}
                      className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                );
              }

              // Renderizado personalizado para el objeto "levels"
              if (field.key === "levels") {
                const levelsObj =
                  editedEvent.settings && editedEvent.settings.levels
                    ? editedEvent.settings.levels
                    : {};
                return (
                  <div key={index} className={field.span === 2 ? "md:col-span-2" : ""}>
                    <label className="block mb-1 text-gray-600 dark:text-gray-400">
                      {field.label}:
                    </label>
                    {Object.entries(levelsObj).map(([levelName, levelData]: [string, any]) => (
                      <div key={levelName} className="border p-2 mb-2 rounded">
                        <div className="mb-1 font-bold">Nivel: {levelName}</div>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm">Precio:</label>
                          <input
                            type="number"
                            value={levelData.price}
                            onChange={(e) => {
                              const newPrice = parseFloat(e.target.value);
                              setEditedEvent((prev) => ({
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  levels: {
                                    ...prev.settings?.levels,
                                    [levelName]: {
                                      ...prev.settings?.levels[levelName],
                                      price: newPrice,
                                    },
                                  },
                                },
                              }));
                            }}
                            className="w-20 bg-gray-50 dark:bg-gray-700 p-1 rounded border dark:border-gray-600"
                          />
                          <label className="text-sm">Pareja:</label>
                          <input
                            type="checkbox"
                            checked={levelData.couple}
                            onChange={(e) => {
                              const newCouple = e.target.checked;
                              setEditedEvent((prev) => ({
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  levels: {
                                    ...prev.settings?.levels,
                                    [levelName]: {
                                      ...prev.settings?.levels[levelName],
                                      couple: newCouple,
                                    },
                                  },
                                },
                              }));
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              // Para los demás campos, incluyendo fechas, números y texto
              const rawValue = getFieldValue(field.key, editedEvent);
              const isDate = field.key.toLowerCase().includes("date");
              const isNumber = typeof rawValue === "number";
              const formattedValue = isDate ? formatDateTimeLocal(rawValue) : rawValue ?? "";
              return (
                <div key={index} className={field.span === 2 ? "md:col-span-2" : ""}>
                  <label className="block mb-1 text-gray-600 dark:text-gray-400">
                    {field.label}:
                  </label>
                  <input
                    type={isDate ? "datetime-local" : isNumber ? "number" : "text"}
                    value={formattedValue}
                    onChange={(e) => {
                      if (isDate) {
                        handleChange(field.key, Timestamp.fromDate(new Date(e.target.value)));
                      } else if (isNumber) {
                        handleChange(field.key, parseFloat(e.target.value));
                      } else {
                        handleChange(field.key, e.target.value);
                      }
                    }}
                    className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Botones del Modal */}
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
