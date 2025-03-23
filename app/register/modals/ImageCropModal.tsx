import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface ImageCropperModalProps {
  image: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (croppedImageUrl: string) => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ image, isOpen, onClose, onConfirm }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmCrop = useCallback(async (e: React.MouseEvent) => {
    // Prevenir cualquier comportamiento por defecto
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!croppedAreaPixels) return;
      
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onConfirm(croppedImage);
    } catch (e) {
      console.error('Error al recortar la imagen:', e);
    }
  }, [croppedAreaPixels, image, onConfirm]);

  const handleCloseModal = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  // Detener la propagación de eventos para evitar que lleguen al formulario padre
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleModalClick}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Recortar imagen de perfil</h2>
        
        <div className="relative w-full h-64 bg-gray-100 rounded-lg mb-4">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropShape="round"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zoom
          </label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button" // Añadido type="button" explícitamente
            onClick={handleCloseModal}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="button" // Añadido type="button" explícitamente
            onClick={handleConfirmCrop}
            className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

// Funciones auxiliares para el recorte de imágenes
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo obtener el contexto del canvas');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg');
};

export default ImageCropperModal;