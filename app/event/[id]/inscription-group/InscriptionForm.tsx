import { useState, useCallback } from "react";
import { UserPlus, Award, CheckCircle, Users, User as UserIcon } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import type { User } from "@/app/types/userType";
import { Participante } from "@/app/hooks/useParticipantSearch";
import { LevelData } from "@/app/types/eventType";
import ParticipantSearch from "./ParticipantSearch";

// Definición de tipos
interface EventSettings {
  levels: {
    [key: string]: LevelData;
  };
}

interface Event {
  id: string;
  name: string;
  academyId?: string;
  settings: EventSettings;
}

interface Academy {
  id: string;
  name: string;
}

interface Inscripcion {
  modalidad: string;
  level: string;
  category: string;
  isPullCouple: boolean;
  participante: {
    id: string;
    nombre: string;
    dni: string;
    edad: string | number;
    genero: string;
    telefono: string;
    academyId: string;
    academyName: string;
    birthDate: Date;
  };
  pareja: {
    id: string;
    nombre: string;
    dni: string;
    edad: string | number;
    genero: string;
    telefono: string;
    academyId: string;
    academyName: string;
    birthDate: Date;
  } | null;
  precio: number;
}

interface InscriptionFormProps {
  event: Event;
  user: User;
  modalidad: string;
  setModalidad: (modalidad: string) => void;
  agregarInscripcion: (inscripcion: Inscripcion) => void;
  academies: Academy[];
  inscripcionesExistentes?: Inscripcion[];
  loadingAcademies?: boolean;
  getParticipantCategory: (participante: { birthDate: Date }) => string;
}

