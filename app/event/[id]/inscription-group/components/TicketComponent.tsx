import React from "react";
import { CheckCircle, Printer, RefreshCcw, MapPin } from "lucide-react";
import { User } from "@/app/types/userType";
import { DocumentData } from "firebase/firestore";

// Definición de tipos
interface EventSettings {
  levels: {
    [key: string]: {
      price?: number;
      couple?: boolean;
      description?: string;
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
  startDate?: any; // Usar el tipo correcto según cómo esté implementado
  endDate?: any; // Usar el tipo correcto según cómo esté implementado
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

interface TicketComponentProps {
  event: Event;
  user: User;
  academy: DocumentData | null;
  ticketId: string;
  inscripciones: Inscripcion[];
  loadingAcademy: boolean;
  errorAcademy: string | null;
  openModal: () => void;
}

const TicketComponent: React.FC<TicketComponentProps> = ({
  event,
  user,
  academy,
  ticketId,
  inscripciones,
  loadingAcademy,
  errorAcademy,
  openModal
}) => {
  // Formatear fecha
  const formatDate = (date: any): string => {
    if (!date) return "Fecha no disponible";
    try {
      // Si es un timestamp de Firestore, usar toDate()
      const jsDate = date.toDate ? date.toDate() : new Date(date);
      return jsDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Fecha no válida";
    }
  };

  // Imprimir ticket
  const handlePrint = (): void => {
    window.print();
  };

  // Reiniciar para nueva inscripción
  const handleNewInscription = (): void => {
    // Esta función debe ser proporcionada desde el componente padre
    window.location.reload();
  };

  // Calcular total de inscripciones
  const totalInscripciones = inscripciones.length;
  const montoTotal = inscripciones.reduce((sum, insc) => sum + insc.precio, 0);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md">
      {/* Encabezado de éxito */}
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">
          ¡Inscripción completada con éxito!
        </h2>
        <p className="text-gray-600">
          Se ha generado un ticket con la información de tus inscripciones
        </p>
      </div>

      {/* Datos del ticket */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6 print:border-none">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Datos del Ticket</h3>
            <p className="text-sm text-gray-600">ID: {ticketId}</p>
          </div>
          <div className="hidden print:block text-right">
            <p className="text-xs text-gray-500">Generado el {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex space-x-2 print:hidden">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white py-1.5 px-3 rounded hover:bg-blue-700 transition-colors text-sm flex items-center"
            >
              <Printer className="w-4 h-4 mr-1" />
              Imprimir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Evento</h4>
            <p className="text-base">{event.name}</p>
            <p className="text-sm text-gray-600">
              {event.startDate && `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`}
            </p>
            {event.location && (
              <button 
                onClick={openModal}
                className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center print:hidden"
              >
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {event.location.placeName}
              </button>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Academia</h4>
            {loadingAcademy ? (
              <p className="text-sm text-gray-500">Cargando información...</p>
            ) : errorAcademy ? (
              <p className="text-sm text-red-500">Error al cargar información</p>
            ) : academy ? (
              <>
                <p className="text-base">{academy.name}</p>
                {academy.contactInfo && (
                  <p className="text-sm text-gray-600">{academy.contactInfo.email || ''}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">Información no disponible</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Inscripciones</h4>
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modalidad
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participante
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pareja
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inscripciones.map((inscripcion, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                      {inscripcion.modalidad}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <p className="font-medium text-gray-800">{inscripcion.participante.nombre}</p>
                      <p className="text-xs text-gray-500">DNI: {inscripcion.participante.dni}</p>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {inscripcion.pareja ? (
                        <>
                          <p className="font-medium text-gray-800">{inscripcion.pareja.nombre}</p>
                          <p className="text-xs text-gray-500">DNI: {inscripcion.pareja.dni}</p>
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                      {inscripcion.category}
                      {inscripcion.isPullCouple && (
                        <span className="ml-1 px-1 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                          JP
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-700">
                      S/. {inscripcion.precio}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-medium">
                  <td colSpan={4} className="px-3 py-2 text-right text-gray-700">
                    Total:
                  </td>
                  <td className="px-3 py-2 text-right text-gray-800 font-bold">
                    S/. {montoTotal}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
          <p className="font-medium mb-1">Importante:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>Este ticket tiene una validez de 72 horas para realizar el pago</li>
            <li>Una vez realizado el pago, la inscripción quedará confirmada</li>
            <li>Para consultas o problemas, comunícate con el organizador del evento</li>
          </ul>
        </div>
      </div>

      {/* Botón para nueva inscripción */}
      <div className="text-center print:hidden">
        <button
          onClick={handleNewInscription}
          className="py-2 px-6 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center mx-auto"
        >
          <RefreshCcw className="w-5 h-5 mr-2" />
          Realizar nueva inscripción
        </button>
      </div>
    </div>
  );
};

export default TicketComponent;