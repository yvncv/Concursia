"use client"
import { useState, useEffect, useCallback } from "react";
import toast from 'react-hot-toast';
import { User } from '@/app/types/userType';
import useAcademies from "@/app/hooks/useAcademies";
import { CustomEvent, LevelData } from "@/app/types/eventType";
import { Ticket } from "@/app/types/ticketType";
import useAcademy from "@/app/hooks/useAcademy";
import useProcessTicket from "@/app/hooks/tickets/useProcessTicket";
import useUsers from "@/app/hooks/useUsers";
import { determineCategory } from "@/app/utils/category/determineCategory";
import { useGlobalCategories } from "@/app/hooks/useGlobalCategories";

import InscriptionForm from "./inscription-group/InscriptionForm";
import InscriptionList from "./inscription-group/components/InscriptionList";
import TicketComponent from "./inscription-group/components/TicketComponent";

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

  // Hook para manejar ticket en proceso
  const {
    findProcessTicket,
    createProcessTicket,
    addEntryToProcessTicket,
    removeEntryFromProcessTicket,
    submitProcessTicket,
    isLoading: processLoading
  } = useProcessTicket();

  // Estados principales
  const [processTicket, setProcessTicket] = useState<Ticket | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>("");

  const [modalidad, setModalidad] = useState<string>(() => {
    if (!event.dance || !event.dance.levels) {
      console.error("El evento no tiene modalidades definidas");
      return "";
    }

    const modalidadesDisponibles = Object.keys(event.dance.levels);
    return modalidadesDisponibles.length > 0 ? modalidadesDisponibles[0] : "";
  });

  // Hooks de datos
  const { academies, loadingAcademies } = useAcademies();
  const { academy, loadingAcademy, errorAcademy } = useAcademy(event.academyId);

  const allUserIds = processTicket?.entries.flatMap(entry => entry.usersId) || [];
  const { usersMap, getUserById } = useUsers(allUserIds);

  // Validación simple para ticket en proceso
  const groupValidation = {
    isValid: processTicket ? processTicket.entries.length > 0 : false,
    message: processTicket
      ? (processTicket.entries.length === 0 ? "No hay inscripciones en el ticket" : "Ticket válido")
      : "No hay ticket en proceso"
  };

  // State para modal de mapa
  const [showMapModal, setShowMapModal] = useState<boolean>(false);

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

  // Cargar ticket en proceso al inicio
  useEffect(() => {
    const loadProcessTicket = async () => {
      if (!user.marinera?.academyId || !event.id) return;

      setLoadingTicket(true);
      try {
        const ticket = await findProcessTicket(user.marinera.academyId, event.id);
        setProcessTicket(ticket);
      } catch (error) {
        console.error('Error loading process ticket:', error);
        toast.error('Error al cargar ticket en proceso');
      } finally {
        setLoadingTicket(false);
      }
    };

    loadProcessTicket();
  }, [user.marinera?.academyId, event.id]); // ELIMINADO findProcessTicket de dependencias

  // Recargar ticket después de operaciones
  const refreshProcessTicket = async () => {
    if (!user.marinera?.academyId || !event.id) return;

    try {
      const ticket = await findProcessTicket(user.marinera.academyId, event.id);
      setProcessTicket(ticket);
    } catch (error) {
      console.error('Error refreshing process ticket:', error);
    }
  };

  // Verificación inicial de la estructura del evento
  useEffect(() => {
    if (!event.dance?.levels || Object.keys(event.dance.levels).length === 0) {
      console.error("El evento no tiene modalidades definidas en dance.levels");
      toast.error("El evento no tiene modalidades configuradas");
    }
  }, [event]);

  // Validación de usuario y evento
  useEffect(() => {
    if (!user.marinera?.academyId) {
      toast.error("Tu usuario no tiene una academia asignada. Contacta al administrador.");
    }
  }, [user]);

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

  // Función para convertir TicketEntry a Inscripcion (para compatibilidad con componentes)
  const convertEntriesToInscripciones = (entries: any[]): Inscripcion[] => {
    return entries.map(entry => ({
      modalidad: entry.level,
      level: entry.level,
      category: entry.category,
      isPullCouple: false, // Por ahora asumimos false, se puede mejorar
      participante: {
        id: entry.usersId[0] || '',
        nombre: `Usuario ${entry.usersId[0]?.substring(0, 8) || 'N/A'}`,
        dni: 'N/A',
        edad: 'N/A',
        genero: 'N/A',
        telefono: 'N/A',
        academyId: entry.academiesId[0] || '',
        academyName: entry.academiesName[0] || 'N/A',
        birthDate: new Date()
      },
      pareja: entry.usersId.length > 1 ? {
        id: entry.usersId[1] || '',
        nombre: `Usuario ${entry.usersId[1]?.substring(0, 8) || 'N/A'}`,
        dni: 'N/A',
        edad: 'N/A',
        genero: 'N/A',
        telefono: 'N/A',
        academyId: entry.academiesId[1] || '',
        academyName: entry.academiesName[1] || 'N/A',
        birthDate: new Date()
      } : null,
      precio: entry.amount
    }));
  };
  const validateSingleInscription = (inscripcion: Inscripcion): string | null => {
    const userAcademyId = user.marinera?.academyId;
    if (!userAcademyId) {
      return 'El usuario no tiene una academia asignada';
    }

    const hasValidAffiliation =
      inscripcion.participante.academyId === userAcademyId ||
      (inscripcion.pareja && inscripcion.pareja.academyId === userAcademyId);

    if (!hasValidAffiliation) {
      return 'Al menos un participante debe ser de tu academia';
    }

    if (!inscripcion.precio || inscripcion.precio <= 0) {
      return 'La inscripción no tiene un precio válido';
    }

    return null;
  };

  // Agregar inscripción directamente al ticket en proceso
  const agregarInscripcion = async (nuevaInscripcion: Inscripcion): Promise<void> => {
    // Validar antes de agregar
    const errorMsg = validateSingleInscription(nuevaInscripcion);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    // Verificar inscripciones duplicadas en ticket existente
    if (processTicket) {
      const isDuplicate = processTicket.entries.some(entry =>
        entry.level === nuevaInscripcion.level &&
        (entry.usersId.includes(nuevaInscripcion.participante.id) ||
          (nuevaInscripcion.pareja && entry.usersId.includes(nuevaInscripcion.pareja.id)))
      );

      if (isDuplicate) {
        toast.error("Ya existe una inscripción para este participante en esta modalidad");
        return;
      }
    }

    const loadingToastId = toast.loading('Guardando inscripción...');

    try {
      // Convertir inscripción a entry
      const usersId = nuevaInscripcion.pareja
        ? [nuevaInscripcion.participante.id, nuevaInscripcion.pareja.id]
        : [nuevaInscripcion.participante.id];

      const academiesId = [
        nuevaInscripcion.participante.academyId,
        ...(nuevaInscripcion.pareja ? [nuevaInscripcion.pareja.academyId] : [])
      ].filter((id, index, arr) => id && arr.indexOf(id) === index);

      const academiesName = [
        nuevaInscripcion.participante.academyName,
        ...(nuevaInscripcion.pareja ? [nuevaInscripcion.pareja.academyName] : [])
      ].filter((name, index, arr) => name && arr.indexOf(name) === index);

      const newEntry = {
        usersId,
        academiesId,
        academiesName,
        category: nuevaInscripcion.category,
        level: nuevaInscripcion.level,
        amount: nuevaInscripcion.precio,
      };

      if (processTicket) {
        // Agregar a ticket existente
        const success = await addEntryToProcessTicket(processTicket.id, newEntry);
        if (!success) {
          throw new Error('Error al agregar inscripción al ticket');
        }
      } else {
        // Crear nuevo ticket
        const newTicketId = await createProcessTicket(event.id, user.id, newEntry);
        if (!newTicketId) {
          throw new Error('Error al crear nuevo ticket');
        }
      }

      // Recargar ticket
      await refreshProcessTicket();

      toast.success("Inscripción guardada correctamente", {
        id: loadingToastId,
        duration: 3000
      });

    } catch (error) {
      console.error("Error al agregar inscripción:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error: ${errorMessage}`, {
        id: loadingToastId,
        duration: 5000
      });
    }
  };

  // Eliminar entrada del ticket en proceso
  const eliminarInscripcion = async (entryIndex: number): Promise<void> => {
    if (!processTicket) {
      toast.error("No hay ticket en proceso");
      return;
    }

    if (entryIndex < 0 || entryIndex >= processTicket.entries.length) {
      toast.error("Índice de entry inválido");
      return;
    }

    const loadingToastId = toast.loading('Eliminando inscripción...');

    try {
      const success = await removeEntryFromProcessTicket(processTicket.id, entryIndex);
      if (success) {
        await refreshProcessTicket();
        toast.success("Inscripción eliminada correctamente", {
          id: loadingToastId,
          duration: 3000
        });
      } else {
        throw new Error('Error al eliminar entry');
      }
    } catch (error) {
      console.error("Error al eliminar inscripción:", error);
      toast.error("Error al eliminar inscripción", {
        id: loadingToastId,
        duration: 5000
      });
    }
  };

  // Enviar ticket a "Pendiente"
  const confirmarTicket = async (): Promise<void> => {
    if (!processTicket) {
      toast.error("No hay ticket en proceso para enviar");
      return;
    }

    if (processTicket.entries.length === 0) {
      toast.error("El ticket no tiene inscripciones");
      return;
    }

    if (!groupValidation.isValid) {
      toast.error(groupValidation.message);
      return;
    }

    setIsSubmitting(true);

    const loadingToastId = toast.loading('Enviando ticket a pago...');

    try {
      const success = await submitProcessTicket(processTicket.id);

      if (success) {
        setTicketId(processTicket.id);
        setIsSuccess(true);

        toast.success(
          `Ticket enviado para pago! ${processTicket.entries.length} inscripciones - S/. ${processTicket.totalAmount}`,
          {
            id: loadingToastId,
            duration: 5000
          }
        );
      } else {
        throw new Error("No se pudo enviar el ticket");
      }

    } catch (error) {
      console.error("Error al enviar ticket:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error: ${errorMessage}`, {
        id: loadingToastId,
        duration: 6000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reiniciar después de éxito
  const nuevaInscripcion = (): void => {
    setProcessTicket(null);
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

  return (
    <>
      <div className="w-full max-w-6xl mx-auto bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-6 border border-gray-100">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Inscripción Grupal de Alumnos</h2>
          {processTicket && (
            <div className="inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              Ticket en proceso - {processTicket.entries.length} inscripciones - S/. {processTicket.totalAmount}
            </div>
          )}
        </div>

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
              loadingAcademies={loadingAcademies}
              getParticipantCategory={getParticipantCategory}
              processTicket={processTicket}
            />

            {/* Lista unificada de inscripciones */}
            <InscriptionList
              processTicket={processTicket}
              eliminarInscripcion={eliminarInscripcion}
              confirmarTicket={confirmarTicket}
              isSubmitting={isSubmitting || processLoading || loadingTicket}
              event={adaptEventForComponents(event)}
              groupValidation={groupValidation}
              getParticipantCategory={getParticipantCategory}
              user={user}
              academies={academies}
              usersMap={usersMap}        // <- Nueva prop
              getUserById={getUserById}  // <- Nueva prop
            />
          </div>
        ) : (
          // Pantalla de éxito - Ticket enviado a "Pendiente"
          <TicketComponent
            event={adaptEventForComponents(event)}
            user={user}
            academy={academy}
            ticketId={ticketId}
            inscripciones={convertEntriesToInscripciones(processTicket?.entries || [])}
            loadingAcademy={loadingAcademy}
            errorAcademy={errorAcademy}
            openModal={handleOpenModal}
            onNewInscription={nuevaInscripcion}
            getParticipantCategory={getParticipantCategory}
          />
        )}

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