"use client";

import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { EventSettings, CustomEvent } from "../types/eventType";

const DEFAULT_SETTINGS: EventSettings = {
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
};

const useSettings = (eventId: string) => {
    const [settings, setSettings] = useState<EventSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!eventId) {
            setError("No se proporcionó un ID de evento válido");
            setLoading(false);
            return;
        }

        const eventRef = doc(db, "eventos", eventId);

        // Primero intentamos obtener los datos existentes
        const initializeSettings = async () => {
            try {
                const docSnap = await getDoc(eventRef);
                
                if (docSnap.exists()) {
                    const event = docSnap.data() as CustomEvent;
                    
                    // Si no tiene settings, iniciamos con los valores por defecto
                    if (!event.settings) {
                        await updateDoc(eventRef, {
                            settings: DEFAULT_SETTINGS
                        });
                        setSettings(DEFAULT_SETTINGS);
                        console.log("Configuraciones iniciales creadas para:", eventId);
                    } else {
                        setSettings(event.settings);
                    }
                } else {
                    setError("El evento no existe");
                }
            } catch (err) {
                console.error("Error inicializando settings:", err);
                setError("Error al inicializar las configuraciones");
            }
        };

        // Iniciamos la configuración inicial
        initializeSettings();

        // Configuramos el listener para cambios en tiempo real
        const unsubscribe = onSnapshot(
            eventRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const event = docSnapshot.data() as CustomEvent;
                    if (event.settings) {
                        setSettings(event.settings);
                        setError(null);
                    }
                }
                setLoading(false);
            },
            (err) => {
                console.error("Error en snapshot:", err);
                setError("Error al obtener las configuraciones en tiempo real");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [eventId]);

    const saveSettings = async (newSettings: EventSettings) => {
        try {
            if (!eventId) {
                throw new Error("Falta el eventId. No se pueden guardar las configuraciones.");
            }

            const eventRef = doc(db, "eventos", eventId);
            await updateDoc(eventRef, {
                settings: newSettings
            });

            console.log("Configuraciones guardadas exitosamente");
            return true;
        } catch (error) {
            console.error("Error guardando configuraciones:", error);
            setError("Error al guardar las configuraciones");
            return false;
        }
    };

    return { settings, loading, error, saveSettings };
};

export default useSettings;