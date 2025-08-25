import React, { useState, useEffect } from "react";
import { X, Upload, Camera, Image as ImageIcon } from "lucide-react";
import { Academy } from "@/app/types/academyType";

interface ImageUploadModalProps {
    academy: Academy | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (profileImage: File | null, coverImage: File | null) => Promise<void>;
    loading: boolean;
}

export default function ImageUploadModal({ 
    academy, 
    isOpen, 
    onClose, 
    onSave, 
    loading 
}: ImageUploadModalProps) {
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [profilePreview, setProfilePreview] = useState<string>('');
    const [coverPreview, setCoverPreview] = useState<string>('');

    // Efecto para resetear las vistas previas cuando cambia la academia
    useEffect(() => {
        if (academy) {
            setProfilePreview(typeof academy.profileImage === 'string' ? academy.profileImage : '');
            setCoverPreview(typeof academy.coverImage === 'string' ? academy.coverImage : '');
        }
    }, [academy]);

    const handleImageChange = (file: File | null, type: 'profile' | 'cover') => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const result = e.target?.result as string;
                if (type === 'profile') {
                    setProfilePreview(result);
                    setProfileImage(file);
                } else {
                    setCoverPreview(result);
                    setCoverImage(file);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        await onSave(profileImage, coverImage);
        handleClose();
    };

    const handleClose = () => {
        setProfileImage(null);
        setCoverImage(null);
        setProfilePreview(typeof academy?.profileImage === 'string' ? academy.profileImage : '');
        setCoverPreview(typeof academy?.coverImage === 'string' ? academy.coverImage : '');
        onClose();
    };

    if (!isOpen || !academy) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Gestionar Imágenes - {academy.name}
                    </h3>
                    <button 
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        disabled={loading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Imagen de Perfil */}
                    <div>
                        <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Imagen de Perfil
                        </h4>
                        
                        <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 text-center">
                            {profilePreview ? (
                                <div className="relative">
                                    <img 
                                        src={profilePreview} 
                                        alt="Vista previa perfil" 
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                        <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                            Cambiar
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(e.target.files?.[0] || null, 'profile')}
                                                className="hidden"
                                                disabled={loading}
                                            />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        Sube una imagen de perfil
                                    </p>
                                    <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-block">
                                        Seleccionar Imagen
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e.target.files?.[0] || null, 'profile')}
                                            className="hidden"
                                            disabled={loading}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Recomendado: 400x400px, formato JPG o PNG
                        </p>
                    </div>

                    {/* Imagen de Portada */}
                    <div>
                        <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Imagen de Portada
                        </h4>
                        
                        <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 text-center">
                            {coverPreview ? (
                                <div className="relative">
                                    <img 
                                        src={coverPreview} 
                                        alt="Vista previa portada" 
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                        <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                            Cambiar
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(e.target.files?.[0] || null, 'cover')}
                                                className="hidden"
                                                disabled={loading}
                                            />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        Sube una imagen de portada
                                    </p>
                                    <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-block">
                                        Seleccionar Imagen
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e.target.files?.[0] || null, 'cover')}
                                            className="hidden"
                                            disabled={loading}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Recomendado: 1200x600px, formato JPG o PNG
                        </p>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-slate-600">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || (!profileImage && !coverImage)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                        {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>

                {/* Información adicional */}
                {(profileImage || coverImage) && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            <strong>Cambios pendientes:</strong>
                            {profileImage && ' Imagen de perfil'}
                            {profileImage && coverImage && ' y'}
                            {coverImage && ' Imagen de portada'}
                            {' será'}{(profileImage && coverImage) ? 'n' : ''} actualizada{(profileImage && coverImage) ? 's' : ''}.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}