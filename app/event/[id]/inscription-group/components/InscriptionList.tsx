import React from "react";
import { CheckCircle, Trash2, ArrowRight, Users } from "lucide-react";
import toast from 'react-hot-toast';
import { decryptValue } from "@/app/utils/security/securityHelpers";

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

interface Event {
  id: string;
  name: string;
  academyId?: string;
  settings: EventSettings;
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

interface GroupValidation {
  isValid: boolean;
  message: string;
  invalidInscriptions?: number[];
  userAcademyName?: string;
  totalInscriptions?: number;
  validInscriptions?: number;
}

interface InscriptionListProps {
  inscripciones: Inscripcion[];
  eliminarInscripcion: (index: number) => void;
  confirmarInscripciones: () => void;
  isSubmitting: boolean;
  montoTotal: number;
  event: Event;
  groupValidation: GroupValidation;
}

const InscriptionList: React.FC<InscriptionListProps> = ({
  inscripciones,
  eliminarInscripcion,
  confirmarInscripciones,
  isSubmitting,
  montoTotal,
  event,
  groupValidation
}) => {
  
  const handleEliminarInscripcion = (index: number) => {
    const inscripcion = inscripciones[index];
    const participanteName = inscripcion.participante.nombre;
    
    toast((t) => (
      <div className="flex flex-col">
        <p className="font-medium">¿Eliminar inscripción?</p>
        <p className="text-sm text-gray-600">{participanteName} - {inscripcion.modalidad}</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              eliminarInscripcion(index);
              toast.dismiss(t.id);
            }}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Eliminar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      style: { maxWidth: '300px' }
    });
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          Lista de Inscripciones ({inscripciones.length})
        </h3>
        
        {inscripciones.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {inscripciones.reduce((total, insc) => total + (insc.pareja ? 2 : 1), 0)} participantes
            </p>
          </div>
        )}
      </div>

      {inscripciones.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay inscripciones agregadas</p>
          <p className="text-sm text-gray-400 mt-1">
            Utiliza el formulario arriba para agregar inscripciones
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabla de inscripciones - Versión desktop */}
          <div className="hidden md:block overflow-hidden border border-gray-200 rounded-lg">
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
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inscripciones.map((inscripcion, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="font-medium text-gray-900">{inscripcion.modalidad}</div>
                      <div className="text-xs text-gray-500">{inscripcion.level}</div>
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
                            <span>({inscripcion.participante.originalCategory}/{inscripcion.pareja?.originalCategory})</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                      S/. {inscripcion.precio}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleEliminarInscripcion(index)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Eliminar inscripción"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista móvil - Cards */}
          <div className="md:hidden space-y-3">
            {inscripciones.map((inscripcion, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border">
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
                    <button
                      onClick={() => handleEliminarInscripcion(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Participante:</span> {inscripcion.participante.nombre}
                    <div className="text-xs text-gray-500">{inscripcion.participante.academyName}</div>
                  </div>
                  
                  {inscripcion.pareja && (
                    <div>
                      <span className="font-medium">Pareja:</span> {inscripcion.pareja.nombre}
                      <div className="text-xs text-gray-500">{inscripcion.pareja.academyName}</div>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2 border-t">
                    <span><strong>Categoría:</strong> {inscripcion.category}</span>
                    <span className="font-semibold text-green-600">S/. {inscripcion.precio}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen y botón para confirmar */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div>
                    <span className="text-gray-600">Total inscripciones:</span>
                    <span className="font-semibold ml-2">{inscripciones.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total participantes:</span>
                    <span className="font-semibold ml-2">
                      {inscripciones.reduce((total, insc) => total + (insc.pareja ? 2 : 1), 0)}
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-800">
                  Monto total: <span className="text-green-600">S/. {montoTotal}</span>
                </p>
              </div>
              
              <button
                onClick={confirmarInscripciones}
                disabled={isSubmitting || inscripciones.length === 0 || !groupValidation.isValid}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center ${
                  isSubmitting || inscripciones.length === 0 || !groupValidation.isValid
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg'
                }`}
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
            
            <div className="mt-3 text-xs text-gray-600">
              <p>✓ Al confirmar, se generará un ticket de pago con toda la información.</p>
              {!groupValidation.isValid && (
                <p className="text-red-600 mt-1">⚠️ {groupValidation.message}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InscriptionList;