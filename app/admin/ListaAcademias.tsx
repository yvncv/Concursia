import React, { useState, useEffect } from "react";
import useAcademies from "@/app/hooks/useAcademies";
import useAssignOrganizer from "@/app/hooks/useAssignOrganizer";
import { useEditAcademy } from "@/app/hooks/academy/useEditAcademy";
import { Academy } from "@/app/types/academyType";
import { Timestamp } from "firebase/firestore";
import { Plus, Edit2, Trash2, Eye, X, Check, AlertCircle, UserPlus, Camera } from "lucide-react";
import ImageUploadModal from "./ImageUploadModal";

export default function ListaAcademias() {
    const { academies, loadingAcademies, errorAcademies, saveAcademy, deleteAcademy, updateAcademy } = useAcademies();
    const { assignOrganizerToAcademy, validateUserId, loading: assignLoading, error: assignError, clearError } = useAssignOrganizer();
    const { updateAcademyImages, loading: imageLoading, error: imageError } = useEditAcademy();
    
    const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingAcademy, setEditingAcademy] = useState<Academy | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageEditingAcademy, setImageEditingAcademy] = useState<Academy | null>(null);
    
    // Estados para la validación de organizador
    const [validatingUser, setValidatingUser] = useState(false);
    const [userValidation, setUserValidation] = useState<{
        isValid: boolean;
        message: string;
        userData?: any;
    } | null>(null);

    // Estado para el formulario de creación/edición
    const [formData, setFormData] = useState({
        organizerId: '',
        name: '',
        email: '',
        phoneNumber: '',
        description: '',
        website: '',
        location: {
            street: '',
            district: '',
            province: '',
            department: '',
            placeName: '',
            coordinates: {
                latitude: '',
                longitude: ''
            }
        },
        socialMedia: {
            facebook: '',
            instagram: '',
            tiktok: '',
            youtube: '',
            whatsapp: '',
            twitter: ''
        }
    });

    const resetForm = () => {
        setFormData({
            organizerId: '',
            name: '',
            email: '',
            phoneNumber: '',
            description: '',
            website: '',
            location: {
                street: '',
                district: '',
                province: '',
                department: '',
                placeName: '',
                coordinates: {
                    latitude: '',
                    longitude: ''
                }
            },
            socialMedia: {
                facebook: '',
                instagram: '',
                tiktok: '',
                youtube: '',
                whatsapp: '',
                twitter: ''
            }
        });
        setUserValidation(null);
        clearError();
    };

    const handleInputChange = (field: string, value: string) => {
        if (field.includes('.')) {
            const keys = field.split('.');
            setFormData(prev => {
                const newData = { ...prev };
                let current: any = newData;
                
                for (let i = 0; i < keys.length - 1; i++) {
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
                return newData;
            });
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }

        // Si cambia el organizerId, limpiar validación anterior
        if (field === 'organizerId') {
            setUserValidation(null);
            clearError();
        }
    };

    // Validar usuario en tiempo real
    const handleOrganizerIdValidation = async (userId: string) => {
        if (!userId.trim()) {
            setUserValidation(null);
            return;
        }

        setValidatingUser(true);
        try {
            const validation = await validateUserId(userId);
            setUserValidation({
                isValid: validation.exists && validation.canBeOrganizer,
                message: validation.message,
                userData: validation.userData
            });
        } catch (error) {
            setUserValidation({
                isValid: false,
                message: 'Error al validar usuario'
            });
        } finally {
            setValidatingUser(false);
        }
    };

    // Debounce para la validación
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formData.organizerId.trim()) {
                handleOrganizerIdValidation(formData.organizerId);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.organizerId]);

    const handleCreateAcademy = async () => {
        try {
            const academyData = {
                ...formData,
                organizerId: formData.organizerId.trim() || 'SIN_ASIGNAR',
                profileImage: '',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const savedAcademy = await saveAcademy(academyData);
            
            // Si se asignó un organizador, actualizar el usuario
            if (formData.organizerId.trim() && userValidation?.isValid && savedAcademy) {
                const assignResult = await assignOrganizerToAcademy(
                    formData.organizerId.trim(),
                    savedAcademy.id,
                    formData.name
                );
                
                if (assignResult.success) {
                    alert(`Academia creada exitosamente y organizador asignado: ${assignResult.message}`);
                } else {
                    alert(`Academia creada, pero hubo un error al asignar el organizador: ${assignResult.message}`);
                }
            } else {
                alert('Academia creada exitosamente.');
            }
            
            setShowCreateForm(false);
            resetForm();
        } catch (error) {
            console.error('Error creando academia:', error);
            alert('Error al crear la academia');
        }
    };

    const handleEditAcademy = (academy: Academy) => {
        setEditingAcademy(academy);
        setFormData({
            organizerId: academy.organizerId === 'SIN_ASIGNAR' ? '' : academy.organizerId,
            name: academy.name,
            email: Array.isArray(academy.email) ? academy.email.join(', ') : academy.email,
            phoneNumber: Array.isArray(academy.phoneNumber) ? academy.phoneNumber.join(', ') : academy.phoneNumber,
            description: academy.description || '',
            website: academy.website || '',
            location: academy.location,
            socialMedia: {
                facebook: academy.socialMedia?.facebook || '',
                instagram: academy.socialMedia?.instagram || '',
                tiktok: academy.socialMedia?.tiktok || '',
                youtube: academy.socialMedia?.youtube || '',
                whatsapp: academy.socialMedia?.whatsapp || '',
                twitter: academy.socialMedia?.twitter || ''
            }
        });
        setShowEditForm(true);
    };

    const handleUpdateAcademy = async () => {
        if (!editingAcademy) return;

        try {
            const newOrganizerId = formData.organizerId.trim() || 'SIN_ASIGNAR';
            const oldOrganizerId = editingAcademy.organizerId;
            
            const updateData = {
                ...formData,
                organizerId: newOrganizerId,
                email: formData.email.includes(',') ? formData.email.split(',').map(e => e.trim()) : formData.email,
                phoneNumber: formData.phoneNumber.includes(',') ? formData.phoneNumber.split(',').map(p => p.trim()) : formData.phoneNumber
            };

            await updateAcademy(editingAcademy.id, updateData);

            // Si cambió el organizador, manejar la asignación
            if (oldOrganizerId !== newOrganizerId) {
                if (newOrganizerId !== 'SIN_ASIGNAR' && userValidation?.isValid) {
                    const assignResult = await assignOrganizerToAcademy(
                        newOrganizerId,
                        editingAcademy.id,
                        formData.name
                    );
                    
                    if (assignResult.success) {
                        alert(`Academia actualizada exitosamente y nuevo organizador asignado: ${assignResult.message}`);
                    } else {
                        alert(`Academia actualizada, pero hubo un error al asignar el organizador: ${assignResult.message}`);
                    }
                } else {
                    alert('Academia actualizada exitosamente');
                }
            } else {
                alert('Academia actualizada exitosamente');
            }
            
            setShowEditForm(false);
            setEditingAcademy(null);
            resetForm();
        } catch (error) {
            console.error('Error actualizando academia:', error);
            alert('Error al actualizar la academia');
        }
    };

    const handleDeleteAcademy = async (id: string, name: string) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la academia "${name}"?`)) {
            const success = await deleteAcademy(id);
            if (success) {
                alert('Academia eliminada exitosamente');
            }
        }
    };

    const handleImageEdit = (academy: Academy) => {
        setImageEditingAcademy(academy);
        setShowImageModal(true);
    };

    const handleImageSave = async (profileImage: File | null, coverImage: File | null) => {
        if (!imageEditingAcademy || (!profileImage && !coverImage)) return;

        try {
            await updateAcademyImages(
                imageEditingAcademy.id,
                profileImage || undefined,
                coverImage || undefined,
                typeof imageEditingAcademy.profileImage === 'string' ? imageEditingAcademy.profileImage : undefined,
                typeof imageEditingAcademy.coverImage === 'string' ? imageEditingAcademy.coverImage : undefined
            );
            
            alert('Imágenes actualizadas exitosamente');
            setShowImageModal(false);
            setImageEditingAcademy(null);
        } catch (error) {
            console.error('Error actualizando imágenes:', error);
            alert(`Error al actualizar las imágenes: ${imageError || 'Error desconocido'}`);
        }
    };

    const exportToCSV = () => {
        const exportData = academies.map(academy => ({
            id: academy.id,
            nombre: academy.name,
            organizador: academy.organizerId === 'SIN_ASIGNAR' ? 'Sin asignar' : academy.organizerId,
            email: Array.isArray(academy.email) ? academy.email.join('; ') : academy.email,
            telefono: Array.isArray(academy.phoneNumber) ? academy.phoneNumber.join('; ') : academy.phoneNumber,
            departamento: academy.location.department,
            provincia: academy.location.province,
            distrito: academy.location.district,
            direccion: academy.location.street,
            lugar: academy.location.placeName,
            website: academy.website || 'N/A',
            descripcion: academy.description || 'N/A',
            fechaCreacion: academy.createdAt.toDate().toLocaleDateString()
        }));

        const headers = ['ID', 'Nombre', 'Organizador', 'Email', 'Teléfono', 'Departamento', 'Provincia', 'Distrito', 'Dirección', 'Lugar', 'Website', 'Descripción', 'Fecha Creación'];
        const csvContent = [
            headers.join(','),
            ...exportData.map(row => [
                row.id,
                `"${row.nombre}"`,
                row.organizador,
                `"${row.email}"`,
                `"${row.telefono}"`,
                `"${row.departamento}"`,
                `"${row.provincia}"`,
                `"${row.distrito}"`,
                `"${row.direccion}"`,
                `"${row.lugar}"`,
                `"${row.website}"`,
                `"${row.descripcion}"`,
                row.fechaCreacion
            ].join(','))
        ].join('\n');

        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `academias_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lista de Academias</h2>
                <div className="flex gap-3">
                    {!loadingAcademies && !errorAcademies && academies.length > 0 && (
                        <button
                            onClick={exportToCSV}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Exportar CSV
                        </button>
                    )}
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Crear Academia
                    </button>
                </div>
            </div>
            
            {loadingAcademies ? (
                <p className="text-gray-500 dark:text-gray-300">Cargando academias...</p>
            ) : errorAcademies ? (
                <p className="text-red-500">{errorAcademies}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-blue-100 dark:bg-blue-900">
                                <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Nombre</th>
                                <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Organizador</th>
                                <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Email</th>
                                <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Ubicación</th>
                                <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {academies.map((academy, idx) => (
                                <tr
                                    key={academy.id}
                                    className={idx % 2 === 0 ? "bg-gray-50 dark:bg-slate-700" : "bg-white dark:bg-slate-800"}
                                >
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">{academy.name}</td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                        {academy.organizerId === 'SIN_ASIGNAR' ? (
                                            <span className="text-orange-500 font-medium">Sin asignar</span>
                                        ) : (
                                            <span className="text-green-600 font-medium">{academy.organizerId}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                        {Array.isArray(academy.email) ? academy.email[0] : academy.email}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                        {academy.location.district}, {academy.location.province}
                                    </td>
                                    <td className="px-4 py-2 flex gap-2">
                                        <button
                                            onClick={() => setSelectedAcademy(academy)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg text-sm transition-colors"
                                            title="Ver detalles"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleImageEdit(academy)}
                                            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg text-sm transition-colors"
                                            title="Gestionar imágenes"
                                            disabled={imageLoading}
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEditAcademy(academy)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg text-sm transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAcademy(academy.id, academy.name)}
                                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg text-sm transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para ver detalles */}
            {selectedAcademy && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detalles de {selectedAcademy.name}</h3>
                            <button onClick={() => setSelectedAcademy(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-3 text-sm text-gray-900 dark:text-gray-100">
                            <p><strong>ID:</strong> {selectedAcademy.id}</p>
                            <p><strong>Organizador:</strong> {selectedAcademy.organizerId === 'SIN_ASIGNAR' ? <span className="text-orange-500">Sin asignar</span> : <span className="text-green-600">{selectedAcademy.organizerId}</span>}</p>
                            <p><strong>Email:</strong> {Array.isArray(selectedAcademy.email) ? selectedAcademy.email.join(', ') : selectedAcademy.email}</p>
                            <p><strong>Teléfono:</strong> {Array.isArray(selectedAcademy.phoneNumber) ? selectedAcademy.phoneNumber.join(', ') : selectedAcademy.phoneNumber}</p>
                            <p><strong>Descripción:</strong> {selectedAcademy.description || 'No especificada'}</p>
                            <p><strong>Website:</strong> {selectedAcademy.website ? <a href={selectedAcademy.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedAcademy.website}</a> : 'No especificado'}</p>
                            <div>
                                <strong>Ubicación:</strong>
                                <p className="ml-4">{selectedAcademy.location.street}</p>
                                <p className="ml-4">{selectedAcademy.location.district}, {selectedAcademy.location.province}, {selectedAcademy.location.department}</p>
                                <p className="ml-4">Lugar: {selectedAcademy.location.placeName}</p>
                                <p className="ml-4">Coordenadas: {selectedAcademy.location.coordinates.latitude}, {selectedAcademy.location.coordinates.longitude}</p>
                            </div>
                            <div>
                                <strong>Redes Sociales:</strong>
                                <div className="ml-4 space-y-1">
                                    {selectedAcademy.socialMedia?.facebook && <p>Facebook: <a href={selectedAcademy.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedAcademy.socialMedia.facebook}</a></p>}
                                    {selectedAcademy.socialMedia?.instagram && <p>Instagram: <a href={selectedAcademy.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedAcademy.socialMedia.instagram}</a></p>}
                                    {selectedAcademy.socialMedia?.tiktok && <p>TikTok: <a href={selectedAcademy.socialMedia.tiktok} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedAcademy.socialMedia.tiktok}</a></p>}
                                    {selectedAcademy.socialMedia?.youtube && <p>YouTube: <a href={selectedAcademy.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedAcademy.socialMedia.youtube}</a></p>}
                                    {selectedAcademy.socialMedia?.whatsapp && <p>WhatsApp: <a href={selectedAcademy.socialMedia.whatsapp} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedAcademy.socialMedia.whatsapp}</a></p>}
                                    {selectedAcademy.socialMedia?.twitter && <p>Twitter: <a href={selectedAcademy.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedAcademy.socialMedia.twitter}</a></p>}
                                    {!selectedAcademy.socialMedia || (!selectedAcademy.socialMedia.facebook && !selectedAcademy.socialMedia.instagram && !selectedAcademy.socialMedia.tiktok && !selectedAcademy.socialMedia.youtube && !selectedAcademy.socialMedia.whatsapp && !selectedAcademy.socialMedia.twitter) && <p className="text-gray-500">No hay redes sociales registradas</p>}
                                </div>
                            </div>
                            <div>
                                <strong>Imágenes:</strong>
                                <div className="ml-4 space-y-2 mt-2">
                                    {selectedAcademy.profileImage && typeof selectedAcademy.profileImage === 'string' && (
                                        <div>
                                            <p className="text-sm">Imagen de perfil:</p>
                                            <img 
                                                src={selectedAcademy.profileImage} 
                                                alt="Perfil" 
                                                className="w-20 h-20 object-cover rounded-lg border"
                                            />
                                        </div>
                                    )}
                                    {selectedAcademy.coverImage && typeof selectedAcademy.coverImage === 'string' && (
                                        <div>
                                            <p className="text-sm">Imagen de portada:</p>
                                            <img 
                                                src={selectedAcademy.coverImage} 
                                                alt="Portada" 
                                                className="w-32 h-16 object-cover rounded-lg border"
                                            />
                                        </div>
                                    )}
                                    {(!selectedAcademy.profileImage || typeof selectedAcademy.profileImage !== 'string') && 
                                     (!selectedAcademy.coverImage || typeof selectedAcademy.coverImage !== 'string') && (
                                        <p className="text-gray-500">No hay imágenes cargadas</p>
                                    )}
                                </div>
                            </div>
                            <p><strong>Creada:</strong> {selectedAcademy.createdAt.toDate().toLocaleString()}</p>
                            <p><strong>Actualizada:</strong> {selectedAcademy.updatedAt.toDate().toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para crear/editar academia */}
            {(showCreateForm || showEditForm) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {showCreateForm ? 'Crear Nueva Academia' : 'Editar Academia'}
                            </h3>
                            <button 
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setShowEditForm(false);
                                    setEditingAcademy(null);
                                    resetForm();
                                }} 
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    ID del Organizador
                                    {showCreateForm && <span className="text-gray-500 text-xs"> (opcional)</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.organizerId}
                                        onChange={(e) => handleInputChange('organizerId', e.target.value)}
                                        placeholder={showCreateForm ? "Dejar vacío para 'Sin asignar'" : "ID del organizador"}
                                        className={`w-full border rounded-lg px-3 py-2 pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors ${
                                            validatingUser ? 'border-blue-300 dark:border-blue-500' : 
                                            userValidation?.isValid === true ? 'border-green-500' :
                                            userValidation?.isValid === false ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                                        }`}
                                        disabled={assignLoading}
                                    />
                                    
                                    {/* Indicadores de estado */}
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        {validatingUser && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                        )}
                                        {!validatingUser && userValidation?.isValid === true && (
                                            <Check className="h-4 w-4 text-green-500" />
                                        )}
                                        {!validatingUser && userValidation?.isValid === false && (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                </div>
                                
                                {/* Mensaje de validación */}
                                {userValidation && (
                                    <p className={`text-xs mt-1 ${userValidation.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {userValidation.message}
                                    </p>
                                )}
                                
                                {/* Información del usuario validado */}
                                {userValidation?.isValid && userValidation.userData && (
                                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <UserPlus className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-green-700 dark:text-green-400">
                                                {userValidation.userData.firstName} {userValidation.userData.lastName}
                                            </span>
                                        </div>
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                            Email: {Array.isArray(userValidation.userData.email) ? 
                                                userValidation.userData.email[0] : userValidation.userData.email}
                                        </p>
                                    </div>
                                )}
                                
                                {/* Error de asignación */}
                                {assignError && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                        Error de asignación: {assignError}
                                    </p>
                                )}
                                
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {showCreateForm 
                                        ? "Si se deja vacío, se asignará automáticamente como 'Sin asignar'"
                                        : "Al cambiar el organizador, se actualizará automáticamente el rol del usuario"
                                    }
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nombre*</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email*</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="email@ejemplo.com o múltiples separados por comas"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Teléfono*</label>
                                <input
                                    type="text"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="123456789 o múltiples separados por comas"
                                    required
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Descripción de la academia"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Website</label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://ejemplo.com"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Calle*</label>
                                <input
                                    type="text"
                                    value={formData.location.street}
                                    onChange={(e) => handleInputChange('location.street', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Distrito*</label>
                                <input
                                    type="text"
                                    value={formData.location.district}
                                    onChange={(e) => handleInputChange('location.district', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Provincia*</label>
                                <input
                                    type="text"
                                    value={formData.location.province}
                                    onChange={(e) => handleInputChange('location.province', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Departamento*</label>
                                <input
                                    type="text"
                                    value={formData.location.department}
                                    onChange={(e) => handleInputChange('location.department', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nombre del Lugar*</label>
                                <input
                                    type="text"
                                    value={formData.location.placeName}
                                    onChange={(e) => handleInputChange('location.placeName', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Latitud*</label>
                                <input
                                    type="text"
                                    value={formData.location.coordinates.latitude}
                                    onChange={(e) => handleInputChange('location.coordinates.latitude', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="-12.0464"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Longitud*</label>
                                <input
                                    type="text"
                                    value={formData.location.coordinates.longitude}
                                    onChange={(e) => handleInputChange('location.coordinates.longitude', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="-77.0428"
                                    required
                                />
                            </div>
                            
                            {/* Redes Sociales */}
                            <div className="md:col-span-2">
                                <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Redes Sociales (Opcional)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                        type="url"
                                        placeholder="Facebook URL"
                                        value={formData.socialMedia.facebook}
                                        onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                                        className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="url"
                                        placeholder="Instagram URL"
                                        value={formData.socialMedia.instagram}
                                        onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                                        className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="url"
                                        placeholder="TikTok URL"
                                        value={formData.socialMedia.tiktok}
                                        onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                                        className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="url"
                                        placeholder="YouTube URL"
                                        value={formData.socialMedia.youtube}
                                        onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
                                        className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="url"
                                        placeholder="WhatsApp URL"
                                        value={formData.socialMedia.whatsapp}
                                        onChange={(e) => handleInputChange('socialMedia.whatsapp', e.target.value)}
                                        className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="url"
                                        placeholder="Twitter URL"
                                        value={formData.socialMedia.twitter}
                                        onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                                        className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setShowEditForm(false);
                                    setEditingAcademy(null);
                                    resetForm();
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
                                disabled={assignLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={showCreateForm ? handleCreateAcademy : handleUpdateAcademy}
                                disabled={assignLoading || (formData.organizerId.trim() && !userValidation?.isValid)}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                            >
                                {assignLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                                {showCreateForm ? 'Crear Academia' : 'Actualizar Academia'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para gestionar imágenes */}
            <ImageUploadModal
                academy={imageEditingAcademy}
                isOpen={showImageModal}
                onClose={() => {
                    setShowImageModal(false);
                    setImageEditingAcademy(null);
                }}
                onSave={handleImageSave}
                loading={imageLoading}
            />
        </div>
    );
}