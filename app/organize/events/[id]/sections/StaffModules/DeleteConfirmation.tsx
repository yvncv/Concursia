import React from 'react';
import { AlertCircle } from 'lucide-react';
import { User } from '@/app/types/userType';

interface DeleteConfirmationProps {
  user: User;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmation = ({ user, onCancel, onConfirm }: DeleteConfirmationProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-medium text-center mb-2">Confirmar eliminación</h3>
          <p className="text-gray-500 text-center mb-6">
            ¿Está seguro que desea eliminar a {user.firstName} {user.lastName} del personal?
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
