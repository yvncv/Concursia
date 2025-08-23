import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

// Hook personalizado para manejar la persistencia de inscripciones
export const useGrupalInscriptionPersistence = (eventId) => {
  const STORAGE_KEY = `draft_inscriptions_${eventId}`;
  const [inscripciones, setInscripciones] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);

  // Cargar inscripciones desde sessionStorage al inicializar
  useEffect(() => {
    if (!eventId) return;
    
    const loadStoredInscriptions = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          
          // Validar que los datos son válidos
          if (data.inscripciones && Array.isArray(data.inscripciones) && data.eventId === eventId) {
            setInscripciones(data.inscripciones);
            setLastSaved(data.timestamp ? new Date(data.timestamp) : null);
            
            if (data.inscripciones.length > 0) {
              toast.success(
                `Se recuperaron ${data.inscripciones.length} inscripciones guardadas`,
                { duration: 4000 }
              );
            }
          }
        }
      } catch (error) {
        console.error('Error loading stored inscriptions:', error);
        // Limpiar datos corruptos
        sessionStorage.removeItem(STORAGE_KEY);
      }
    };

    loadStoredInscriptions();
  }, [STORAGE_KEY, eventId]);

  // Guardar automáticamente cuando cambien las inscripciones
  useEffect(() => {
    if (!eventId) return;
    
    // Solo guardar si hay cambios reales (evitar loops infinitos)
    const timeoutId = setTimeout(() => {
      if (inscripciones.length > 0) {
        const saveData = {
          inscripciones,
          timestamp: new Date().toISOString(),
          eventId
        };
        
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
          setLastSaved(new Date());
        } catch (error) {
          console.error('Error saving inscriptions:', error);
          toast.error('Error al guardar inscripciones temporalmente');
        }
      } else {
        // Si no hay inscripciones, limpiar el storage
        sessionStorage.removeItem(STORAGE_KEY);
        setLastSaved(null);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [inscripciones, STORAGE_KEY, eventId]);

  // Función para agregar inscripción
  const agregarInscripcion = useCallback((nuevaInscripcion) => {
    setInscripciones(prev => [...prev, nuevaInscripcion]);
  }, []);

  // Función para eliminar inscripción
  const eliminarInscripcion = useCallback((index) => {
    setInscripciones(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Función para editar inscripción
  const editarInscripcion = useCallback((index, inscripcionEditada) => {
    setInscripciones(prev => 
      prev.map((insc, i) => i === index ? inscripcionEditada : insc)
    );
  }, []);

  // Función para limpiar todas las inscripciones
  const limpiarInscripciones = useCallback(() => {
    setInscripciones([]);
    sessionStorage.removeItem(STORAGE_KEY);
    setLastSaved(null);
  }, [STORAGE_KEY]);

  // Función para limpiar el draft después de confirmar
  const limpiarDraft = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setLastSaved(null);
  }, [STORAGE_KEY]);

  return {
    inscripciones,
    agregarInscripcion,
    eliminarInscripcion,
    editarInscripcion,
    limpiarInscripciones,
    limpiarDraft, // Nueva función para limpiar después de confirmar
    lastSaved,
    hasStoredData: inscripciones.length > 0
  };
};