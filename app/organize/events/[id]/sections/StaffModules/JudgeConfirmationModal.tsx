import React from 'react';

interface JudgeConfirmationModalProps {
  isRemoving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const JudgeConfirmationModal = ({
  isRemoving,
  onConfirm,
  onCancel
}: JudgeConfirmationModalProps) => {
  const title = isRemoving
    ? 'Quitar permiso de Jurado'
    : 'Asignar permiso de Jurado';

  const message = isRemoving
    ? 'Estás a punto de quitar el permiso de jurado. ¿Deseas continuar?'
    : 'Al asignar el permiso de jurado se eliminarán los demás permisos. ¿Deseas continuar?';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default JudgeConfirmationModal;
