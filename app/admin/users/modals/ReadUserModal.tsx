import React, { useState, useRef, useEffect } from "react";
import { User } from "@/app/types/userType";
import { Timestamp } from "firebase/firestore";
import { X } from "lucide-react";

interface UserModalProps {
  user: User;
  onClose: () => void;
  onUpdate?: () => void;
}

const formatTimestamp = (timestamp: Timestamp): string => {
  return new Date(timestamp.seconds * 1000).toLocaleString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short"
  });
};

const UserModal: React.FC<UserModalProps> = ({ user, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  const renderField = (key: string, value: any) => {
    if (value == null || value === "" || Array(value).every((item) => item === undefined || item === "")) {
      return null;  // No mostrar campos vacíos
    }
  
    if (key === "createdAt" || key === "updatedAt" || key === "birthDate") {
      return (
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 text-gray-500 dark:text-gray-400">
          {value instanceof Timestamp ? formatTimestamp(value) : (value || "No disponible")}
        </div>
      );
    }
  
    if (key === "id") {
      return (
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 text-gray-500 dark:text-gray-400">
          {value}
        </div>
      );
    }
  
    if (Array.isArray(value)) {
      // Filtramos los elementos vacíos del arreglo antes de renderizarlos
      const nonEmptyItems = value.filter(item => item != null && item !== "");
      if (nonEmptyItems.length === 0) return null;  // No mostrar si el arreglo está vacío
      
      return (
        <div className="space-y-2">
          {nonEmptyItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={item || ""}
                className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                readOnly
              />
            </div>
          ))}
        </div>
      );
    }
  
    return (
      <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 text-gray-500 dark:text-gray-400">
        {value}
      </div>
    );
  };
  
  const renderFieldGroup = (title: string, fields: string[]) => {
    const fieldsToRender = fields.filter(
      (key) =>
        key in user &&
        (user as Record<string, any>)[key] != null &&
        (user as Record<string, any>)[key] !== "" &&
        (Array.isArray((user as Record<string, any>)[key]) ? (user as Record<string, any>)[key].length > 0 : true)
    );
    
      // Filtramos si es un arreglo vacío
    
    if (fieldsToRender.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 border-b dark:border-gray-700 pb-2">
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fieldsToRender.map(key => (
            <div key={key} className="space-y-1">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}:
              </label>
              {renderField(key, user[key as keyof User])}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const fieldGroups = {
    basic: ["firstName", "lastName", "dni", "gender", "category", "birthDate"],
    contact: ["email", "phoneNumber"],
    other: ["level", "birthDate"],
    system: ["id", "roleId", "academyId", "academyName", "createdAt", "updatedAt"],
  };

  const userFullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Usuario";
  const userInitials = userFullName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-11/12 md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-hidden my-8 font-sans"  // Aplico una fuente consistente en todo el modal
        onClick={(e) => e.stopPropagation()}
      >
         {/* Header */}
         <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {userInitials}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{userFullName}</h2>
              <p className="text-blue-100">{user?.email[0]}</p>
              {user?.roleId && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-800/40 rounded-full text-xs font-medium">
                  {user?.roleId}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-12rem)] p-6">
          {renderFieldGroup("Información Básica", fieldGroups.basic)}
          {renderFieldGroup("Contacto", fieldGroups.contact)}
          {renderFieldGroup("Otros Datos", fieldGroups.other)}
          {renderFieldGroup("Información del Sistema", fieldGroups.system)}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 p-4 border-t dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
