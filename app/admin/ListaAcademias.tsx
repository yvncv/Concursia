import React, { useState } from "react";
import useAcademies from "@/app/hooks/useAcademies";
import { Academy } from "@/app/types/academyType";
import { Timestamp } from "firebase/firestore";
import { Plus, Edit2, Trash2, Eye, X } from "lucide-react";

export default function ListaAcademias() {
    const { academies, loadingAcademies, errorAcademies, saveAcademy, deleteAcademy, updateAcademy } = useAcademies();
    const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingAcademy, setEditingAcademy] = useState<Academy | null>(null);

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
            organizerId: 'SIN_ASIGNAR', // Valor temporal hasta que se asigne un organizador real
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
    };

    const handleCreateAcademy = async () => {
        try {
            const academyData = {
                ...formData,
                organizerId: 'SIN_ASIGNAR', // Se asignará después cuando el organizador cree su cuenta
                profileImage: '', // Inicializar como string vacío
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            await saveAcademy(academyData);
            alert('Academia creada exitosamente. El organizador se asignará cuando cree su cuenta.');
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
            organizerId: academy.organizerId,
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
            const updateData = {
                ...formData,
                email: formData.email.includes(',') ? formData.email.split(',').map(e => e.trim()) : formData.email,
                phoneNumber: formData.phoneNumber.includes(',') ? formData.phoneNumber.split(',').map(p => p.trim()) : formData.phoneNumber
            };

            await updateAcademy(editingAcademy.id, updateData);
            alert('Academia actualizada exitosamente');
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
                                        academy.organizerId
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
                            <button onClick={() => setSelectedAcademy(null)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <p><strong>ID:</strong> {selectedAcademy.id}</p>
                            <p><strong>Organizador:</strong> {selectedAcademy.organizerId === 'SIN_ASIGNAR' ? <span className="text-orange-500">Sin asignar</span> : selectedAcademy.organizerId}</p>
                            <p><strong>Email:</strong> {Array.isArray(selectedAcademy.email) ? selectedAcademy.email.join(', ') : selectedAcademy.email}</p>
                            <p><strong>Teléfono:</strong> {Array.isArray(selectedAcademy.phoneNumber) ? selectedAcademy.phoneNumber.join(', ') : selectedAcademy.phoneNumber}</p>
                            <p><strong>Descripción:</strong> {selectedAcademy.description || 'No especificada'}</p>
                            <p><strong>Website:</strong> {selectedAcademy.website || 'No especificado'}</p>
                            <div>
                                <strong>Ubicación:</strong>
                                <p className="ml-4">{selectedAcademy.location.street}</p>
                                <p className="ml-4">{selectedAcademy.location.district}, {selectedAcademy.location.province}, {selectedAcademy.location.department}</p>
                                <p className="ml-4">Lugar: {selectedAcademy.location.placeName}</p>
                                <p className="ml-4">Coordenadas: {selectedAcademy.location.coordinates.latitude}, {selectedAcademy.location.coordinates.longitude}</p>
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
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-500">ID del Organizador (se asignará después)</label>
                                <input
                                    type="text"
                                    value="SIN_ASIGNAR"
                                    disabled
                                    className="w-full border rounded-lg px-3 py-2 bg-gray-100 dark:bg-slate-600 dark:border-slate-600 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">El organizador se asignará cuando cree su cuenta</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre*</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Email*</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    placeholder="email@ejemplo.com o múltiples separados por comas"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Teléfono*</label>
                                <input
                                    type="text"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    placeholder="123456789 o múltiples separados por comas"
                                    required
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    rows={3}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Website</label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Calle*</label>
                                <input
                                    type="text"
                                    value={formData.location.street}
                                    onChange={(e) => handleInputChange('location.street', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Distrito*</label>
                                <input
                                    type="text"
                                    value={formData.location.district}
                                    onChange={(e) => handleInputChange('location.district', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Provincia*</label>
                                <input
                                    type="text"
                                    value={formData.location.province}
                                    onChange={(e) => handleInputChange('location.province', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Departamento*</label>
                                <input
                                    type="text"
                                    value={formData.location.department}
                                    onChange={(e) => handleInputChange('location.department', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre del Lugar*</label>
                                <input
                                    type="text"
                                    value={formData.location.placeName}
                                    onChange={(e) => handleInputChange('location.placeName', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Latitud*</label>
                                <input
                                    type="text"
                                    value={formData.location.coordinates.latitude}
                                    onChange={(e) => handleInputChange('location.coordinates.latitude', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Longitud*</label>
                                <input
                                    type="text"
                                    value={formData.location.coordinates.longitude}
                                    onChange={(e) => handleInputChange('location.coordinates.longitude', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    required
                                />
                            </div>
                            
                            {/* Redes Sociales */}
                            <div className="md:col-span-2">
                                <h4 className="font-medium mb-2">Redes Sociales (Opcional)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                        type="url"
                                        placeholder="Facebook"
                                        value={formData.socialMedia.facebook}
                                        onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                                        className="border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    />
                                    <input
                                        type="url"
                                        placeholder="Instagram"
                                        value={formData.socialMedia.instagram}
                                        onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                                        className="border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    />
                                    <input
                                        type="url"
                                        placeholder="TikTok"
                                        value={formData.socialMedia.tiktok}
                                        onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                                        className="border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    />
                                    <input
                                        type="url"
                                        placeholder="YouTube"
                                        value={formData.socialMedia.youtube}
                                        onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
                                        className="border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    />
                                    <input
                                        type="url"
                                        placeholder="WhatsApp"
                                        value={formData.socialMedia.whatsapp}
                                        onChange={(e) => handleInputChange('socialMedia.whatsapp', e.target.value)}
                                        className="border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
                                    />
                                    <input
                                        type="url"
                                        placeholder="Twitter"
                                        value={formData.socialMedia.twitter}
                                        onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                                        className="border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
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
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-slate-600 dark:hover:bg-slate-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={showCreateForm ? handleCreateAcademy : handleUpdateAcademy}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                            >
                                {showCreateForm ? 'Crear Academia' : 'Actualizar Academia'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}