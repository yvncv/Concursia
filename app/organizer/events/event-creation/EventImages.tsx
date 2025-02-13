import { useState } from 'react';
import { CircleX, Check } from 'lucide-react';

interface EventImagesProps {
  data: {
    smallImage: string | File;
    bannerImage: string | File;
    smallImagePreview?: string;
    bannerImagePreview?: string;
  };
  updateData: (data: any) => void;
}

export default function EventImages({ data, updateData }: EventImagesProps) {
  const [previewModal, setPreviewModal] = useState<{
    show: boolean;
    image: string | null;
    type: 'smallImage' | 'bannerImage' | null;
  }>({
    show: false,
    image: null,
    type: null
  });

  const handleImageChange = (field: 'smallImage' | 'bannerImage', file: File | null) => {
    if (!file) return;
  
    const previewUrl = URL.createObjectURL(file);
  
    // Aquí almacenamos el archivo File y la URL Blob para la vista previa
    updateData({
      ...data,
      [field]: file,  // Almacena el archivo como File
      [`${field}Preview`]: previewUrl // Solo para la vista previa
    });
  };

  const handleAcceptImage = () => {
    if (!previewModal.type || !previewModal.image) return;
  
    updateData({
      ...data,
      [`${previewModal.type}Preview`]: previewModal.image // Solo actualiza la vista previa
    });
    setPreviewModal({ show: false, image: null, type: null });
  };

  return (
    <div className="space-y-10">
      <div>
        <label htmlFor="smallImage" className="block text-sm font-medium text-gray-700 mb-4">
          Imagen de vista previa
        </label>
        <div className="space-y-4">
          {data.smallImagePreview ? (
            <div className="space-y-2">
              <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={data.smallImagePreview}
                  alt="Vista previa"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600">
                  <Check size={20} />
                  <span className="text-sm">Imagen seleccionada</span>
                </div>
                <button
                  onClick={() => updateData({ ...data, smallImage: '', smallImagePreview: '' })}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600"
                >
                  <CircleX size={20} />
                  <span className="text-sm">Eliminar imagen</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="file"
                id="smallImage"
                accept="image/*"
                onChange={(e) => handleImageChange('smallImage', e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-[var(--gris-oscuro)]
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-100 file:text-green-700
                  hover:file:bg-green-200"
              />
              <p className="text-sm text-gray-500">
                Selecciona una imagen para la vista previa del evento
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700 mb-4">
          Imagen de portada
        </label>
        <div className="space-y-4">
          {data.bannerImagePreview ? (
            <div className="space-y-2">
              <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={data.bannerImagePreview}
                  alt="Vista previa de portada"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600">
                  <Check size={20} />
                  <span className="text-sm">Imagen seleccionada</span>
                </div>
                <button
                  onClick={() => updateData({ ...data, bannerImage: '', bannerImagePreview: '' })}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600"
                >
                  <CircleX size={20} />
                  <span className="text-sm">Eliminar imagen</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="file"
                id="bannerImage"
                accept="image/*"
                onChange={(e) => handleImageChange('bannerImage', e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-[var(--gris-oscuro)]
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-100 file:text-green-700
                  hover:file:bg-green-200"
              />
              <p className="text-sm text-gray-500">
                Selecciona una imagen de portada para el evento
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de vista previa */}
      {previewModal.show && previewModal.image && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Vista previa de imagen</h3>
              <button
                onClick={() => setPreviewModal({ show: false, image: null, type: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                <CircleX size={24} />
              </button>
            </div>
            <div className="relative w-full h-96 mb-4">
              <img
                src={previewModal.image}
                alt="Vista previa"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setPreviewModal({ show: false, image: null, type: null })}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleAcceptImage}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}