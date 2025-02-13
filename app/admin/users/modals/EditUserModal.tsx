"use client";
import React, { useState } from "react";
import { User } from "@/app/types/userType";
import { FieldDefinition, getUserFieldDefinitions } from "./UserFieldDefinitions";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { Timestamp } from "firebase/firestore";

interface UserEditModalProps {
  user: User;
  onClose: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose }) => {
  // Se inicializa el estado con el objeto user recibido.
  const [editedUser, setEditedUser] = useState<{ [key: string]: any }>(user);
  const fields: FieldDefinition[] = getUserFieldDefinitions(user);

  // Función para actualizar un campo del usuario.
  const handleChange = (key: string, value: any) => {
    setEditedUser((prev) => ({ ...prev, [key]: value }));
  };
 
  /**
   * Función para formatear un Timestamp o Date a "YYYY-MM-DDTHH:MM"
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
   * Al presionar "Guardar", se actualiza el documento en Firestore.
   */
  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "users", user.id), editedUser);
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto transform transition-all ease-in-out duration-300">
        {/* Cabecera del Modal */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex justify-between items-center rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Editar {`${user?.firstName} ${user?.lastName}`}
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
              // Tratamiento especial para "email"
              if (field.key === "email") {
                const emails: string[] = Array.isArray(editedUser.email) ? editedUser.email : [];
                const primaryEmail = emails[0] || "";
                const secondaryEmail = emails.length > 1 && emails[1] ? emails[1] : "";
                return (
                  <div key={index} className={field.span === 2 ? "md:col-span-2" : ""}>
                    <label className="block mb-1 text-gray-600 dark:text-gray-400">Correo Principal:</label>
                    <input
                      type="text"
                      value={primaryEmail}
                      disabled
                      className="w-full bg-gray-100 dark:bg-gray-600 p-2 rounded border dark:border-gray-500"
                    />
                    {secondaryEmail && (
                      <>
                        <label className="block my-2 text-gray-600 dark:text-gray-400">Correo Secundario:</label>
                        <input
                          type="text"
                          value={secondaryEmail}
                          onChange={(e) => {
                            const newEmails = [...emails];
                            newEmails[1] = e.target.value;
                            handleChange("email", newEmails);
                          }}
                          className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </>
                    )}
                  </div>
                );
              }

              // Tratamiento especial para "phoneNumber"
              if (field.key === "phoneNumber") {
                const phones: string[] = Array.isArray(editedUser.phoneNumber) ? editedUser.phoneNumber : [];
                const primaryPhone = phones[0] || "";
                const secondaryPhone = phones.length > 1 && phones[1] ? phones[1] : "";
                return (
                  <div key={index} className={field.span === 2 ? "md:col-span-2" : ""}>
                    <label className="block mb-1 text-gray-600 dark:text-gray-400">Teléfono Principal:</label>
                    <input
                      type="text"
                      value={primaryPhone}
                      onChange={(e) => {
                        const newPhones = [...phones];
                        newPhones[0] = e.target.value;
                        handleChange("phoneNumber", newPhones);
                      }}
                      className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {secondaryPhone && (
                      <>
                        <label className="block my-2 text-gray-600 dark:text-gray-400">Teléfono Secundario:</label>
                        <input
                          type="text"
                          value={secondaryPhone}
                          onChange={(e) => {
                            const newPhones = [...phones];
                            newPhones[1] = e.target.value;
                            handleChange("phoneNumber", newPhones);
                          }}
                          className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </>
                    )}
                  </div>
                );
              }

              // Para los campos que son arrays y que no requieren un tratamiento tan especial (como attendedEvents o participatedEvents)
              if (field.key === "attendedEvents" || field.key === "participatedEvents") {
                const arr: string[] = Array.isArray(editedUser[field.key]) ? editedUser[field.key] : [];
                const valueStr = arr.join(", ");
                return (
                  <div key={index} className={field.span === 2 ? "md:col-span-2" : ""}>
                    <label className="block mb-1 text-gray-600 dark:text-gray-400">{field.label}:</label>
                    <input
                      type="text"
                      value={valueStr}
                      onChange={(e) => {
                        const newArr = e.target.value.split(",").map(item => item.trim()).filter(item => item);
                        handleChange(field.key, newArr);
                      }}
                      className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                );
              }

              // Para el campo "birthDate", se usa un input datetime-local.
              if (field.key === "birthDate") {
                const formattedValue = formatDateTimeLocal(editedUser.birthDate);
                return (
                  <div key={index} className={field.span === 2 ? "md:col-span-2" : ""}>
                    <label className="block mb-1 text-gray-600 dark:text-gray-400">{field.label}:</label>
                    <input
                      type="datetime-local"
                      value={formattedValue}
                      onChange={(e) =>
                        handleChange("birthDate", Timestamp.fromDate(new Date(e.target.value)))
                      }
                      className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                );
              }

              // Para el campo "createdAt", se muestra de solo lectura.
              if (field.key === "createdAt") {
                const formattedValue = formatDateTimeLocal(editedUser.createdAt);
                return (
                  <div key={index} className={field.span === 2 ? "md:col-span-2" : ""}>
                    <label className="block mb-1 text-gray-600 dark:text-gray-400">{field.label}:</label>
                    <input
                      type="datetime-local"
                      value={formattedValue}
                      disabled
                      className="w-full bg-gray-100 dark:bg-gray-600 p-2 rounded border dark:border-gray-500"
                    />
                  </div>
                );
              }

              // Para el campo "createdAt", se muestra de solo lectura.
              if (field.key === "id") {
                return (
                  <div key={index} className={field.span === 2 ? "md:col-span-2" : ""}>
                    <label className="block mb-1 text-gray-600 dark:text-gray-400">{field.label}:</label>
                    <input
                      type="text"
                      value={editedUser.id}
                      disabled
                      className="w-full bg-gray-100 dark:bg-gray-600 p-2 rounded border dark:border-gray-500"
                    />
                  </div>
                );
              }

              // Para el resto de los campos, se usa un input de tipo "text".
              const value = editedUser[field.key] ?? "";
              return (
                <div key={index} className={field.span === 2 ? "md:col-span-2" : ""}>
                  <label className="block mb-1 text-gray-600 dark:text-gray-400">{field.label}:</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
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

export default UserEditModal;
