import React from "react";
import { CheckCircle, Trash2, ArrowRight } from "lucide-react";

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

interface InscriptionListProps {
  inscripciones: Inscripcion[];
  eliminarInscripcion: (index: number) => void;
  confirmarInscripciones: () => void;
  isSubmitting: boolean;
  montoTotal: number;
  event: Event;
}

const InscriptionList: React.FC<InscriptionListProps> = ({
  inscripciones,
  eliminarInscripcion,
  confirmarInscripciones,
  isSubmitting,
  montoTotal,
  event
}) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
        Inscripciones ({inscripciones.length})
      </h3>

      {inscripciones.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 rounded-md bg-gray-50">
          <p className="text-gray-500">No hay inscripciones agregadas</p>
          <p className="text-sm text-gray-400 mt-1">
            Utiliza el formulario para agregar inscripciones
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Lista de inscripciones */}
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modalidad
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participante
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pareja
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inscripciones.map((inscripcion, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">
                      {inscripcion.modalidad}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{inscripcion.participante.nombre}</p>
                        <p className="text-xs text-gray-500">DNI: {inscripcion.participante.dni}</p>
                        <p className="text-xs text-gray-500">{inscripcion.participante.academyName}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      {inscripcion.pareja ? (
                        <div>
                          <p className="font-medium text-gray-800">{inscripcion.pareja.nombre}</p>
                          <p className="text-xs text-gray-500">DNI: {inscripcion.pareja.dni}</p>
                          <p className="text-xs text-gray-500">{inscripcion.pareja.academyName}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {inscripcion.isPullCouple && (
                          <div className="mr-2 flex items-center">
                            <span className="text-xs bg-yellow-100 text-yellow-800 py-0.5 px-1.5 rounded">
                              JP
                            </span>
                          </div>
                        )}
                        {inscripcion.category}
                        {inscripcion.isPullCouple && (
                          <div className="flex items-center text-gray-400 text-xs ml-1">
                            <ArrowRight className="w-3 h-3 mx-0.5" />
                            <span>desde {inscripcion.participante.originalCategory}/{inscripcion.pareja?.originalCategory}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-700">
                      S/. {inscripcion.precio}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => eliminarInscripcion(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Eliminar inscripción"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen y botón para confirmar */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total de inscripciones: <span className="font-semibold">{inscripciones.length}</span></p>
                <p className="text-gray-800 font-bold text-lg">Monto total: S/. {montoTotal}</p>
              </div>
              <button
                onClick={confirmarInscripciones}
                disabled={isSubmitting || inscripciones.length === 0}
                className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirmar inscripciones
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Al confirmar, se generará un ticket de pago con la información de las inscripciones.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InscriptionList;