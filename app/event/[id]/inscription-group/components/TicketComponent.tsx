import React from "react";
import { MapPin, Download, Users, Calendar, Clock, Award, Building2 } from "lucide-react";
import toast from 'react-hot-toast';

// Definición de tipos
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
  location?: EventLocation;
  date?: any;
}

interface Academy {
  id: string;
  name: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  marinera?: {
    academyName?: string;
  };
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

interface TicketComponentProps {
  event: Event;
  user: User;
  academy: Academy | null;
  ticketId: string;
  inscripciones: Inscripcion[];
  loadingAcademy: boolean;
  errorAcademy: string | null;
  openModal: () => void;
  onNewInscription?: () => void;
  getParticipantCategory: (participante: { birthDate: Date }) => string;
}

const TicketComponent: React.FC<TicketComponentProps> = ({
  event,
  user,
  academy,
  ticketId,
  inscripciones,
  loadingAcademy,
  errorAcademy,
  openModal,
  onNewInscription,
  getParticipantCategory
}) => {
  
  const totalAmount = inscripciones.reduce((sum, insc) => sum + insc.precio, 0);
  const totalParticipants = inscripciones.reduce((total, insc) => total + (insc.pareja ? 2 : 1), 0);
  const uniqueAcademies = new Set([
    ...inscripciones.map(insc => insc.participante.academyName),
    ...inscripciones.filter(insc => insc.pareja).map(insc => insc.pareja!.academyName)
  ]);

  const handleDownloadTicket = () => {
    toast.promise(
      new Promise((resolve) => {
        // Simular descarga
        setTimeout(() => resolve("Ticket preparado"), 2000);
      }),
      {
        loading: 'Preparando descarga...',
        success: '¡Ticket listo para descargar!',
        error: 'Error al preparar descarga'
      }
    );
  };

  const handleCopyTicketId = () => {
    navigator.clipboard.writeText(ticketId);
    toast.success("ID del ticket copiado al portapapeles", {
      icon: '📋'
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header del ticket */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🎉 ¡Inscripción Exitosa!</h2>
            <p className="text-green-100">Ticket de inscripción grupal generado</p>
          </div>
          <div className="text-right">
            <p className="text-green-100 text-sm">Ticket ID</p>
            <button
              onClick={handleCopyTicketId}
              className="text-xl font-mono bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition-colors"
              title="Hacer clic para copiar"
            >
              {ticketId.slice(0, 8)}...
            </button>
          </div>
        </div>
      </div>

      {/* Contenido del ticket */}
      <div className="p-6">
        {/* Información del evento */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Información del Evento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Evento:</span>
              <p className="text-gray-900">{event.name}</p>
            </div>
            {event.date && (
              <div>
                <span className="font-medium text-gray-600">Fecha:</span>
                <p className="text-gray-900">{event.date}</p>
              </div>
            )}
            {event.location && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">Ubicación:</span>
                <button
                  onClick={openModal}
                  className="text-blue-600 hover:text-blue-800 flex items-center mt-1"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  {event.location.placeName}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resumen de inscripciones */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Resumen de Inscripciones
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded border">
              <p className="text-2xl font-bold text-blue-600">{inscripciones.length}</p>
              <p className="text-xs text-gray-600">Inscripciones</p>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <p className="text-2xl font-bold text-green-600">{totalParticipants}</p>
              <p className="text-xs text-gray-600">Participantes</p>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <p className="text-2xl font-bold text-purple-600">{uniqueAcademies.size}</p>
              <p className="text-xs text-gray-600">Academias</p>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <p className="text-2xl font-bold text-orange-600">S/. {totalAmount}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>
        </div>

        {/* Lista detallada de inscripciones */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Detalle de Inscripciones
          </h3>
          <div className="space-y-3">
            {inscripciones.map((inscripcion, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{inscripcion.modalidad}</h4>
                    <p className="text-sm text-gray-600">Categoría: {inscripcion.category}</p>
                    {inscripcion.isPullCouple && (
                      <div className="mt-1">
                        <span className="inline-block text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Jalar Pareja aplicado
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Categorías originales: {getParticipantCategory({ birthDate: inscripcion.participante.birthDate })} / 
                          {inscripcion.pareja && getParticipantCategory({ birthDate: inscripcion.pareja.birthDate })}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">S/. {inscripcion.precio}</p>
                    <p className="text-xs text-gray-500">{inscripcion.pareja ? 'Parejas' : 'Individual'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Participante:</p>
                    <p className="text-gray-900">{inscripcion.participante.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {inscripcion.participante.academyName} • 
                      Cat: {getParticipantCategory({ birthDate: inscripcion.participante.birthDate })}
                    </p>
                  </div>
                  
                  {inscripcion.pareja && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Pareja:</p>
                      <p className="text-gray-900">{inscripcion.pareja.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {inscripcion.pareja.academyName} • 
                        Cat: {getParticipantCategory({ birthDate: inscripcion.pareja.birthDate })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Información del inscriptor */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Información del Inscriptor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Inscrito por:</span>
              <p className="text-gray-900">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Academia:</span>
              <p className="text-gray-900">
                {loadingAcademy ? (
                  <span className="text-gray-500">Cargando...</span>
                ) : errorAcademy ? (
                  <span className="text-red-500">Error al cargar</span>
                ) : (
                  user.marinera?.academyName || 'No especificada'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Información de pago */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Estado de Pago
          </h3>
          <div className="text-sm">
            <p className="text-yellow-800 mb-2">
              <strong>Estado:</strong> <span className="bg-yellow-200 px-2 py-1 rounded text-xs">Pendiente de pago</span>
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">

          
          {onNewInscription && (
            <button
              onClick={onNewInscription}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <Users className="w-5 h-5 mr-2" />
              Nueva Inscripción
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketComponent;