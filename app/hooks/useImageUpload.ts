// app/register/hooks/useImageUpload.ts
import { useState, useRef, useCallback } from "react";

interface UseImageUploadReturn {
  // Estados
  loading: boolean;
  selectedImage: string | null;
  croppedImage: string | null;
  isModalOpen: boolean;
  
  // Refs
  fileInputRef: React.RefObject<HTMLInputElement>;
  
  // Funciones
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleConfirmCrop: (croppedImageUrl: string) => void;
  handleCloseModal: () => void;
  resetImage: () => void;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validar tipo de imagen
  const validateImageType = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return allowedTypes.includes(file.type);
  };

  // Validar tamaño de archivo
  const validateFileSize = (file: File, maxSizeMB: number): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  };

  // Redimensionar imagen
  const resizeImage = (
    file: File, 
    maxWidth: number = 1024, 
    maxHeight: number = 1024
  ): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new window.Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          }
        }, 'image/jpeg', 0.85);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Manejar cambio de archivo
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validaciones
      if (!validateImageType(file)) {
        alert('Por favor selecciona una imagen válida (JPG, PNG, WEBP)');
        return;
      }

      if (!validateFileSize(file, 10)) { // Máximo 10MB
        alert('La imagen es demasiado grande. Por favor selecciona una imagen menor a 10MB');
        return;
      }

      try {
        setLoading(true);

        // Redimensionar si es necesario
        const optimizedFile = await resizeImage(file, 1024, 1024);

        // Crear URL para el modal
        const imageUrl = URL.createObjectURL(optimizedFile);
        setSelectedImage(imageUrl);
        setIsModalOpen(true);

      } catch (error) {
        console.error('Error procesando imagen:', error);
        alert('Error al procesar la imagen. Por favor intenta con otra.');
      } finally {
        setLoading(false);
      }
    }
  }, []);

  // Confirmar crop
  const handleConfirmCrop = useCallback((croppedImageUrl: string): void => {
    setCroppedImage(croppedImageUrl);
    setIsModalOpen(false);
  }, []);

  // Cerrar modal
  const handleCloseModal = useCallback((): void => {
    setIsModalOpen(false);
    // Limpiar la selección si se cancela y no hay imagen cropped
    if (!croppedImage) {
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [croppedImage]);

  // Reset imagen
  const resetImage = useCallback((): void => {
    setSelectedImage(null);
    setCroppedImage(null);
    setIsModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return {
    // Estados
    loading,
    selectedImage,
    croppedImage,
    isModalOpen,
    
    // Refs
    fileInputRef,
    
    // Funciones
    handleFileChange,
    handleConfirmCrop,
    handleCloseModal,
    resetImage,
  };
};