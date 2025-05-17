"use client"
import { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { CheckCircle, Users } from "lucide-react";
import { User } from '@/app/types/userType';
import { TicketData } from "@/app/types/ticketType";
import useAcademies from "@/app/hooks/useAcademies";
import { LevelData } from "@/app/types/eventType";
import useAcademy from "@/app/hooks/useAcademy";

import InscriptionForm from "./inscription-group/components/InscriptionForm";
import InscriptionList from "./inscription-group/components/InscriptionList";
import TicketComponent from "./inscription-group/components/TicketComponent";

// Definición de tipos
interface EventSettings {
  levels: {
    [key: string]: {
      price?: number;
      couple?: boolean;
      description?: string;
      categories?: string[];
    };
  };
}

interface EventLocation {
  placeName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface Event {
  id: string;
  name: string;
  academyId?: string;
  settings: EventSettings;
  location?: EventLocation;
}

interface Participante {
  id: string;
  nombre: string;
  dni: string;
  edad: string | number;
  genero: string;
  telefono: string;
  academyId: string;
  academyName: string;
  originalCategory: string;
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

interface EventoInscripcionAlumnosProps {
  event: Event;
  user: User;
}

const EventoInscripcionAlumnos: React.FC<EventoInscripcionAlumnosProps> = ({ event, user }) => {
  // Estados
  const [modalidad, setModalidad] = useState<string>(() => {
    const modalidadesDisponibles = Object.keys(event.settings.levels || {});
    return modalidadesDisponibles.length > 0 ? modalidadesDisponibles[0] : "";
  });
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>("");
  const [montoTotal, setMontoTotal] = useState<number>(0);
  const { academies, loadingAcademies } = useAcademies();
  const { academy, loadingAcademy, errorAcademy } = useAcademy(event.academyId);
  
  // State for map modal
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  
  // Function to handle opening the map modal
  const handleOpenModal = (): void => {
    setShowMapModal(true);
  };
  
  // Function to handle closing the map modal
  const handleCloseModal = (): void => {
    setShowMapModal(false);
  };

  // Adapter function to convert Event to the expected format for InscriptionForm
  const adaptEventForInscriptionForm = (event: Event): any => {
    // Create a new object with the correct structure
    const adaptedEvent = {
      ...event,
      settings: {
        levels: {} as { [key: string]: LevelData }
      }
    };
  
    // Convert each level to the expected LevelData format
    Object.keys(event.settings.levels).forEach(key => {
      const level = event.settings.levels[key];
      adaptedEvent.settings.levels[key] = {
        price: level.price,
        couple: level.couple,
        description: level.description,
        // Add the missing properties required by LevelData
        selected: true, // default value
        categories: level.categories || [], // Use existing categories or empty array
        // Add any other required properties from LevelData that might be missing
      } as LevelData;
    });
  
    return adaptedEvent;
  };

  useEffect(() => {
    if (!event.settings?.levels || Object.keys(event.settings.levels).length === 0) {
      console.error("El evento no tiene modalidades definidas");
    }
  }, [event]);

  // Agregar inscripción a la lista
  const agregarInscripcion = (nuevaInscripcion: Inscripcion): void => {
    // Agregar a la lista de inscripciones
    setInscripciones([...inscripciones, nuevaInscripcion]);

    // Actualizar monto total
    setMontoTotal(montoTotal + (nuevaInscripcion.precio || 0));
  };

  // Eliminar una inscripción
  const eliminarInscripcion = (index: number): void => {
    const nuevasInscripciones = [...inscripciones];
    // Restar el precio de esta inscripción del total
    setMontoTotal(montoTotal - nuevasInscripciones[index].precio);
    // Eliminar la inscripción
    nuevasInscripciones.splice(index, 1);
    setInscripciones(nuevasInscripciones);
  };

  // Enviar todas las inscripciones
  const confirmarInscripciones = async (): Promise<void> => {
    if (inscripciones.length === 0) {
      alert("Debe agregar al menos una inscripción");
      return;
    }

    setIsSubmitting(true);

    try {
      const db = getFirestore();
      const ticketsCollection = collection(db, "tickets");

      // Crear las entradas del ticket
      const entries = inscripciones.map(inscripcion => {
        const usersId = inscripcion.pareja
          ? [inscripcion.participante.id, inscripcion.pareja.id]
          : [inscripcion.participante.id];

        const academiesId = inscripcion.pareja
          ? [inscripcion.participante.academyId, inscripcion.pareja.academyId].filter(id => id)
          : [inscripcion.participante.academyId].filter(id => id);

        return {
          usersId,
          academiesId,
          category: inscripcion.category,
          level: inscripcion.level,
          amount: inscripcion.precio
        };
      });

      // Crear el objeto del ticket
      const now = Timestamp.now();
      // Fecha de expiración: 3 días desde ahora
      const expirationDate = Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));

      // Extraer todos los IDs de usuario y academias para el ticket principal
      const allUsersId = inscripciones.flatMap(insc =>
        insc.pareja ? [insc.participante.id, insc.pareja.id] : [insc.participante.id]
      );

      const allAcademiesNames = inscripciones.flatMap(insc => {
        const academies: string[] = [];
        if (insc.participante.academyName) academies.push(insc.participante.academyName);
        if (insc.pareja && insc.pareja.academyName && insc.pareja.academyName !== insc.participante.academyName) {
          academies.push(insc.pareja.academyName);
        }
        return academies;
      });

      // Usar la primera categoría como representativa, o dejar vacío si no hay
      const representativeCategory = inscripciones.length > 0 ? inscripciones[0].category : "";

      const newTicket = {
        status: 'Pendiente',
        eventId: event.id,
        registrationDate: now,
        expirationDate: expirationDate,
        inscriptionType: 'Grupal',
        totalAmount: montoTotal,
        entries,
        createdBy: user.id,
        level: modalidad,
        category: representativeCategory,
        usersId: allUsersId,
        academiesName: [...new Set(allAcademiesNames)], // Eliminar duplicados
      };

      // Guardar el ticket en Firestore
      const docRef = await addDoc(ticketsCollection, newTicket);

      // Guardar el ID del ticket creado
      setTicketId(docRef.id);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error al confirmar inscripciones:", error);
      alert("Error al procesar la inscripción. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reiniciar después de éxito
  const nuevaInscripcion = (): void => {
    setInscripciones([]);
    setMontoTotal(0);
    setIsSuccess(false);
    setTicketId("");
    setModalidad(Object.keys(event.settings.levels || {})[0] || "");
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-6 border border-gray-100">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">Inscripción de Alumnos</h2>
        <p className="text-lg text-gray-700">
          Inscribe alumnos de tu academia al evento <span className="font-semibold">{event.name}</span>
        </p>
      </div>

      {!isSuccess ? (
        <div className="space-y-8">
          {/* Formulario de inscripción */}
          <InscriptionForm
            event={adaptEventForInscriptionForm(event)}
            user={user}
            modalidad={modalidad}
            setModalidad={setModalidad}
            agregarInscripcion={agregarInscripcion}
            academies={academies}
            inscripcionesExistentes={inscripciones}
          />

          {/* Lista de inscripciones */}
          <InscriptionList
            inscripciones={inscripciones}
            eliminarInscripcion={eliminarInscripcion}
            confirmarInscripciones={confirmarInscripciones}
            isSubmitting={isSubmitting}
            montoTotal={montoTotal}
            event={event}
          />
        </div>
      ) : (
        // Pantalla de éxito - Usando el componente TicketComponent
        <TicketComponent
          event={event}
          user={user}
          academy={academy}
          ticketId={ticketId}
          inscripciones={inscripciones}
          loadingAcademy={loadingAcademy}
          errorAcademy={errorAcademy}
          openModal={handleOpenModal}
        />
      )}
      
      {/* Modal for map - can be implemented if needed */}
      {showMapModal && event?.location?.coordinates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Ubicación del evento</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              {/* Map content would go here */}
              <p>Mapa de {event.location.placeName}</p>
              <p>Coordenadas: {event.location.coordinates.latitude}, {event.location.coordinates.longitude}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventoInscripcionAlumnos;