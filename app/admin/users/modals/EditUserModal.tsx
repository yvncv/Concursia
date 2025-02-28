"use client";
import React, { useState } from "react";
import { User } from "@/app/types/userType";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { FieldValue } from "firebase/firestore";

interface UserEditModalProps {
  user: User;
  onClose: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose }) => {
  const [editedUser, setEditedUser] = useState<User>(user);

  const handleChange = <T extends keyof User>(key: T, value: User[T]) => {
    setEditedUser((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedUser: { [key: string]: FieldValue | Partial<unknown> | undefined } = {};

      Object.keys(editedUser).forEach((key) => {
        const value = editedUser[key as keyof User];
        if (value !== null) {
          updatedUser[key] = value;
        }
      });

      await updateDoc(doc(db, "users", user.id), updatedUser);
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const renderInputField = (key: keyof User, value: User[keyof User]) => {
    if (typeof value === "string" || Array.isArray(value)) {
      return (
          <input
              type="text"
              value={value as string | readonly string[]}
              onChange={(e) => handleChange(key, e.target.value as User[keyof User])}
              className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
      );
    }
    return null;
  };

  return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto transform transition-all ease-in-out duration-300">
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

          <div className="p-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(user).map((key) => {
                const value = editedUser[key as keyof User] ?? "";
                return (
                    <div key={key} className="md:col-span-2">
                      <label className="block mb-1 text-gray-600 dark:text-gray-400">{key}:</label>
                      {renderInputField(key as keyof User, value)}
                    </div>
                );
              })}
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

export default UserEditModal;