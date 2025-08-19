import React, { useState, useMemo } from "react";
import { MapPin, Download, Users, Calendar, Clock, Award, Building2, ChevronLeft, ChevronRight, ArrowRight, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import toast from 'react-hot-toast';
import { decryptValue } from "@/app/utils/security/securityHelpers";
import { useExportInscriptions } from "@/app/hooks/tickets/useExportInscriptions"; // Importar el hook

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
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const itemsPerPage = 5;
  
  // Hook de exportación
  const { exportToExcel, exportToCSV, isExporting, canExport } = useExportInscriptions({
    inscripciones,
    eventName: event.name,
    getParticipantCategory
  });
  
  const totalAmount = inscripciones.reduce((sum, insc) => sum + insc.precio, 0);
  const totalParticipants = inscripciones.reduce((total, insc) => total + (insc.pareja ? 2 : 1), 0);
  const uniqueAcademies = new Set([
    ...inscripciones.map(insc => insc.participante.academyName),
    ...inscripciones.filter(insc => insc.pareja).map(insc => insc.pareja!.academyName)
  ]);

  // Cálculos de paginación
  const totalPages = Math.ceil(inscripciones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInscripciones = inscripciones.slice(startIndex, endIndex);

  // Funciones de paginación
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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

  // Funciones de exportación
  const handleExportExcel = () => {
    exportToExcel(false); // false = sin datos personales (DNI)
    setShowExportDropdown(false);
  };

  const handleExportExcelWithDNI = () => {
    exportToExcel(true); // true = con datos personales (DNI)
    setShowExportDropdown(false);
  };

  const handleExportCSV = () => {
    exportToCSV();
    setShowExportDropdown(false);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
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

        {/* Tabla detallada de inscripciones con paginación */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Detalle de Inscripciones
            </h3>
            
            <div className="flex items-center gap-3">
              {/* Botón de exportar */}
              <div className="relative">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  disabled={!canExport || isExporting}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    canExport && !isExporting
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>

                {/* Dropdown de opciones de exportación */}
                {showExportDropdown && canExport && !isExporting && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="py-2">
                      <button
                        onClick={handleExportExcel}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-3 text-green-600" />
                        <div>
                          <div className="font-medium">Excel (.xlsx)</div>
                          <div className="text-xs text-gray-500">Sin datos personales</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={handleExportExcelWithDNI}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-3 text-green-600" />
                        <div>
                          <div className="font-medium">Excel completo (.xlsx)</div>
                          <div className="text-xs text-gray-500">Con DNI y detalles</div>
                        </div>
                      </button>
                      
                      <hr className="my-1" />
                      
                      <button
                        onClick={handleExportCSV}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-3 text-blue-600" />
                        <div>
                          <div className="font-medium">CSV (.csv)</div>
                          <div className="text-xs text-gray-500">Para otros programas</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </div>
              )}
            </div>
          </div>

          {/* Tabla - Versión desktop */}
          <div className="hidden md:block overflow-hidden border border-gray-200 rounded-lg mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modalidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participante
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pareja
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentInscripciones.map((inscripcion, index) => (
                  <tr key={startIndex + index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="font-medium text-gray-900">{inscripcion.level}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{inscripcion.participante.nombre}</p>
                        <p className="text-xs text-gray-500">DNI: {decryptValue(inscripcion.participante.dni)}</p>
                        <p className="text-xs text-blue-600">{inscripcion.participante.academyName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {inscripcion.pareja ? (
                        <div>
                          <p className="font-medium text-gray-800">{inscripcion.pareja.nombre}</p>
                          <p className="text-xs text-gray-500">DNI: {decryptValue(inscripcion.pareja.dni)}</p>
                          <p className="text-xs text-purple-600">{inscripcion.pareja.academyName}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Individual</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {inscripcion.isPullCouple && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full mr-2 font-medium">
                            JP
                          </span>
                        )}
                        <span className="font-medium">{inscripcion.category}</span>
                        {inscripcion.isPullCouple && (
                          <div className="flex items-center text-gray-400 text-xs ml-2">
                            <ArrowRight className="w-3 h-3 mx-1" />
                            <span>
                              ({getParticipantCategory({ birthDate: inscripcion.participante.birthDate })}/
                              {inscripcion.pareja && getParticipantCategory({ birthDate: inscripcion.pareja.birthDate })})
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                      S/. {inscripcion.precio}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista móvil - Cards con paginación */}
          <div className="md:hidden space-y-3 mb-4">
            {currentInscripciones.map((inscripcion, index) => (
              <div key={startIndex + index} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{inscripcion.modalidad}</h4>
                    <p className="text-sm text-gray-600">{inscripcion.level}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {inscripcion.isPullCouple && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 py-1 px-2 rounded-full">
                        JP
                      </span>
                    )}
                    <span className="font-semibold text-green-600">S/. {inscripcion.precio}</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Participante:</span> {inscripcion.participante.nombre}
                    <div className="text-xs text-gray-500">
                      {inscripcion.participante.academyName} • DNI: {decryptValue(inscripcion.participante.dni)}
                    </div>
                  </div>
                  
                  {inscripcion.pareja && (
                    <div>
                      <span className="font-medium">Pareja:</span> {inscripcion.pareja.nombre}
                      <div className="text-xs text-gray-500">
                        {inscripcion.pareja.academyName} • DNI: {decryptValue(inscripcion.pareja.dni)}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t">
                    <span><strong>Categoría:</strong> {inscripcion.category}</span>
                    {inscripcion.isPullCouple && (
                      <div className="text-xs text-gray-500 mt-1">
                        Categorías originales: {getParticipantCategory({ birthDate: inscripcion.participante.birthDate })} / 
                        {inscripcion.pareja && getParticipantCategory({ birthDate: inscripcion.pareja.birthDate })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center text-sm text-gray-500">
                <span>
                  Mostrando {startIndex + 1} a {Math.min(endIndex, inscripciones.length)} de {inscripciones.length} inscripciones
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {/* Números de página */}
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
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

        {/* Cerrar dropdown al hacer clic fuera */}
        {showExportDropdown && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setShowExportDropdown(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default TicketComponent;