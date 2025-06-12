import React, { useEffect, useState } from "react";
import { CircleX, Save, AlertTriangle } from "lucide-react";
import GeneralInfo from "../event-creation/GeneralInfo";
import EventDates from "../event-creation/EventDates";
import EventDetails from "../event-creation/EventDetails";
import EventLocation from "../event-creation/EventLocation";
import DanceInfo from "../event-creation/DanceInfo";
import EventImages from "../event-creation/EventImages";
import { EventFormData } from "@/app/types/eventType";
import { Timestamp } from "firebase/firestore";
import { fetchUbigeoINEI, Ubigeo } from "@/app/ubigeo/ubigeoService";
import { useEventCreation } from "@/app/hooks/useEventCreation";

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    eventData: EventFormData;
    updateEventData: <K extends keyof EventFormData>(section: K, data: Partial<EventFormData[K]>) => void;
    isEdit?: boolean;
    isOnlyRead?: boolean;
}

const initialEventData: EventFormData = {
    general: {
        name: '',
        description: '',
        status: ''
    },
    dates: {
        startDate: Timestamp.now(),
        endDate: Timestamp.now()
    },
    details: {
        capacity: '',
        eventType: ''
    },
    location: {
        latitude: '',
        longitude: '',
        department: '',
        district: '',
        placeName: '',
        province: '',
        street: ''
    },
    dance: {
        levels: {}
    },
    images: {
        smallImage: '',
        bannerImage: ''
    },
    settings: {
        inscription: {
            groupEnabled: false,
            individualEnabled: false,
            onSiteEnabled: false,
        },
        registration: {
            grupalCSV: false,
            individualWeb: false,
            sameDay: false
        },
        pullCouple: {
            enabled: false,
            criteria: "Category",
            difference: 0
        }
    }
};

