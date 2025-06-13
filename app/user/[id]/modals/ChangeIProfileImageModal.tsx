import React, { useRef, useCallback, useState } from 'react';
import Image from 'next/image';
import { 
  X, 
  Camera, 
  Trash2, 
  Upload,
  User,
  ZoomIn
} from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  onDelete: () => void;
  currentImage?: string | null;
  userName?: string;
}

const ChangeProfileImageModal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onDelete, 
  onFileSelect,
  currentImage,
  userName = "Usuario"
}) => {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCloseModal = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowImagePreview(false);
    onClose();
  }, [onClose]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validaciones básicas
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('La imagen es demasiado grande. Máximo 10MB');
        return;
      }

      setLoading(true);
      
      // Simular procesamiento para UX
      setTimeout(() => {
        onFileSelect(file);
        setLoading(false);
        handleCloseModal();
      }, 500);
    }
  };

  const handleDeleteClick = () => {
    onDelete();
    handleCloseModal();
  };

  const handleShowPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImage) {
      setShowImagePreview(true);
    }
  };

  const handleClosePreview = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowImagePreview(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Principal */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={handleCloseModal}
      >
        <div 
          className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden transform transition-all mx-2 sm:mx-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 sm:p-6 text-white">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1 sm:p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
            <div className="text-center pr-8 sm:pr-0">
              <h3 className="text-lg sm:text-xl font-bold mb-1">Foto de Perfil</h3>
              <p className="text-blue-100 text-xs sm:text-sm truncate">{userName}</p>
            </div>
          </div>

          {/* Previsualización de Imagen */}
          <div className="p-4 sm:p-6">
            <div className="relative mb-4 sm:mb-6">
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto relative rounded-full overflow-hidden border-2 sm:border-4 border-gray-200 shadow-lg group">
                {currentImage ? (
                  <>
                    <Image
                      src={currentImage}
                      alt="Foto de perfil actual"
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      unoptimized
                    />
                    {/* Overlay para zoom */}
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all cursor-pointer"
                      onClick={handleShowPreview}
                    >
                      <ZoomIn 
                        size={24} 
                        className="sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" 
                      />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User size={40} className="sm:w-16 sm:h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Badge de cámara */}
              <div className="absolute bottom-1 sm:bottom-2 right-1/2 transform translate-x-8 sm:translate-x-12 translate-y-1 sm:translate-y-2">
                <div className="bg-blue-500 p-2 sm:p-3 rounded-full shadow-lg">
                  <Camera size={16} className="sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={handleFileClick}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold flex items-center justify-center gap-2 sm:gap-3 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                ) : (
                  <Upload size={16} className="sm:w-5 sm:h-5" />
                )}
                {loading ? 'Procesando...' : 'Subir Nueva Foto'}
              </button>

              {currentImage && (
                <button
                  onClick={handleDeleteClick}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold flex items-center justify-center gap-2 sm:gap-3 transition-all transform hover:scale-[1.02] shadow-lg text-sm sm:text-base"
                >
                  <Trash2 size={16} className="sm:w-5 sm:h-5" />
                  Eliminar Foto Actual
                </button>
              )}

              <button
                onClick={handleCloseModal}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold transition-all text-sm sm:text-base"
              >
                Cancelar
              </button>
            </div>

            {/* Guía rápida */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
              <p className="text-xs sm:text-sm text-blue-700 text-center leading-relaxed">
                💡 <strong>Consejo:</strong> Usa una foto clara, frontal y bien iluminada para mejores resultados
              </p>
            </div>
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
      </div>

      {/* Modal de Vista Previa Ampliada */}
      {showImagePreview && currentImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-2 sm:p-4"
          onClick={handleClosePreview}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={handleClosePreview}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 p-2 rounded-full"
            >
              <X size={24} className="sm:w-8 sm:h-8" />
            </button>
            
            <div className="relative w-full h-full max-w-4xl max-h-4xl flex items-center justify-center">
              <Image
                src={currentImage}
                alt="Vista previa ampliada"
                fill
                className="object-contain rounded-lg shadow-2xl"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChangeProfileImageModal;