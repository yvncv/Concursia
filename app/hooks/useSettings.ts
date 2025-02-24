"use client";

import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { EventSettings } from "../types/settingsType";

const DEFAULT_SETTINGS: EventSettings = {
    eventId: "",
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

        const settingsRef = doc(db, "settings", eventId);

        // Primero intentamos obtener los datos existentes
        const initializeSettings = async () => {
            try {
                const docSnap = await getDoc(settingsRef);
                
                if (!docSnap.exists()) {
                    // Si no existen configuraciones, creamos unas por defecto
                    const initialSettings = {
                        ...DEFAULT_SETTINGS,
                        eventId
                    };
                    
                    await setDoc(settingsRef, initialSettings);
                    setSettings(initialSettings);
                    console.log("Configuraciones iniciales creadas para:", eventId);
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
            settingsRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data() as EventSettings;
                    setSettings(data);
                    setError(null);
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

            const settingsRef = doc(db, "settings", eventId);
            await setDoc(settingsRef, { ...newSettings, eventId }, { merge: true });

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