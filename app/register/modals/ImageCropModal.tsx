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
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmCrop = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProcessing(true);

    try {
      if (!croppedAreaPixels) return;

      const croppedImage = await getCroppedImg(image, croppedAreaPixels);

      // COMPRIMIR A MÁXIMO 80KB
      const optimizedImage = await compressImageTo80KB(croppedImage);

      onConfirm(optimizedImage);
    } catch (e) {
      console.error('Error al procesar la imagen:', e);
    } finally {
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, image, onConfirm]);

  const handleCloseModal = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

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

        {/* Información de optimización */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            📸 Tu imagen será optimizada automáticamente a máximo 80KB
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleCloseModal}
            disabled={isProcessing}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmCrop}
            disabled={isProcessing}
            className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 disabled:opacity-50"
          >
            {isProcessing ? 'Optimizando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Función para crear imagen
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

// Función para recortar imagen
const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo obtener el contexto del canvas');
  }

  // Tamaño fijo para perfiles
  const outputSize = 400;
  canvas.width = outputSize;
  canvas.height = outputSize;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return canvas.toDataURL('image/jpeg', 0.9);
};

// FUNCIÓN PRINCIPAL: Comprimir a máximo 80KB
const compressImageTo80KB = async (base64: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      // Tamaño para perfiles: 400x400
      const size = 400;
      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(img, 0, 0, size, size);

      // Función para comprimir hasta 80KB máximo
      const compress = (quality: number): string => {
        const compressed = canvas.toDataURL('image/jpeg', quality);
        const sizeKB = Math.round((compressed.length * 3 / 4) / 1024);

        // Si es menor a 80KB o la calidad es muy baja, retornar
        if (sizeKB <= 80 || quality <= 0.3) {
          console.log(`✅ Imagen optimizada: ${sizeKB}KB con calidad ${Math.round(quality * 100)}%`);
          return compressed;
        }

        // Reducir calidad gradualmente
        return compress(quality - 0.05);
      };

      resolve(compress(0.9)); // Comenzar con 90% de calidad
    };

    img.src = base64;
  });
};

export default ImageCropperModal;