const InscriptionForm: React.FC<InscriptionFormProps> = ({
  event,
  user,
  modalidad,
  setModalidad,
  agregarInscripcion,
  academies,
  inscripcionesExistentes = [],
  loadingAcademies = false,
  getParticipantCategory
}) => {
  // Estados para participantes encontrados
  const [participanteEncontrado, setParticipanteEncontrado] = useState<Participante | null>(null);
  const [parejaEncontrada, setParejaEncontrada] = useState<Participante | null>(null);
  const [academiaParticipante, setAcademiaParticipante] = useState<string>("");
  const [academiaPareja, setAcademiaPareja] = useState<string>("");
  const [esParejLibre, setEsParejLibre] = useState<boolean>(false);
  const [formularioValido, setFormularioValido] = useState<boolean>(false);
  const [pullCoupleData, setPullCoupleData] = useState<{
    aplicar: boolean;
    categoriaFinal: string;
  }>({ aplicar: false, categoriaFinal: "" });
  const [participantSearchKey, setParticipantSearchKey] = useState<number>(0);

  // Orden específico de modalidades
  const ordenModalidades = [
    "Seriado",
    "Individual", 
    "Novel Novel", 
    "Noveles", 
    "Novel Abierto",
    "Novel Abierto A",
    "Novel Abierto B", 
    "Nacional"
  ];

  // Obtener modalidades disponibles en el orden correcto
  const modalidadesDisponibles = Object.keys(event.settings.levels || {});
  const modalidades: string[] = ordenModalidades.filter(modalidad => 
    modalidadesDisponibles.includes(modalidad)
  );

  // Determinar si la modalidad requiere pareja
  const requierePareja: boolean = event.settings.levels[modalidad]?.couple || false;

  // Obtener categorías disponibles para la modalidad actual
  const categoriasDisponibles: string[] = event.settings.levels[modalidad]?.categories || [];

  // Helper para convertir cualquier tipo de fecha a Date
  const convertToDate = useCallback((dateValue: any): Date => {
    if (!dateValue) return new Date();

    if (dateValue instanceof Timestamp) {
      return dateValue.toDate();
    }

    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }

    if (dateValue instanceof Date) {
      return dateValue;
    }

    // Si es string, número o cualquier otra cosa
    return new Date(dateValue);
  }, []);

  // Obtener la edad para mostrar en la UI
  const getEdadDisplay = useCallback((birthDate: any): string | number => {
    if (!birthDate) return "N/A";

    const hoy = new Date();
    const fechaNac = convertToDate(birthDate);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  }, [convertToDate]);

  // Obtener categoría de un participante
  const getParticipantCategoryFromBirthDate = useCallback((birthDate: any): string => {
    if (!birthDate) return "Sin categoría";

    const fechaNac = convertToDate(birthDate);
    return getParticipantCategory({ birthDate: fechaNac });
  }, [getParticipantCategory, convertToDate]);

  // Manejar cambio de modalidad
  const handleModalidadChange = useCallback((nuevaModalidad: string): void => {
    setModalidad(nuevaModalidad);

    // Limpiar estado al cambiar modalidad
    resetFormulario();
  }, [setModalidad]);

  // Resetear formulario
  const resetFormulario = useCallback(() => {
    setParticipanteEncontrado(null);
    setParejaEncontrada(null);
    setAcademiaParticipante("");
    setAcademiaPareja("");
    setEsParejLibre(false);
    setFormularioValido(false);
    setPullCoupleData({ aplicar: false, categoriaFinal: "" });
    setParticipantSearchKey(prev => prev + 1);
  }, []);

  // Manejar participante encontrado
  const handleParticipantFound = useCallback((participante: Participante, academia: string) => {
    setParticipanteEncontrado(participante);
    setAcademiaParticipante(academia);
  }, []);

  // Manejar pareja encontrada con flag de "Libre"
  const handleCoupleFound = useCallback((pareja: Participante, academia: string, esLibre: boolean = false) => {
    setParejaEncontrada(pareja);
    setAcademiaPareja(academia);
    setEsParejLibre(esLibre);
  }, []);

  // Manejar cambio de validación
  const handleValidationChange = useCallback((isValid: boolean) => {
    setFormularioValido(isValid);
  }, []);

  // Manejar datos de pull couple
  const handlePullCoupleChange = useCallback((data: { aplicar: boolean; categoriaFinal: string }) => {
    setPullCoupleData(data);
  }, []);

  // Manejar envío del formulario
  const handleSubmit = useCallback((): void => {
    console.log("🔍 DEBUGGING handleSubmit:");
    console.log("formularioValido:", formularioValido);
    console.log("participanteEncontrado:", participanteEncontrado);
    console.log("academiaParticipante:", academiaParticipante);
    console.log("requierePareja:", requierePareja);
    console.log("parejaEncontrada:", parejaEncontrada);
    console.log("academiaPareja:", academiaPareja);
    console.log("esParejLibre:", esParejLibre);

    if (!formularioValido || !participanteEncontrado || !academiaParticipante) {
      console.log("❌ Falla validación principal");
      return;
    }

    // Validación de pareja
    if (requierePareja) {
      if (!parejaEncontrada) {
        console.log("❌ Falta pareja");
        return;
      }

      // Permitir si es "Libre" O si tiene academia asignada
      if (!academiaPareja && !esParejLibre) {
        console.log("❌ Pareja sin academia y no es Libre");
        return;
      }
    }

    // Obtener precio según modalidad
    const precioBase = event.settings.levels[modalidad]?.price || 0;

    // Determinar la categoría final
    const categoriaFinal = pullCoupleData.aplicar
      ? pullCoupleData.categoriaFinal
      : getParticipantCategoryFromBirthDate(participanteEncontrado.birthDate);

    // Crear objeto de inscripción
    const nuevaInscripcion: Inscripcion = {
      modalidad,
      level: modalidad,
      category: categoriaFinal,
      isPullCouple: pullCoupleData.aplicar,
      participante: {
        id: participanteEncontrado.id,
        nombre: `${participanteEncontrado.firstName} ${participanteEncontrado.lastName}`,
        dni: participanteEncontrado.dni,
        edad: getEdadDisplay(participanteEncontrado.birthDate),
        genero: participanteEncontrado.gender,
        telefono: participanteEncontrado.phoneNumber?.[0] || "No disponible",
        academyId: academiaParticipante,
        academyName: academies.find(a => a.id === academiaParticipante)?.name || "Academia no especificada",
        birthDate: convertToDate(participanteEncontrado.birthDate)
      },
      pareja: parejaEncontrada ? {
        id: parejaEncontrada.id,
        nombre: `${parejaEncontrada.firstName} ${parejaEncontrada.lastName}`,
        dni: parejaEncontrada.dni,
        edad: getEdadDisplay(parejaEncontrada.birthDate),
        genero: parejaEncontrada.gender,
        telefono: parejaEncontrada.phoneNumber?.[0] || "No disponible",
        academyId: academiaPareja || "", // Vacío si es libre
        academyName: esParejLibre ? "Libre" : (academies.find(a => a.id === academiaPareja)?.name || "Academia no especificada"),
        birthDate: convertToDate(parejaEncontrada.birthDate)
      } : null,
      precio: precioBase
    };

    console.log("📝 Llamando agregarInscripcion con:", nuevaInscripcion);

    // Agregar a la lista de inscripciones
    agregarInscripcion(nuevaInscripcion);

    // Limpiar formulario
    resetFormulario();
  }, [
    formularioValido,
    participanteEncontrado,
    academiaParticipante,
    requierePareja,
    parejaEncontrada,
    academiaPareja,
    esParejLibre,
    event.settings.levels,
    modalidad,
    pullCoupleData,
    getEdadDisplay,
    getParticipantCategoryFromBirthDate,
    academies,
    agregarInscripcion,
    resetFormulario,
    convertToDate
  ]);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
        Nueva inscripción
      </h3>

      <div className="space-y-6">
        {/* Tabs de modalidades */}
        <div className="bg-gray-50 rounded-lg p-1 border border-gray-200">
          <div className="flex flex-wrap gap-1">
            {modalidades.map(mod => {
              const isPareja = event.settings.levels[mod]?.couple || false;
              const precio = event.settings.levels[mod]?.price || 0;
              const isActive = modalidad === mod;
              
              return (
                <button
                  key={mod}
                  onClick={() => handleModalidadChange(mod)}
                  className={`
                    flex-1 min-w-0 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200
                    flex items-center justify-center gap-2
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-md transform scale-105'
                      : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
                    }
                  `}
                >
                  {/* Icono según tipo */}
                  {isPareja ? (
                    <Users className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <UserIcon className="w-4 h-4 flex-shrink-0" />
                  )}
                  
                  {/* Nombre y precio */}
                  <div className="flex flex-col items-center min-w-0">
                    <span className="truncate max-w-full">{mod}</span>
                    <span className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      S/. {precio}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Información de la modalidad seleccionada */}
        {modalidad && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              {/* Categorías disponibles */}
              <div className="flex items-center gap-2">
                <span className="text-blue-700 text-sm font-medium">Categorías:</span>
                <div className="flex gap-1 flex-wrap">
                  {categoriasDisponibles.length > 0 ? (
                    categoriasDisponibles.map((categoria, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200"
                      >
                        {categoria}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      Todas las categorías
                    </span>
                  )}
                </div>
              </div>

              {/* Precio */}
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                S/. {event.settings.levels[modalidad]?.price || 0}
              </div>
            </div>
          </div>
        )}

        {/* Componente de búsqueda de participantes */}
        <ParticipantSearch
          key={participantSearchKey}
          eventId={event.id}
          modalidad={modalidad}
          requierePareja={requierePareja}
          categoriasDisponibles={categoriasDisponibles}
          user={user}
          academies={academies}
          inscripcionesExistentes={inscripcionesExistentes}
          loadingAcademies={loadingAcademies}
          onParticipantFound={handleParticipantFound}
          onCoupleFound={handleCoupleFound}
          onValidationChange={handleValidationChange}
          onPullCoupleChange={handlePullCoupleChange}
          getParticipantCategory={getParticipantCategory}
        />

        {/* Preview de la inscripción */}
        {formularioValido && participanteEncontrado && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 shadow-sm">
            <h4 className="font-semibold text-green-800 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Preview de inscripción
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 border">
                <h5 className="font-medium text-gray-700 mb-2">Información general</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modalidad:</span>
                    <span className="font-medium">{modalidad}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoría:</span>
                    <span className="font-medium">
                      {pullCoupleData.aplicar ? pullCoupleData.categoriaFinal : getParticipantCategoryFromBirthDate(participanteEncontrado.birthDate)}
                      {pullCoupleData.aplicar && <span className="text-yellow-600 ml-1">(JP)</span>}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio:</span>
                    <span className="font-bold text-green-600">
                      S/. {event.settings.levels[modalidad]?.price || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Participantes:</span>
                    <span className="font-medium">{requierePareja ? '2' : '1'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <h5 className="font-medium text-gray-700 mb-2">Participantes</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Participante:</span>
                    <p className="font-medium">{participanteEncontrado.firstName} {participanteEncontrado.lastName}</p>
                    <p className="text-xs text-gray-500">
                      {academies.find(a => a.id === academiaParticipante)?.name}
                    </p>
                  </div>

                  {parejaEncontrada && (
                    <div>
                      <span className="text-gray-600">Pareja:</span>
                      <p className="font-medium">{parejaEncontrada.firstName} {parejaEncontrada.lastName}</p>
                      <p className="text-xs text-gray-500">
                        {esParejLibre ? "Libre" : academies.find(a => a.id === academiaPareja)?.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {pullCoupleData.aplicar && (
              <div className="bg-yellow-100 rounded-lg p-3 border border-yellow-300 mb-4">
                <p className="text-yellow-800 text-sm font-medium">
                  ⚠️ Se aplicará "Jalar Pareja" - Categoría final: {pullCoupleData.categoriaFinal}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Botón para agregar inscripción */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={!formularioValido}
            className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-200 transform ${formularioValido
              ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            <span className="flex items-center justify-center">
              <UserPlus className="w-5 h-5 mr-2" />
              {formularioValido ? 'Agregar inscripción' : 'Complete los datos requeridos'}
            </span>
          </button>

          {!formularioValido && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                {!participanteEncontrado && "• Busque y seleccione un participante"}
                {participanteEncontrado && !academiaParticipante && "• Seleccione academia del participante"}
                {requierePareja && participanteEncontrado && !parejaEncontrada && "• Busque una pareja"}
                {requierePareja && parejaEncontrada && !academiaPareja && !esParejLibre && "• Seleccione academia de la pareja"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InscriptionForm;