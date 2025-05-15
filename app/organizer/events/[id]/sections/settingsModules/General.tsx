import React, { useState, useEffect } from "react";
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
    
    // Estado local para manejar los cambios pendientes
    const [localSettings, setLocalSettings] = useState<EventSettings | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    // Inicializar el estado local cuando se cargan las configuraciones
    useEffect(() => {
        if (settings) {
            setLocalSettings(JSON.parse(JSON.stringify(settings))); // Deep clone
            setHasChanges(false);
        }
    }, [settings]);

    if (loading) return <p>Cargando configuración...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!settings || !localSettings) return <p>No se encontraron configuraciones para este evento.</p>;

    if (!localSettings.registration || !localSettings.pullCouple) {
        return <p className="text-yellow-500">⚠️ Falta información en la configuración.</p>;
    }

    // Maneja la actualización de configuración de inscripción
    const handleRegistrationChange = (field: keyof EventSettings["registration"]) => {
        if (!localSettings) return;
        
        const updatedSettings = {
            ...localSettings,
            registration: {
                ...localSettings.registration,
                [field]: !localSettings.registration[field]
            }
        };
        
        setLocalSettings(updatedSettings);
        setHasChanges(true);
    };

    // Maneja la actualización de configuración de jalar pareja
    const handlePullCoupleChange = (field: keyof EventSettings["pullCouple"], value: boolean | string | number) => {
        if (!localSettings) return;
        
        const updatedSettings = {
            ...localSettings,
            pullCouple: {
                ...localSettings.pullCouple,
                [field]: value
            }
        };
        
        setLocalSettings(updatedSettings);
        setHasChanges(true);
    };

    // Guardar los cambios
    const handleSaveChanges = async () => {
        if (!localSettings) return;
        
        setSaving(true);
        try {
            await saveSettings(localSettings);
            setHasChanges(false);
        } catch (error) {
            console.error("Error al guardar:", error);
            // Aquí podrías mostrar un mensaje de error al usuario
        } finally {
            setSaving(false);
        }
    };

    // Descartar los cambios
    const handleDiscardChanges = () => {
        if (settings) {
            setLocalSettings(JSON.parse(JSON.stringify(settings)));
            setHasChanges(false);
        }
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
                                disabled={loading || saving}
                                checked={localSettings.registration[key as keyof EventSettings["registration"]] ?? false}
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
                        disabled={loading || saving}
                        checked={localSettings.pullCouple?.enabled ?? false}
                        onChange={() => handlePullCoupleChange("enabled", !localSettings.pullCouple?.enabled)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">¿Permitir jalar pareja?</span>
                </label>

                {localSettings.pullCouple?.enabled && (
                    <div className="mt-4 space-y-4 pl-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Criterio</label>
                            <select
                                value={localSettings.pullCouple?.criteria ?? "Category"}
                                onChange={(e) => handlePullCoupleChange("criteria", e.target.value)}
                                disabled={loading || saving}
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
                                value={localSettings.pullCouple?.difference ?? 0}
                                onChange={(e) => handlePullCoupleChange("difference", Number(e.target.value))}
                                disabled={loading || saving}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-0 focus:outline-none focus:shadow-md focus:shadow-red-500/30 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                min={0}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Botones de acción */}
            {hasChanges && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleDiscardChanges}
                            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-150"
                            disabled={saving}
                        >
                            Descartar cambios
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-150 disabled:bg-blue-400"
                            disabled={saving}
                        >
                            {saving ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                    <p className="text-sm text-yellow-600 mt-3 text-right">
                        ⚠️ Tienes cambios sin guardar
                    </p>
                </div>
            )}
        </div>
    );
};

export default Participants;