import React from "react";
import { CircleX, Save } from "lucide-react";
import GeneralInfo from "../event-creation/GeneralInfo";
import EventDates from "../event-creation/EventDates";
import EventDetails from "../event-creation/EventDetails";
import EventLocation from "../event-creation/EventLocation";
import DanceInfo from "../event-creation/DanceInfo";
import EventImages from "../event-creation/EventImages";
import { EventFormData } from "@/app/types/eventType";
import { Timestamp } from "firebase/firestore";

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
        startDate: Timestamp.now(), // Inicializa con Timestamp
        endDate: Timestamp.now() // Inicializa con Timestamp
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
        levels: {},
        categories: []
    },
    images: {
        smallImage: '',
        bannerImage: ''
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
    if (!isOpen) return null;

    const getIncompleteFields = () => {
        const { general, dates, details, location, dance, images } = eventData;
        const incompleteFields = [];

        if (!general.name) incompleteFields.push('Nombre');
        if (!general.description) incompleteFields.push('Descripción');
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
        if (Object.keys(dance.levels).length === 0) incompleteFields.push('Niveles de baile');
        if (dance.categories.length === 0) incompleteFields.push('Categorías de baile');
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
        updateEventData('images', { ...initialEventData.images, smallImage: '', bannerImage: '' });
    };

    const handleSave = () => {
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
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] m-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{isEdit ? "Editar evento" : isOnlyRead ? "Evento" : "Crear nuevo evento"}</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                        <CircleX size={40} className="text-red-500 hover:text-red-600 transition-colors" />
                    </button>
                </div>
                <div className="mb-4 overflow-y-auto">
                    <div className="flex border-b">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 ${activeTab === tab.id ? "border-b-2 border-green-600 text-green-600" : "text-gray-500"}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    {activeTab === "general" && <GeneralInfo data={eventData.general} updateData={(data) => updateEventData('general', data)} isOnlyRead={isOnlyRead} />}
                    {activeTab === "dates" && <EventDates data={eventData.dates} updateData={(data) => updateEventData('dates', data)} isOnlyRead={isOnlyRead} />}
                    {activeTab === "details" && <EventDetails data={eventData.details} updateData={(data) => updateEventData('details', data)} isOnlyRead={isOnlyRead} />}
                    {activeTab === "location" && <EventLocation data={eventData.location} updateData={(data) => updateEventData('location', data)} isOnlyRead={isOnlyRead} />}
                    {activeTab === "dance" && <DanceInfo data={eventData.dance} updateData={(data) => updateEventData('dance', data)} isOnlyRead={isOnlyRead} />}
                    {activeTab === "images" && <EventImages data={eventData.images} updateData={(data) => updateEventData('images', data)} isOnlyRead={isOnlyRead} />}
                </div>
                <div className="flex justify-end">
                    {isOnlyRead ? null : (
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 flex items-center justify-between gap-2 bg-green-600 text-white rounded hover:bg-green-700"
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