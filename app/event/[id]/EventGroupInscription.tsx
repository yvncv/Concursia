"use client"
import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { User } from '@/app/types/userType';
import useAcademies from "@/app/hooks/useAcademies";
import { CustomEvent, LevelData } from "@/app/types/eventType";
import useAcademy from "@/app/hooks/useAcademy";
import useCreateGroupTicket from "@/app/hooks/tickets/useCreateGroupTicket";
import { useGroupInscriptionsValidation } from "@/app/hooks/tickets/useAcademyAffiliationValidation";
import { determineCategory } from "@/app/utils/category/determineCategory";
import { useGlobalCategories } from "@/app/hooks/useGlobalCategories";
import { useGrupalInscriptionPersistence } from "@/app/hooks/sessionStorage/useGrupalInscription";

import InscriptionForm from "./inscription-group/InscriptionForm";
import InscriptionList from "./inscription-group/components/InscriptionList";
import TicketComponent from "./inscription-group/components/TicketComponent";
import GroupTicketsList from "./inscription-group/components/GroupTicketList";

// Definición de tipos
interface Participante {
  id: string;
  nombre: string;
  dni: string;
  edad: string | number;
  genero: string;
  telefono: string;
  academyId: string;
  academyName: string;
  birthDate: Date;
}

interface Inscripcion {
  modalidad: string;
  level: string;
  category: string;
  isPullCouple: boolean;
  participante: Participante;
  pareja: Participante | null;
  precio: number;
}

interface EventGroupInscriptionProps {
  event: CustomEvent;
  user: User;
}

const EventGroupInscription: React.FC<EventGroupInscriptionProps> = ({ event, user }) => {
  // Hook para categorías globales
  const { categorias } = useGlobalCategories();

  // Hook de persistencia - NUEVO
  const {
    inscripciones,
    agregarInscripcion: agregarInscripcionPersistent,
    eliminarInscripcion: eliminarInscripcionPersistent,
    editarInscripcion,
    limpiarInscripciones,
    limpiarDraft,
    lastSaved,
    hasStoredData
  } = useGrupalInscriptionPersistence(event.id);

  // Función para obtener categoría de un participante
  const getParticipantCategory = (participante: Participante): string => {
    if (!participante.birthDate || categorias.length === 0) {
      return "Sin categoría";
    }
    
    return determineCategory(
      participante.birthDate,
      new Date(),
      categorias
    ) || "Categoría no encontrada";
  };

  // Verificación inicial de la estructura del evento
  useEffect(() => {
    if (!event.dance?.levels || Object.keys(event.dance.levels).length === 0) {
      console.error("El evento no tiene modalidades definidas en dance.levels");
      toast.error("El evento no tiene modalidades configuradas");
    }
  }, [event]);

  // Estados principales
  const [modalidad, setModalidad] = useState<string>(() => {
    if (!event.dance || !event.dance.levels) {
      console.error("El evento no tiene modalidades definidas");
      return "";
    }
    
    const modalidadesDisponibles = Object.keys(event.dance.levels);
    return modalidadesDisponibles.length > 0 ? modalidadesDisponibles[0] : "";
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>("");
  
  // Calcular monto total basado en inscripciones persistentes
  const montoTotal = inscripciones.reduce((total, insc) => total + (insc.precio || 0), 0);

  // Hooks de datos
  const { academies, loadingAcademies } = useAcademies();
  const { academy, loadingAcademy, errorAcademy } = useAcademy(event.academyId);
  
  // Hook para crear ticket grupal
  const { createGroupTicket, validateInscriptions, isCreating } = useCreateGroupTicket();
  
  // Hook para validar inscripciones grupales
  const groupValidation = useGroupInscriptionsValidation(
    inscripciones.map(insc => ({
      participante: insc.participante,
      pareja: insc.pareja
    })),
    user
  );

  // State para modal de mapa
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  
  // Funciones para modal de mapa
  const handleOpenModal = (): void => {
    setShowMapModal(true);
  };
  
  const handleCloseModal = (): void => {
    setShowMapModal(false);
  };

  // Adapter function para convertir Event al formato esperado por los componentes
  const adaptEventForComponents = (event: CustomEvent): any => {
    if (!event.dance || !event.dance.levels) {
      console.error("El evento no tiene niveles definidos en dance.levels");
      return {
        ...event,
        settings: {
          levels: {}
        }
      };
    }
    
    const adaptedEvent = {
      ...event,
      settings: {
        levels: {} as { [key: string]: LevelData }
      }
    };

    // Convertir cada nivel al formato LevelData esperado
    Object.keys(event.dance.levels).forEach(key => {
      const level = event.dance.levels[key];
      adaptedEvent.settings.levels[key] = {
        price: level.price,
        couple: level.couple,
        selected: true,
        categories: level.categories || [],
      } as LevelData;
    });

    return adaptedEvent;
  };

  // Agregar inscripción a la lista - ACTUALIZADO para usar persistencia
  const agregarInscripcion = (nuevaInscripcion: Inscripcion): void => {
    // Validar antes de agregar
    const errorMsg = validateInscriptions([...inscripciones, nuevaInscripcion], user);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    // Verificar inscripciones duplicadas
    const isDuplicate = inscripciones.some(insc => 
      insc.modalidad === nuevaInscripcion.modalidad && 
      (insc.participante.id === nuevaInscripcion.participante.id || 
       (insc.pareja && nuevaInscripcion.pareja && insc.pareja.id === nuevaInscripcion.pareja.id) ||
       (insc.pareja && insc.pareja.id === nuevaInscripcion.participante.id) ||
       (nuevaInscripcion.pareja && insc.participante.id === nuevaInscripcion.pareja.id))
    );

    if (isDuplicate) {
      toast.error("Ya existe una inscripción para este participante en esta modalidad");
      return;
    }

    // Agregar usando el hook de persistencia
    agregarInscripcionPersistent(nuevaInscripcion);

    // Toast de éxito (solo aquí, no duplicado)
    toast.success("✅ Inscripción agregada correctamente", {
      duration: 3000
    });
  };

  // Eliminar una inscripción
  const eliminarInscripcion = (index: number): void => {
    if (index < 0 || index >= inscripciones.length) {
      toast.error("Índice de inscripción inválido");
      return;
    }

    // Eliminar usando el hook de persistencia (sin toast aquí)
    eliminarInscripcionPersistent(index);
  };

  // Confirmar todas las inscripciones - ACTUALIZADO para limpiar draft
  const confirmarInscripciones = async (): Promise<void> => {
    // Validaciones previas
    if (inscripciones.length === 0) {
      toast.error("Debe agregar al menos una inscripción");
      return;
    }

    // Validar afiliación de academias
    if (!groupValidation.isValid) {
      toast.error(groupValidation.message);
      return;
    }

    // Validación adicional usando el hook
    const errorMsg = validateInscriptions(inscripciones, user);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    setIsSubmitting(true);

    try {
      // Crear el ticket grupal usando el hook
      const newTicketId = await createGroupTicket({
        event,
        user,
        inscripciones
      });

      if (newTicketId) {
        setTicketId(newTicketId);
        setIsSuccess(true);
        
        // Limpiar el draft después del éxito - NUEVO
        limpiarDraft();
        
        // El toast de éxito se maneja dentro del hook
      } else {
        // El toast de error se maneja dentro del hook
        throw new Error("No se pudo crear el ticket");
      }

    } catch (error) {
      console.error("Error al confirmar inscripciones:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error al procesar inscripciones: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reiniciar después de éxito - ACTUALIZADO para usar persistencia
  const nuevaInscripcion = (): void => {
    limpiarInscripciones();
    setIsSuccess(false);
    setTicketId("");
    
    if (!event.dance || !event.dance.levels) {
      console.error("El evento no tiene modalidades definidas");
      setModalidad("");
      return;
    }
    
    setModalidad(Object.keys(event.dance.levels)[0] || "");
    toast.success("Formulario reiniciado para nueva inscripción grupal");
  };

  // NUEVA función para limpiar inscripciones sin confirmación (para ser llamada desde InscriptionList)
  const limpiarInscripcionesSilent = (): void => {
    limpiarInscripciones();
  };

  // Validación de usuario y evento
  useEffect(() => {
    if (!user.marinera?.academyId) {
      toast.error("Tu usuario no tiene una academia asignada. Contacta al administrador.");
    }
  }, [user]);

  // Mostrar notificación de datos guardados al cargar - NUEVO
  useEffect(() => {
    if (hasStoredData && lastSaved) {
      const timeAgo = Math.floor((new Date().getTime() - lastSaved.getTime()) / (1000 * 60));
      if (timeAgo < 60) {
        toast.success(
          `Datos guardados automáticamente hace ${timeAgo} minutos`,
          { duration: 3000 }
        );
      }
    }
  }, [hasStoredData, lastSaved]);

  // Calcular estadísticas para mostrar
  const estadisticas = {
    totalParticipantes: inscripciones.reduce((total, insc) => 
      total + (insc.pareja ? 2 : 1), 0),
    totalInscripciones: inscripciones.length,
    modalidadesUnicas: new Set(inscripciones.map(insc => insc.modalidad)).size,
    academiasParticipantes: new Set([
      ...inscripciones.map(insc => insc.participante.academyName),
      ...inscripciones.filter(insc => insc.pareja).map(insc => insc.pareja!.academyName)
    ]).size
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-6 border border-gray-100">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Inscripción Grupal de Alumnos</h2>
          <p className="text-lg text-gray-700">
            Inscribe alumnos de tu academia al evento <span className="font-semibold">{event.name}</span>
          </p>
          {user.marinera?.academyName && (
            <p className="text-sm text-gray-600 mt-1">
              Academia: <span className="font-medium text-blue-600">{user.marinera.academyName}</span>
            </p>
          )}
          
          {/* Indicador de guardado automático - NUEVO */}
          {lastSaved && inscripciones.length > 0 && (
            <div className="mt-2 inline-flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Guardado automáticamente a las {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Estadísticas rápidas - ACTUALIZADO con botón para limpiar */}
        {inscripciones.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">{estadisticas.totalParticipantes}</p>
                <p className="text-xs text-gray-600">Participantes</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                <p className="text-2xl font-bold text-green-600">{estadisticas.totalInscripciones}</p>
                <p className="text-xs text-gray-600">Inscripciones</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                <p className="text-2xl font-bold text-purple-600">{estadisticas.modalidadesUnicas}</p>
                <p className="text-xs text-gray-600">Modalidades</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                <p className="text-2xl font-bold text-orange-600">S/. {montoTotal}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
            
            {/* Botón para limpiar inscripciones - NUEVO */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (inscripciones.length === 0) {
                    toast.error("No hay inscripciones para limpiar");
                    return;
                  }

                  if (window.confirm(`¿Estás seguro de que deseas eliminar todas las ${inscripciones.length} inscripciones? Esta acción no se puede deshacer.`)) {
                    limpiarInscripciones();
                    toast.success("Todas las inscripciones han sido eliminadas");
                  }
                }}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
              >
                🗑️ Limpiar todas las inscripciones
              </button>
            </div>
          </div>
        )}

        {!isSuccess ? (
          <div className="space-y-8">
            {/* Formulario de inscripción */}
            <InscriptionForm
              event={adaptEventForComponents(event)}
              user={user}
              modalidad={modalidad}
              setModalidad={setModalidad}
              agregarInscripcion={agregarInscripcion}
              academies={academies}
              inscripcionesExistentes={inscripciones}
              loadingAcademies={loadingAcademies}
              getParticipantCategory={getParticipantCategory}
            />

            {/* Lista de inscripciones */}
            <InscriptionList
              inscripciones={inscripciones}
              eliminarInscripcion={eliminarInscripcion}
              editarInscripcion={editarInscripcion}
              confirmarInscripciones={confirmarInscripciones}
              isSubmitting={isSubmitting || isCreating}
              montoTotal={montoTotal}
              event={adaptEventForComponents(event)}
              groupValidation={groupValidation}
              getParticipantCategory={getParticipantCategory}
              lastSaved={lastSaved}
              limpiarInscripciones={limpiarInscripcionesSilent}
            />
          </div>
        ) : (
          // Pantalla de éxito - Usando el componente TicketComponent
          <TicketComponent
            event={adaptEventForComponents(event)}
            user={user}
            academy={academy}
            ticketId={ticketId}
            inscripciones={inscripciones}
            loadingAcademy={loadingAcademy}
            errorAcademy={errorAcademy}
            openModal={handleOpenModal}
            onNewInscription={nuevaInscripcion}
            getParticipantCategory={getParticipantCategory}
          />
        )}
        
        <GroupTicketsList academyId={user.marinera?.academyId} />
        
        {/* Modal para mapa */}
        {showMapModal && event?.location?.coordinates && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Ubicación del evento</h3>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <p className="text-gray-700 mb-2">📍 {event.location.placeName}</p>
                <p className="text-sm text-gray-500">
                  Coordenadas: {event.location.coordinates.latitude}, {event.location.coordinates.longitude}
                </p>
                <div className="mt-4 bg-gray-100 rounded-lg p-4 text-center">
                  <p className="text-gray-600">Mapa interactivo aquí</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Integración con Google Maps o similar
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EventGroupInscription;