// /app/components/modals/UserModal.tsx
"use client";
import React from "react";
import { User } from "@/app/types/userType";
import { FieldDefinition, getUserFieldDefinitions } from "./UserFieldDefinitions";

interface UserModalProps {
  user: User;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose }) => {
  const fieldDefs: FieldDefinition[] = getUserFieldDefinitions(user);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto transform transition-all ease-in-out duration-300">
        {/* Cabecera del Modal */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex justify-between items-center rounded-t-xl z-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {`${user?.firstName} ${user?.lastName}`}
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
            {fieldDefs.map((field, index) => (
              <div
                key={index}
                className={field.span === 2 ? "md:col-span-2" : ""}
              >
                <strong className="block mb-1 text-gray-600 dark:text-gray-400">
                  {field.label}:
                </strong>
                <p className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {field.formatter
                    ? field.formatter(user[field.key])
                    : user[field.key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
