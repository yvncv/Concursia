import React from "react";
import { CircleX, Save } from "lucide-react";
import GeneralInfo from "../event-creation/GeneralInfo";
import EventDates from "../event-creation/EventDates";
import EventDetails from "../event-creation/EventDetails";
import EventLocation from "../event-creation/EventLocation";
import DanceInfo from "../event-creation/DanceInfo";
import EventImages from "../event-creation/EventImages";

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    eventData: any;
    updateEventData: (section: string, data: any) => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> =
    ({
         isOpen,
         onClose,
         onSave,
         activeTab,
         setActiveTab,
         eventData,
         updateEventData,

     }) => {
    if (!isOpen) return null;

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
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[70vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Crear nuevo evento</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <CircleX size={40} className="text-red-500 hover:text-red-600 transition-colors" />
                    </button>
                </div>
                <div className="mb-4">
                    <div className="flex border-b">
                        {tabs.map((tab) =>
                            (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 ${activeTab === tab.id ? "border-b-2 border-green-600 text-green-600" : "text-gray-500"}`}
                            >
                                {tab.label}
                            </button>
                            ))
                        }
                    </div>
                </div>

                <div className="mb-4">
                    {activeTab === "general" && <GeneralInfo data={eventData.general} updateData={(data) => updateEventData('general', data)} />}
                    {activeTab === "dates" && <EventDates data={eventData.dates} updateData={(data) => updateEventData('dates', data)} />}
                    {activeTab === "details" && <EventDetails data={eventData.details} updateData={(data) => updateEventData('details', data)} />}
                    {activeTab === "location" && <EventLocation data={eventData.location} updateData={(data) => updateEventData('location', data)} />}
                    {activeTab === "dance" && <DanceInfo data={eventData.dance} updateData={(data) => updateEventData('dance', data)} />}
                    {activeTab === "images" && <EventImages data={eventData.images} updateData={(data) => updateEventData('images', data)} />}
                </div>
                <div className="flex justify-end">
                    <button onClick={onSave} className="px-4 py-2 flex items-center justify-between gap-2 bg-green-600 text-white rounded hover:bg-green-700">
                        <Save size={20} />
                        Guardar Evento
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateEventModal;