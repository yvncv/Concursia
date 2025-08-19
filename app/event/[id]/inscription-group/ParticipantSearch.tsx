import { useState, useCallback, useEffect } from "react";
import { getFirestore, doc, getDoc, DocumentData } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { Search, AlertCircle, Users, CheckCircle, User } from "lucide-react";
import { User as UserType } from "@/app/types/userType";
import { useParticipantSearch, Participante } from "@/app/hooks/useParticipantSearch";
import { usePullCoupleValidation } from "@/app/hooks/usePullCoupleValidation";
import ParticipantCard from "./components/ParticipantCard";
import AcademySelector from "../components/AcademySelector";

// Definición de tipos
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

interface ParticipantSearchProps {
  eventId: string;
  modalidad: string;
  requierePareja: boolean;
  categoriasDisponibles: string[];
  user: UserType;
  academies: Academy[];
  inscripcionesExistentes: Inscripcion[];
  loadingAcademies: boolean;
  onParticipantFound: (participante: Participante, academia: string) => void;
  onCoupleFound: (pareja: Participante, academia: string, esLibre: boolean) => void;
  onValidationChange: (isValid: boolean) => void;
  onPullCoupleChange: (data: { aplicar: boolean; categoriaFinal: string }) => void;
  getParticipantCategory: (participante: { birthDate: Date }) => string;
}

