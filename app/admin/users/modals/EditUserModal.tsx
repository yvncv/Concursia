"use client";
import React, { useState, useRef, useEffect } from "react";
import { User } from "@/app/types/userType";
import { Timestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
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

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onUpdate }) => {
  const [editedUser, setEditedUser] = useState<User>(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

  const handleChange = <T extends keyof User>(key: T, value: User[T]) => {
    if (key !== "id") { // Prevent ID from being edited
      setEditedUser((prev) => ({ ...prev, [key]: value }));
      if (error) setError(null);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = {
        ...editedUser,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(doc(db, "users", user.id), updatedUser);
      setSuccess(true);
      
      if (onUpdate) onUpdate();
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Error al actualizar el usuario. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = (key: string) => {
    const fieldValue = editedUser[key as keyof User] as string[];
    
    // Limit the length to a maximum of 2 for email and phoneNumber
    if (key === "email" || key === "phoneNumber") {
      if (fieldValue.length < 2) {
        setEditedUser((prev) => ({
          ...prev,
          [key]: [...fieldValue, ""]
        }));
      }
    } else {
      setEditedUser((prev) => ({
        ...prev,
        [key]: "" // Set empty string to allow the user to edit this field
      }));
    }
  };

  const handleRemoveField = (key: string, index: number) => {
    const fieldValue = editedUser[key as keyof User] as string[];

    // Allow removal only for email and phoneNumber if it's not the first item
    if (index > 0 && (key === "email" || key === "phoneNumber")) {
      const newArray = [...fieldValue];
      newArray.splice(index, 1); // Remove item at specified index
      setEditedUser((prev) => ({
        ...prev,
        [key]: newArray
      }));
    } else if (index >= 0 && (key !== "email" && key !== "phoneNumber")) {
      const newArray = [...fieldValue];
      newArray.splice(index, 1); // Remove item at specified index
      setEditedUser((prev) => ({
        ...prev,
        [key]: newArray
      }));
    }
  };

  const renderField = (key: string, value: any) => {
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
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={item || ""}
                onChange={(e) => {
                  const newArray = [...value];
                  newArray[index] = e.target.value;
                  handleChange(key as keyof User, newArray as any);
                }}
                className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button 
                onClick={() => handleRemoveField(key, index)} 
                className={`p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center w-8 h-8 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Eliminar"
                disabled={index === 0} // Disable remove for the first item
              >
                ✕
              </button>
            </div>
          ))}
          {value.length < 2 && (
            <button 
              onClick={() => handleAddField(key)} 
              className="flex items-center justify-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm mt-2"
            >
              <span className="mr-1">+</span> Agregar
            </button>
          )}
        </div>
      );
    }
  
    return (
      <input
        type={key === "email" ? "email" : key === "phoneNumber" ? "tel" : "text"}
        value={value || ""}
        onChange={(e) => handleChange(key as keyof User, e.target.value as User[keyof User])}
        className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    );
  };
  

  const fieldGroups = {
    basic: ["firstName", "lastName", "dni", "gender", "category", "birthDate"],
    contact: ["email", "phoneNumber"],
    other: ["level"],
    system: ["id", "roleId", "academyId", "academyName", "createdAt", "updatedAt"],
  };

  const renderFieldGroup = (title: string, fields: string[]) => {
    const fieldsToRender = fields.filter(key => editedUser.hasOwnProperty(key));
    
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
              {renderField(key, editedUser[key as keyof User])}
            </div>
          ))}
        </div>
      </div>
    );
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
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-11/12 md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-hidden my-8"
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
              <p className="text-blue-100">{user.email[0]}</p>
              {user.roleId && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-800/40 rounded-full text-xs font-medium">
                  {user.roleId}
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
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
              Usuario actualizado correctamente
            </div>
          )}

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
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
