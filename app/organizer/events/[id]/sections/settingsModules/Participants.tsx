import React from "react";
import useSettings from "@/app/hooks/useSettings";
import type { EventSettings } from "@/app/types/settingsType";

interface ParticipantsProps {
    eventId: string;
}

// Definimos el orden y las etiquetas de las opciones de registro
const REGISTRATION_OPTIONS = [
    {
        key: 'grupalCSV',
        label: 'Inscripción grupal (CSV/Excel)'
    },
    {
        key: 'individualWeb',
        label: 'Inscripción individual vía web'
    },
    {
        key: 'sameDay',
        label: 'Inscripción el mismo día del concurso'
    }
] as const;

const Participants: React.FC<ParticipantsProps> = ({ eventId }) => {
    const { settings, loading, error, saveSettings } = useSettings(eventId);

    if (loading) return <p>Cargando configuración...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!settings) return <p>No se encontraron configuraciones para este evento.</p>;

    if (!settings.registration || !settings.pullCouple) {
        return <p className="text-yellow-500">⚠️ Falta información en la configuración.</p>;
    }

    // Maneja la actualización de configuración de inscripción
    const handleRegistrationChange = (field: keyof EventSettings["registration"]) => {
        if (!settings) return;
        saveSettings({
            ...settings,
            registration: {
                ...settings.registration,
                [field]: !settings.registration[field]
            }
        });
    };

    // Maneja la actualización de configuración de jalar pareja
    const handlePullCoupleChange = (field: keyof EventSettings["pullCouple"], value: any) => {
        if (!settings) return;
        saveSettings({
            ...settings,
            pullCouple: {
                ...settings.pullCouple,
                [field]: value
            }
        });
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Configuraciones de Participantes</h2>

            {/* Configuración de Inscripción */}
            <div className="mb-8 border-b pb-6">
                <h3 className="text-lg font-medium mb-4">Modalidad de Inscripción</h3>
                <div className="grid gap-3">
                    {REGISTRATION_OPTIONS.map(({ key, label }) => (
                        <label 
                            key={key} 
                            className="flex items-center p-3 hover:bg-gray-50 rounded-md transition-colors duration-150 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                disabled={loading}
                                checked={settings.registration[key as keyof EventSettings["registration"]] ?? false}
                                onChange={() => handleRegistrationChange(key as keyof EventSettings["registration"])}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-gray-700">{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Configuración de Jalar Pareja */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4">Reglas de Jalar Pareja</h3>
                <label className="flex items-center p-3 hover:bg-gray-50 rounded-md transition-colors duration-150 cursor-pointer">
                    <input
                        type="checkbox"
                        disabled={loading}
                        checked={settings.pullCouple?.enabled ?? false}
                        onChange={() => handlePullCoupleChange("enabled", !settings.pullCouple?.enabled)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">¿Permitir jalar pareja?</span>
                </label>

                {settings.pullCouple?.enabled && (
                    <div className="mt-4 space-y-4 pl-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Criterio</label>
                            <select
                                value={settings.pullCouple?.criteria ?? "Category"}
                                onChange={(e) => handlePullCoupleChange("criteria", e.target.value)}
                                disabled={loading}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:shadow-md focus:ring-0 focus:outline-none focus:shadow-red-500/30 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                                <option value="Category">Por Categoría</option>
                                <option value="Age">Por Edad</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Máxima diferencia</label>
                            <input
                                type="number"
                                value={settings.pullCouple?.difference ?? 0}
                                onChange={(e) => handlePullCoupleChange("difference", Number(e.target.value))}
                                disabled={loading}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-0 focus:outline-none focus:shadow-md focus:shadow-red-500/30 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                min={0}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Participants;