const ParticipantSearch: React.FC<ParticipantSearchProps> = ({
  eventId,
  modalidad,
  requierePareja,
  categoriasDisponibles,
  user,
  academies,
  inscripcionesExistentes,
  loadingAcademies,
  onParticipantFound,
  onCoupleFound,
  onValidationChange,
  onPullCoupleChange,
  getParticipantCategory
}) => {
  // Hooks de búsqueda de participantes
  const {
    participantInfo: participanteInfo,
    searchError: searchErrorParticipante,
    isSearching: isSearchingParticipante,
    searchParticipant: buscarParticipante,
    clearParticipant: limpiarParticipante
  } = useParticipantSearch();

  const {
    participantInfo: parejaInfo,
    searchError: searchErrorPareja,
    isSearching: isSearchingPareja,
    searchParticipant: buscarPareja,
    clearParticipant: limpiarPareja
  } = useParticipantSearch();

  // Estados locales
  const [dniParticipante, setDniParticipante] = useState<string>("");
  const [dniPareja, setDniPareja] = useState<string>("");
  const [academiaPareja, setAcademiaPareja] = useState<string>("");
  const [academiaParejaNombre, setAcademiaParejaNombre] = useState<string>("Libre");
  const [eventSettings, setEventSettings] = useState<DocumentData | null>(null);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);

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

  // Función para obtener categoría de un participante
  const getParticipantCategoryFromBirthDate = useCallback((birthDate: any): string => {
    if (!birthDate) return "Sin categoría";

    const fechaNac = convertToDate(birthDate);
    return getParticipantCategory({ birthDate: fechaNac });
  }, [getParticipantCategory, convertToDate]);

  // Auto-selección de academia para la pareja
  useEffect(() => {
    if (parejaInfo?.academyId && parejaInfo?.academyName) {
      setAcademiaPareja(parejaInfo.academyId);
      setAcademiaParejaNombre(parejaInfo.academyName);
    } else if (parejaInfo && (!parejaInfo.academyId || !parejaInfo.academyName)) {
      setAcademiaPareja("");
      setAcademiaParejaNombre("Libre");
    }
  }, [parejaInfo]);

  // Handler para selección de academia de la pareja
  const handleCoupleAcademySelect = useCallback((academyId: string, academyName: string) => {
    setAcademiaPareja(academyId);
    setAcademiaParejaNombre(academyName);
  }, []);

  // Hook de validación de parejas
  const {
    allowed: pullCoupleAllowed,
    message: pullCoupleMessage,
    diferenciaValor,
    categoriaFinal,
    esMayorParticipante
  } = usePullCoupleValidation(participanteInfo, parejaInfo, eventSettings as any);

  // Cargar configuraciones del evento
  useEffect(() => {
    const loadEventSettings = async (): Promise<void> => {
      if (!eventId) return;

      try {
        setLoadingSettings(true);
        const db = getFirestore();
        const settingsRef = doc(db, "settings", eventId);
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          setEventSettings(settingsSnap.data());
        } else {
          setEventSettings(null);
        }
      } catch (error) {
        console.error("Error al cargar configuraciones:", error);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadEventSettings();
  }, [eventId]);

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

  // Verificar si la categoría está disponible en la modalidad
  const esCategoriaDisponible = useCallback((categoria: string): boolean => {
    return categoriasDisponibles.includes(categoria);
  }, [categoriasDisponibles]);

  // Verificar compatibilidad de géneros
  const sonGenerosCompatibles = useCallback((): boolean => {
    if (!participanteInfo || !parejaInfo) return false;
    return participanteInfo.gender !== parejaInfo.gender;
  }, [participanteInfo, parejaInfo]);

  // Verificar si ya existe una inscripción duplicada
  const existeInscripcionDuplicada = useCallback((): boolean => {
    if (!participanteInfo) return false;

    const participanteDuplicado = inscripcionesExistentes.some(inscripcion =>
      inscripcion.modalidad === modalidad &&
      (inscripcion.participante.id === participanteInfo.id ||
        (inscripcion.pareja && inscripcion.pareja.id === participanteInfo.id))
    );

    const parejaDuplicada = requierePareja && parejaInfo && inscripcionesExistentes.some(inscripcion =>
      inscripcion.modalidad === modalidad &&
      (inscripcion.participante.id === parejaInfo.id ||
        (inscripcion.pareja && inscripcion.pareja.id === parejaInfo.id))
    );

    return participanteDuplicado || (parejaInfo ? parejaDuplicada : false);
  }, [participanteInfo, parejaInfo, inscripcionesExistentes, modalidad, requierePareja]);

  // Validar que el participante pertenezca a la academia del usuario
  const validarAcademiaParticipante = useCallback((): string | null => {
    if (!participanteInfo) return null;

    // Verificar si el participante pertenece a la academia del usuario
    const userAcademyId = user.marinera?.academyId;

    if (userAcademyId && participanteInfo.academyId !== userAcademyId) {
      return `Este estudiante no es de tu academia. Seleccione un participante de tu academia.`;
    }

    // Si el participante no tiene academia asignada
    if (!participanteInfo.academyId || !participanteInfo.academyName) {
      return `Este estudiante no tiene academia asignada.`;
    }

    return null;
  }, [participanteInfo, user.marinera?.academyId]);

  // Validar categoría del participante
  const validarCategoriaParticipante = useCallback((): string | null => {
    if (!participanteInfo) return null;

    // Primero validar que sea de tu academia
    const errorAcademia = validarAcademiaParticipante();
    if (errorAcademia) return errorAcademia;

    const categoriaParticipante = getParticipantCategoryFromBirthDate(participanteInfo.birthDate);

    if (!esCategoriaDisponible(categoriaParticipante)) {
      return `La categoría del participante (${categoriaParticipante}) no está disponible en esta modalidad`;
    }

    if (existeInscripcionDuplicada()) {
      return `El participante ya está inscrito en la modalidad ${modalidad}`;
    }

    return null;
  }, [participanteInfo, validarAcademiaParticipante, esCategoriaDisponible, existeInscripcionDuplicada, modalidad, getParticipantCategoryFromBirthDate]);

  // Validar pareja
  const validarPareja = useCallback((): string | null => {
    if (!requierePareja || !participanteInfo || !parejaInfo) return null;

    if (!sonGenerosCompatibles()) {
      return "La pareja debe ser de género opuesto (hombre-mujer)";
    }

    const categoriaPareja = getParticipantCategoryFromBirthDate(parejaInfo.birthDate);

    if (!esCategoriaDisponible(categoriaPareja)) {
      return `La categoría de la pareja (${categoriaPareja}) no está disponible en esta modalidad`;
    }

    if (!pullCoupleAllowed && diferenciaValor > 0) {
      return pullCoupleMessage || "Las categorías no son compatibles para inscripción";
    }

    return null;
  }, [
    requierePareja,
    participanteInfo,
    parejaInfo,
    sonGenerosCompatibles,
    esCategoriaDisponible,
    pullCoupleAllowed,
    diferenciaValor,
    pullCoupleMessage,
    getParticipantCategoryFromBirthDate
  ]);

  // Determinar si el formulario es válido
  const esFormularioValido = useCallback((): boolean => {
    if (!participanteInfo) return false;
    if (validarCategoriaParticipante()) return false;

    if (requierePareja) {
      // Debe haber pareja encontrada
      if (!parejaInfo) return false;
      // Y debe tener academia seleccionada O ser "Libre"
      if (!academiaPareja && academiaParejaNombre !== "Libre") return false;
      // Y no debe haber errores de validación
      if (validarPareja()) return false;
    }

    return true;
  }, [
    participanteInfo,
    validarCategoriaParticipante,
    requierePareja,
    parejaInfo,
    academiaPareja,
    academiaParejaNombre,
    validarPareja
  ]);

  // Manejar búsqueda de participante
  const handleBuscarParticipante = useCallback(async (): Promise<void> => {
    if (!dniParticipante.trim()) {
      return;
    }

    try {
      await buscarParticipante(dniParticipante);
    } catch (error) {
      console.error("Error al buscar participante:", error);
    }
  }, [buscarParticipante, dniParticipante]);

  // Manejar búsqueda de pareja
  const handleBuscarPareja = useCallback(async (): Promise<void> => {
    if (!dniPareja.trim()) {
      return;
    }

    if (dniPareja === dniParticipante) {
      return;
    }

    try {
      await buscarPareja(dniPareja, dniParticipante);
    } catch (error) {
      console.error("Error al buscar pareja:", error);
    }
  }, [buscarPareja, dniPareja, dniParticipante]);

  // Estado derivado: determinar si se aplicará jalar pareja
  const aplicarJalarPareja = useCallback((): boolean => {
    return requierePareja &&
      parejaInfo !== null &&
      pullCoupleAllowed &&
      diferenciaValor > 0;
  }, [requierePareja, parejaInfo, pullCoupleAllowed, diferenciaValor]);

  // Notificar cambios de pull couple al componente padre
  useEffect(() => {
    if (pullCoupleAllowed && diferenciaValor > 0) {
      onPullCoupleChange({
        aplicar: true,
        categoriaFinal: categoriaFinal as string
      });
    } else {
      onPullCoupleChange({
        aplicar: false,
        categoriaFinal: participanteInfo ? getParticipantCategoryFromBirthDate(participanteInfo.birthDate) : ""
      });
    }
  }, [pullCoupleAllowed, diferenciaValor, categoriaFinal, participanteInfo, onPullCoupleChange, getParticipantCategoryFromBirthDate]);

  // Notificar cambios de validación al componente padre
  useEffect(() => {
    onValidationChange(esFormularioValido());
  }, [esFormularioValido, onValidationChange]);

  // Notificar datos al componente padre cuando están listos
  useEffect(() => {
    if (participanteInfo && !validarCategoriaParticipante()) {
      // Para el participante, usamos su propia academyId
      onParticipantFound(participanteInfo, participanteInfo.academyId || "");
    }
  }, [participanteInfo, validarCategoriaParticipante, onParticipantFound]);

  // CORREGIDO: Notificar pareja con flag de "Libre"
  useEffect(() => {
    if (parejaInfo && !validarPareja()) {
      const academyIdToSend = academiaParejaNombre === "Libre" ? "" : academiaPareja;
      const esLibre = academiaParejaNombre === "Libre";
      onCoupleFound(parejaInfo, academyIdToSend, esLibre);
    }
  }, [parejaInfo, academiaPareja, academiaParejaNombre, validarPareja, onCoupleFound]);

  return (
    <div className="space-y-6">
      {/* Sección de Datos del Participante */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <label className="block text-sm font-medium text-blue-800 mb-4 flex items-center">
          <User className="w-4 h-4 mr-2" />
          Datos del Participante
        </label>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DNI del Participante
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={dniParticipante}
                onChange={(e) => setDniParticipante(e.target.value)}
                placeholder="12345678"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                maxLength={8}
              />
              <button
                onClick={handleBuscarParticipante}
                disabled={isSearchingParticipante}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center min-w-[100px]"
              >
                {isSearchingParticipante ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </>
                )}
              </button>
            </div>
          </div>

          {searchErrorParticipante && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {searchErrorParticipante}
            </div>
          )}

          {validarCategoriaParticipante() && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {validarCategoriaParticipante()}
            </div>
          )}

          {/* Card del participante - solo si es válido */}
          {participanteInfo && !validarCategoriaParticipante() && (
            <div className="mt-4">
              <ParticipantCard
                participant={participanteInfo}
                calcularEdad={getEdadDisplay}
                type="participante"
                getParticipantCategory={getParticipantCategory}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sección de Datos de la Pareja - Solo visible si requiere pareja */}
      {requierePareja && (
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <label className="block text-sm font-medium text-purple-800 mb-4 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Datos de la Pareja
          </label>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DNI de la Pareja
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dniPareja}
                  onChange={(e) => setDniPareja(e.target.value)}
                  placeholder="87654321"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  maxLength={8}
                  disabled={!participanteInfo || !!validarCategoriaParticipante()}
                />
                <button
                  onClick={handleBuscarPareja}
                  disabled={isSearchingPareja || !participanteInfo || !!validarCategoriaParticipante()}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                >
                  {isSearchingPareja ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </>
                  )}
                </button>
              </div>
            </div>

            {searchErrorPareja && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {searchErrorPareja}
              </div>
            )}

            {validarPareja() && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {validarPareja()}
              </div>
            )}

            {/* Selección de academia de la pareja */}
            {parejaInfo && !validarPareja() && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <div className="w-4 h-4 bg-purple-100 rounded mr-2 flex items-center justify-center">
                    <div className="w-2 h-2 bg-purple-500 rounded"></div>
                  </div>
                  Academia de la Pareja
                </label>
                <AcademySelector
                  onAcademySelect={handleCoupleAcademySelect}
                  initialAcademyId={parejaInfo?.academyId || ""}
                  initialAcademyName={parejaInfo?.academyName || "Libre"}
                  theme="light"
                  placeholder="Buscar o seleccionar academia..."
                  required={true}
                  disabled={loadingAcademies || (!!parejaInfo?.academyId && !!parejaInfo?.academyName)}
                />
              </div>
            )}
            {/* Card de la pareja - solo si es válida */}
            {parejaInfo && !validarPareja() && (
              <div className="mt-4">
                <ParticipantCard
                  participant={parejaInfo}
                  calcularEdad={getEdadDisplay}
                  type="pareja"
                  getParticipantCategory={getParticipantCategory}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensaje informativo de jalar pareja */}
      {aplicarJalarPareja() && (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <div className="flex items-start">
            <div className="bg-yellow-100 p-1 rounded mr-3">
              <Users className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-800 font-medium">
                🤝 Se aplicará "Jalar Pareja"
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Categoría final: <strong>{categoriaFinal}</strong>
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                {pullCoupleMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estados de carga */}
      {loadingSettings && (
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
            <p className="text-sm text-gray-600">Cargando configuraciones del evento...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantSearch;