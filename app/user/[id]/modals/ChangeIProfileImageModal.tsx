import React, { useRef, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void; // Agregado para manejar la imagen seleccionada
  onDelete: () => void;
}

const ChangeProfileImageModal: React.FC<ModalProps> = ({ isOpen, onClose, onDelete, onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCloseModal = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }, [onClose]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-5 rounded-lg shadow-lg flex flex-col gap-4 w-80">
        <h3 className="text-center font-semibold">Cambiar foto del perfil</h3>
        <button className="bg-blue-500 text-white py-2 rounded-md" onClick={handleFileClick}>
          Subir foto
        </button>
        <button className="bg-red-500 text-white py-2 rounded-md" onClick={onDelete}>Eliminar foto actual</button>
        <button className="bg-gray-300 py-2 rounded-md" onClick={handleCloseModal}>
          Cancelar
        </button>
      </div>
      {/* Input file oculto */}
      <input
        type="file"
        className="hidden"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ChangeProfileImageModal;
