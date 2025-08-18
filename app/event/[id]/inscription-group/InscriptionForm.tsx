import { useState, useCallback } from "react";
import { UserPlus, Award, CheckCircle } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { User } from "@/app/types/userType";
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
  const [esParejLibre, setEsParejLibre] = useState<boolean>(false); // NUEVO ESTADO
  const [formularioValido, setFormularioValido] = useState<boolean>(false);
  const [pullCoupleData, setPullCoupleData] = useState<{
    aplicar: boolean;
    categoriaFinal: string;
  }>({ aplicar: false, categoriaFinal: "" });
  const [participantSearchKey, setParticipantSearchKey] = useState<number>(0);

  // Determinar si la modalidad requiere pareja
  const requierePareja: boolean = event.settings.levels[modalidad]?.couple || false;

  // Obtener categorías disponibles para la modalidad actual
  const categoriasDisponibles: string[] = event.settings.levels[modalidad]?.categories || [];

  // Opciones de modalidades
  const modalidades: string[] = Object.keys(event.settings.levels || {});

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
  const handleModalidadChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
    const nuevaModalidad = e.target.value;
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

  // CORREGIDO: Manejar pareja encontrada con flag de "Libre"
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

  // CORREGIDO: Manejar envío del formulario
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

    // CORREGIDO: Validación de pareja
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

    // CORREGIDO: Crear objeto de inscripción
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
        {/* Selección de modalidad */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <label className="block text-sm font-medium text-blue-800 mb-3 flex items-center">
            <Award className="w-4 h-4 mr-2" />
            Modalidad de Competencia
          </label>

          <select
            value={modalidad}
            onChange={handleModalidadChange}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-base font-medium"
          >
            {modalidades.map(mod => (
              <option key={mod} value={mod}>{mod}</option>
            ))}
          </select>

          {/* Información de la modalidad en cards horizontales */}
          {modalidad && (
            <div className="space-y-3">
              {/* Primera fila: Precio y Tipo */}
              <div className="grid grid-cols-2 gap-3">
                {/* Card de Precio */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Precio</span>
                    <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-gray-900">
                      S/. {event.settings.levels[modalidad]?.price || 0}
                    </span>
                  </div>
                </div>

                {/* Card de Tipo */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tipo</span>
                    <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-semibold text-purple-600">
                      {requierePareja ? 'Parejas' : 'Individual'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Segunda fila: Categorías (ocupando todo el ancho) */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Categorías disponibles:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {categoriasDisponibles.length > 0 ? (
                    categoriasDisponibles.map((categoria, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                      >
                        {categoria}
                      </span>
                    ))
                  ) : (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      Todas
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

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