const EventModal: React.FC<EventModalProps> = ({
    isOpen,
    onClose,
    onSave,
    activeTab,
    setActiveTab,
    eventData,
    updateEventData,
    isEdit = false,
    isOnlyRead = false,
}) => {
    const [ubigeoData, setUbigeoData] = useState<Ubigeo[]>([]);

    // Hook para verificar estado de configuración global
    const {
        globalConfigLoading,
        globalConfigError
    } = useEventCreation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data: Ubigeo[] = await fetchUbigeoINEI();
                setUbigeoData(data);
            } catch (error) {
                console.error("Error al cargar los datos de Ubigeo:", error);
            }
        };

        fetchData();
    }, []);

    if (!isOpen) return null;

    // Error crítico de configuración global
    if (globalConfigError) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
                    <div className="text-red-600 mb-4">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                        <h3 className="text-lg font-medium">Error de Configuración Global</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                        No se puede abrir el formulario de eventos porque hay un error en la configuración de Firebase:
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                        <p className="text-sm text-red-700 font-mono">
                            {globalConfigError}
                        </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Por favor, verifica la configuración en Firebase Console:
                        <br />
                        <code>globalSettings/levels</code>
                        <br />
                        <code>globalSettings/categories</code>
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    const {
        latitude,
        longitude,
        department,
        province,
        district,
        placeName,
        street
    } = eventData.location;

    const departmentCode = String(department).padStart(2, "0");
    const provinceCode = String(province).padStart(2, "0");
    const districtCode = String(district).padStart(2, "0");

    const departmentName = ubigeoData.find(
        item => item.departamento === departmentCode &&
            item.provincia === "00" &&
            item.distrito === "00"
    )?.nombre ?? departmentCode;

    const provinceName = ubigeoData.find(
        item => item.departamento === departmentCode &&
            item.provincia === provinceCode &&
            item.distrito === "00"
    )?.nombre ?? provinceCode;

    const districtName = ubigeoData.find(
        item => item.departamento === departmentCode &&
            item.provincia === provinceCode &&
            item.distrito === districtCode
    )?.nombre ?? districtCode;

    const locationWithNames = {
        latitude,
        longitude,
        department: departmentCode,
        province: provinceCode,
        district: districtCode,
        placeName,
        street,
        departmentName,
        provinceName,
        districtName
    };

    // Validación básica (la validación completa está en useEventCreation)
    const getIncompleteFields = () => {
        const { general, dates, details, location, dance, images } = eventData;
        const incompleteFields = [];

        if (!general.name) incompleteFields.push('Nombre');
        if (!general.description) incompleteFields.push('Descripción');
        if (!general.status) incompleteFields.push('Estado');
        if (!dates.startDate) incompleteFields.push('Fecha de inicio');
        if (!dates.endDate) incompleteFields.push('Fecha de fin');
        if (!details.capacity) incompleteFields.push('Capacidad');
        if (!details.eventType) incompleteFields.push('Tipo de evento');
        if (!location.latitude) incompleteFields.push('Latitud');
        if (!location.longitude) incompleteFields.push('Longitud');
        if (!location.department) incompleteFields.push('Departamento');
        if (!location.district) incompleteFields.push('Distrito');
        if (!location.placeName) incompleteFields.push('Nombre del lugar');
        if (!location.province) incompleteFields.push('Provincia');
        if (!location.street) incompleteFields.push('Calle');

        const selectedLevels = Object.entries(dance.levels).filter(([_, data]) => data.selected);
        if (selectedLevels.length === 0) {
            incompleteFields.push('Niveles de baile');
        } else {
            for (const [levelId, levelData] of selectedLevels) {
                if (!levelData.categories || levelData.categories.length === 0) {
                    incompleteFields.push(`Categorías para ${levelId}`);
                }
            }
        }

        if (!images.smallImage) incompleteFields.push('Imagen pequeña');
        if (!images.bannerImage) incompleteFields.push('Imagen de portada');

        return incompleteFields;
    };

    const resetEventDataValues = () => {
        updateEventData('general', initialEventData.general);
        updateEventData('dates', initialEventData.dates);
        updateEventData('details', initialEventData.details);
        updateEventData('location', initialEventData.location);
        updateEventData('dance', initialEventData.dance);
        updateEventData('images', { ...initialEventData.images, smallImage: '', bannerImage: '', smallImagePreview: '', bannerImagePreview: ''});
        updateEventData('settings', initialEventData.settings);
    };

    const handleSave = () => {
        // Verificar estado de configuración global antes de validar
        if (globalConfigLoading) {
            alert("Esperando carga de configuración global. Por favor, espera un momento.");
            return;
        }

        if (globalConfigError) {
            alert(`Error de configuración: ${globalConfigError}`);
            return;
        }

        const incompleteFields = getIncompleteFields();
        if (incompleteFields.length > 0) {
            alert(`Por favor, completa los siguientes campos: ${incompleteFields.join(', ')}`);
            return;
        }

        onSave();
        resetEventDataValues();
    };

    const handleClose = () => {
        resetEventDataValues();
        onClose();
    };

    const tabs = [
        { id: "general", label: "General" },
        { id: "dates", label: "Días" },
        { id: "details", label: "Detalles" },
        { id: "location", label: "Ubicación" },
        { id: "dance", label: "Categoría/Niveles" },
        { id: "images", label: "Imágenes" },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[85vh] m-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">
                            {isEdit ? "Editar evento" : isOnlyRead ? "Evento" : "Crear nuevo evento"}
                        </h2>
                        {globalConfigLoading && (
                            <p className="text-sm text-orange-600 mt-1">
                                Cargando configuración...
                            </p>
                        )}
                    </div>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                        <CircleX size={40} className="text-red-500 hover:text-red-600 transition-colors" />
                    </button>
                </div>

                {/* Advertencia si hay problemas de configuración */}
                {globalConfigLoading && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <p className="text-sm text-blue-800">
                            Cargando configuración del sistema. Algunas funciones pueden estar temporalmente limitadas.
                        </p>
                    </div>
                )}

                <div className="mb-6">
                    <div className="flex bg-gray-50 rounded-lg p-1 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2.5 whitespace-nowrap flex items-center gap-2 rounded-md font-medium text-sm transition-all duration-200 ${activeTab === tab.id
                                        ? "bg-white text-green-600 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    }`}
                                disabled={globalConfigLoading && tab.id === 'dance'}
                            >
                                {tab.label}
                                {globalConfigLoading && tab.id === 'dance' && (
                                    <span className="text-xs text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                                        Cargando
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    {activeTab === "general" && (
                        <GeneralInfo
                            data={eventData.general}
                            updateData={(data) => updateEventData('general', data)}
                            isOnlyRead={isOnlyRead}
                        />
                    )}
                    {activeTab === "dates" && (
                        <EventDates
                            data={eventData.dates}
                            updateData={(data) => updateEventData('dates', data)}
                            isOnlyRead={isOnlyRead}
                        />
                    )}
                    {activeTab === "details" && (
                        <EventDetails
                            data={eventData.details}
                            updateData={(data) => updateEventData('details', data)}
                            isOnlyRead={isOnlyRead}
                        />
                    )}
                    {activeTab === "location" && (
                        <EventLocation
                            data={locationWithNames}
                            updateData={(data) => updateEventData('location', data)}
                            isOnlyRead={isOnlyRead}
                        />
                    )}
                    {activeTab === "dance" && (
                        <DanceInfo
                            data={eventData.dance}
                            updateData={(data) => updateEventData('dance', data)}
                            isOnlyRead={isOnlyRead}
                        />
                    )}
                    {activeTab === "images" && (
                        <EventImages
                            data={eventData.images}
                            updateData={(data) => updateEventData('images', data)}
                            isOnlyRead={isOnlyRead}
                        />
                    )}
                </div>

                <div className="flex justify-end">
                    {isOnlyRead ? null : (
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 flex items-center justify-between gap-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={globalConfigLoading}
                        >
                            <Save size={20} />
                            {isEdit ? "Guardar cambios" : "Guardar Evento"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventModal;