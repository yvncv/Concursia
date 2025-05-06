import { useState, useCallback, useEffect } from "react";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import { UserPlus, Search, AlertCircle } from "lucide-react";
import ParticipantCard from "./ParticipantCard";
import ErrorModal from "./ErrorModal";
import { User } from "@/app/types/userType";
import { useGlobalCategories } from "@/app/hooks/useGlobalCategories";
import { useParticipantSearch, Participante } from "@/app/hooks/useParticipantSearch";
import { usePullCoupleValidation } from "@/app/hooks/usePullCoupleValidation";
import { LevelData } from "@/app/types/eventType";

// Definición de tipos
interface EventSettings {
  levels: {
    [key: string]: LevelData;
  };
}

interface EventLocation {
  placeName: string;
  coordinates: {
    latitude: string;
    longitude: string;
  };
}

interface Event {
  id: string;
  name: string;
  academyId?: string;
  settings: EventSettings;
  location?: EventLocation;
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
    originalCategory: string;
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
    originalCategory: string;
  } | null;
  precio: number;
}

interface ErrorModalState {
  isOpen: boolean;
  title: string;
  message: string;
}

interface InscriptionFormProps {
  event: Event;
  user: User;
  modalidad: string;
  setModalidad: (modalidad: string) => void;
  agregarInscripcion: (inscripcion: Inscripcion) => void;
  academies: Academy[];
  inscripcionesExistentes?: Inscripcion[];
}

const InscriptionForm: React.FC<InscriptionFormProps> = ({
  event,
  user,
  modalidad,
  setModalidad,
  agregarInscripcion,
  academies,
  inscripcionesExistentes = []
}) => {
  // Obtener categorías globales
  const { categorias: categoriasPorNivel, loading: loadingCategorias } = useGlobalCategories();

  // Usar hooks personalizados para búsqueda de participantes
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

  // Estados para formulario
  const [dniParticipante, setDniParticipante] = useState<string>("");
  const [dniPareja, setDniPareja] = useState<string>("");
  const [academiaParticipante, setAcademiaParticipante] = useState<string>("");
  const [academiaPareja, setAcademiaPareja] = useState<string>("");
  
  // Estado para errores de validación
  const [participanteError, setParticipanteError] = useState<string>("");
  const [parejaError, setParejaError] = useState<string>("");

  // Estados para configuraciones
  const [eventSettings, setEventSettings] = useState<DocumentData | null>(null);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);

  // Estado para modal de error
  const [errorModal, setErrorModal] = useState<ErrorModalState>({
    isOpen: false,
    title: "",
    message: ""
  });

  // Usar el hook de validación de parejas
  const {
    allowed: pullCoupleAllowed,
    message: pullCoupleMessage,
    diferenciaValor,
    categoriaFinal,
    esMayorParticipante
  } = usePullCoupleValidation(participanteInfo, parejaInfo, eventSettings as any);

  // Determinar si la modalidad requiere pareja
  const requierePareja: boolean = 
    event.settings.levels[modalidad]?.couple || false;

  // Obtener categorías disponibles para la modalidad actual
  const categoriasDisponibles: string[] = 
    event.settings.levels[modalidad]?.categories || [];

  // Opciones de modalidades
  const modalidades: string[] = Object.keys(event.settings.levels || {});

  // Verificar si la categoría está disponible en la modalidad
  const esCategoriaDisponible = useCallback((categoria: string): boolean => {
    return categoriasDisponibles.includes(categoria);
  }, [categoriasDisponibles]);

  // Verificar compatibilidad de géneros
  const sonGenerosCompatibles = useCallback((): boolean => {
    if (!participanteInfo || !parejaInfo) return false;
    
    // Verificar que sean géneros opuestos (hombre-mujer)
    return participanteInfo.gender !== parejaInfo.gender;
  }, [participanteInfo, parejaInfo]);

  // Verificar si ya existe una inscripción para este participante en esta modalidad
  const existeInscripcionDuplicada = useCallback((): boolean => {
    if (!participanteInfo) return false;

    if (!inscripcionesExistentes || !Array.isArray(inscripcionesExistentes)) {
      return false;
    }
    
    // Verificar si el participante ya está inscrito en esta modalidad
    const participanteDuplicado = inscripcionesExistentes.some(inscripcion => 
      inscripcion.modalidad === modalidad && 
      (inscripcion.participante.id === participanteInfo.id || 
       (inscripcion.pareja && inscripcion.pareja.id === participanteInfo.id))
    );
    
    // Verificar si la pareja ya está inscrita en esta modalidad
    const parejaDuplicada = requierePareja && parejaInfo && inscripcionesExistentes.some(inscripcion => 
      inscripcion.modalidad === modalidad && 
      (inscripcion.participante.id === parejaInfo.id || 
       (inscripcion.pareja && inscripcion.pareja.id === parejaInfo.id))
    );
    
    return participanteDuplicado || (parejaInfo ? parejaDuplicada : false);
  }, [participanteInfo, parejaInfo, inscripcionesExistentes, modalidad, requierePareja]);

  // Determinar si la pareja es válida para inscripción
  const esParejaValida = useCallback((): boolean => {
    // Si no requiere pareja, es válido
    if (!requierePareja) return true;
    
    // Si requiere pareja pero no hay pareja seleccionada, no es válido
    if (!parejaInfo) return false;
    
    // Verificar compatibilidad de géneros
    if (!sonGenerosCompatibles()) return false;
    
    // Verificar que la categoría de la pareja esté disponible
    if (!esCategoriaDisponible(parejaInfo.category)) return false;
    
    // Verifica si las categorías son compatibles para jalar pareja
    if (diferenciaValor > 0) {
      // Si hay diferencia de categoría pero está permitido jalar, es válido
      if (pullCoupleAllowed) return true;
      
      // Si hay diferencia pero no está permitido jalar, no es válido
      return false;
    }
    
    // Si no hay diferencia de categorías, es válido
    return true;
  }, [
    requierePareja, 
    parejaInfo, 
    sonGenerosCompatibles, 
    esCategoriaDisponible, 
    diferenciaValor, 
    pullCoupleAllowed
  ]);

  // Estado derivado: determinar si se aplicará jalar pareja
  const aplicarJalarPareja = useCallback((): boolean => {
    return requierePareja && 
           parejaInfo !== null && 
           pullCoupleAllowed && 
           diferenciaValor > 0;
  }, [requierePareja, parejaInfo, pullCoupleAllowed, diferenciaValor]);

  // Cargar configuraciones del evento desde la colección settings
  useEffect(() => {
    const loadEventSettings = async (): Promise<void> => {
      if (!event.id) return;

      try {
        setLoadingSettings(true);
        const db = getFirestore();
        const settingsRef = doc(db, "settings", event.id);
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          setEventSettings(settingsSnap.data());
        } else {
          console.log("No se encontró configuración para este evento");
          setEventSettings(null);
        }
      } catch (error) {
        console.error("Error al cargar configuraciones:", error);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadEventSettings();
  }, [event.id]);

  // Obtener la edad para mostrar en la UI
  const getEdadDisplay = useCallback((birthDate: any): string | number => {
    if (!birthDate) return "N/A";
    
    const hoy = new Date();
    const fechaNac = birthDate.toDate();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  }, []);

  // Manejar búsqueda de participante
  const handleBuscarParticipante = useCallback(async (): Promise<void> => {
    setParticipanteError("");
    setParejaError("");
    await buscarParticipante(dniParticipante);
  }, [buscarParticipante, dniParticipante]);

  // Manejar búsqueda de pareja
  const handleBuscarPareja = useCallback(async (): Promise<void> => {
    setParejaError("");
    await buscarPareja(dniPareja, dniParticipante);
  }, [buscarPareja, dniPareja, dniParticipante]);

  // Efecto para validar categoría del participante cuando cambia el participante o la modalidad
  useEffect(() => {
    if (participanteInfo) {
      // Verificar que la categoría del participante esté disponible
      if (!esCategoriaDisponible(participanteInfo.category)) {
        setParticipanteError(
          `La categoría del participante (${participanteInfo.category}) no está disponible en esta modalidad. Categorías permitidas: ${categoriasDisponibles.join(", ")}`
        );
      } 
      // Verificar si el participante ya está inscrito en esta modalidad
      else if (existeInscripcionDuplicada()) {
        setParticipanteError(
          `El participante o la pareja ya están inscritos en la modalidad ${modalidad}`
        );
      } else {
        setParticipanteError("");
      }
    }
  }, [
    participanteInfo, 
    esCategoriaDisponible, 
    categoriasDisponibles, 
    existeInscripcionDuplicada,
    modalidad
  ]);

  // Efecto para validar pareja cuando cambia participante o pareja
  useEffect(() => {
    if (requierePareja && participanteInfo && parejaInfo) {
      if (!sonGenerosCompatibles()) {
        setParejaError("La pareja debe ser de género opuesto (hombre-mujer)");
      } 
      else if (!esCategoriaDisponible(parejaInfo.category)) {
        setParejaError(
          `La categoría de la pareja (${parejaInfo.category}) no está disponible en esta modalidad. Categorías permitidas: ${categoriasDisponibles.join(", ")}`
        );
      }
      else if (!pullCoupleAllowed && diferenciaValor > 0) {
        setParejaError(pullCoupleMessage || "Las categorías no son compatibles para inscripción");
      } 
      else {
        setParejaError("");
      }
    }
  }, [
    requierePareja, 
    participanteInfo, 
    parejaInfo, 
    sonGenerosCompatibles, 
    esCategoriaDisponible,
    categoriasDisponibles,
    pullCoupleAllowed, 
    diferenciaValor, 
    pullCoupleMessage
  ]);

  // Manejar envío del formulario
  const handleSubmit = useCallback((): void => {
    // Verificar todas las validaciones
    if (
      !participanteInfo || 
      participanteError || 
      (requierePareja && (!parejaInfo || parejaError)) || 
      !esParejaValida() ||
      existeInscripcionDuplicada()
    ) {
      return;
    }

    // Obtener precio según modalidad
    const precioBase = event.settings.levels[modalidad]?.price || 0;

    // Determinar la categoría final y si se aplica jalar pareja
    const usarJalarPareja = aplicarJalarPareja();
    const categoriaFinalUsada = usarJalarPareja ? categoriaFinal as string : participanteInfo.category as string;

    // Crear objeto de inscripción
    const nuevaInscripcion: Inscripcion = {
      modalidad,
      level: modalidad,
      category: categoriaFinalUsada,
      isPullCouple: usarJalarPareja,
      participante: {
        id: participanteInfo.id,
        nombre: `${participanteInfo.firstName} ${participanteInfo.lastName}`,
        dni: participanteInfo.dni,
        edad: getEdadDisplay(participanteInfo.birthDate),
        genero: participanteInfo.gender,
        telefono: participanteInfo.phoneNumber?.[0] || "No disponible",
        academyId: academiaParticipante || "",
        academyName: academies.find(a => a.id === academiaParticipante)?.name || "Academia no especificada",
        originalCategory: participanteInfo.category
      },
      pareja: parejaInfo ? {
        id: parejaInfo.id,
        nombre: `${parejaInfo.firstName} ${parejaInfo.lastName}`,
        dni: parejaInfo.dni,
        edad: getEdadDisplay(parejaInfo.birthDate),
        genero: parejaInfo.gender,
        telefono: parejaInfo.phoneNumber?.[0] || "No disponible",
        academyId: academiaPareja || "",
        academyName: academies.find(a => a.id === academiaPareja)?.name || "Academia no especificada",
        originalCategory: parejaInfo.category
      } : null,
      precio: precioBase
    };

    // Agregar a la lista de inscripciones
    agregarInscripcion(nuevaInscripcion);

    // Limpiar formulario
    setDniParticipante("");
    setDniPareja("");
    limpiarParticipante();
    limpiarPareja();
    setAcademiaParticipante("");
    setAcademiaPareja("");
    setParticipanteError("");
    setParejaError("");
  }, [
    participanteInfo,
    participanteError,
    parejaInfo,
    parejaError,
    requierePareja,
    modalidad,
    event.settings.levels,
    aplicarJalarPareja,
    categoriaFinal,
    getEdadDisplay,
    academiaParticipante,
    academiaPareja,
    academies,
    agregarInscripcion,
    limpiarParticipante,
    limpiarPareja,
    esParejaValida,
    existeInscripcionDuplicada
  ]);

  // Manejar cambio de modalidad
  const handleModalidadChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
    setModalidad(e.target.value);
    limpiarPareja();
    setDniPareja("");
    setParticipanteError("");
    setParejaError("");
  }, [setModalidad, limpiarPareja]);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
        Nueva inscripción
      </h3>

      {/* Modal de error */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda - Formulario */}
        <div className="space-y-4">
          {/* Selección de modalidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modalidad:
            </label>
            <select
              value={modalidad}
              onChange={handleModalidadChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
            >
              {modalidades.map(mod => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
            {categoriasDisponibles.length > 0 && (
              <div className="mt-1 text-xs text-gray-500">
                Categorías disponibles: {categoriasDisponibles.join(', ')}
              </div>
            )}
          </div>

          {/* DNI Participante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DNI Participante:
            </label>
            <div className="flex">
              <input
                type="text"
                value={dniParticipante}
                onChange={(e) => setDniParticipante(e.target.value)}
                placeholder="Ingresa DNI"
                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                maxLength={8}
              />
              <button
                onClick={handleBuscarParticipante}
                disabled={isSearchingParticipante}
                className="bg-blue-600 text-white px-3 rounded-r-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center"
              >
                {isSearchingParticipante ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
            {searchErrorParticipante && (
              <div className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {searchErrorParticipante}
              </div>
            )}
            
            {/* Mensaje de error para categoría no disponible o inscripción duplicada */}
            {participanteError && (
              <div className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-start">
                <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{participanteError}</span>
              </div>
            )}
          </div>

          {/* Academia del participante */}
          {participanteInfo && !participanteError && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academia del Participante:
              </label>
              <select
                value={academiaParticipante}
                onChange={(e) => setAcademiaParticipante(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
              >
                <option value="">Seleccionar academia</option>
                {academies.map(academia => (
                  <option key={academia.id} value={academia.id}>{academia.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* DNI Pareja (solo para modalidades que lo requieren) */}
          {requierePareja && participanteInfo && !participanteError && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI Pareja:
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={dniPareja}
                  onChange={(e) => setDniPareja(e.target.value)}
                  placeholder="Ingresa DNI de la pareja"
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  maxLength={8}
                  disabled={!participanteInfo}
                />
                <button
                  onClick={handleBuscarPareja}
                  disabled={isSearchingPareja || !participanteInfo}
                  className="bg-blue-600 text-white px-3 rounded-r-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center"
                >
                  {isSearchingPareja ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>
              {searchErrorPareja && (
                <div className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {searchErrorPareja}
                </div>
              )}
              
              {/* Mensaje de error para validación de parejas */}
              {parejaError && (
                <div className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                  <span>{parejaError}</span>
                </div>
              )}
            </div>
          )}

          {/* Academia de la pareja */}
          {requierePareja && parejaInfo && !parejaError && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academia de la Pareja:
              </label>
              <select
                value={academiaPareja}
                onChange={(e) => setAcademiaPareja(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
              >
                <option value="">Seleccionar academia</option>
                {academies.map(academia => (
                  <option key={academia.id} value={academia.id}>{academia.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Mensaje informativo de jalar pareja (si aplica) */}
          {aplicarJalarPareja() && !parejaError && (
            <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
              <div className="flex items-start">
                <div className="bg-blue-100 p-1 rounded mr-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    Se aplicará "Jalar Pareja"
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    La categoría final será: {categoriaFinal}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensajes de carga */}
          {(loadingSettings || loadingCategorias) && requierePareja && participanteInfo && parejaInfo && (
            <div className="p-3 rounded-md bg-gray-50 border border-gray-200">
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                <p className="text-sm text-gray-600">Verificando compatibilidad de pareja...</p>
              </div>
            </div>
          )}

          {/* Botón para agregar inscripción */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={
                !participanteInfo ||
                !!participanteError ||
                !academiaParticipante ||
                (requierePareja && (!parejaInfo || !!parejaError || !academiaPareja)) ||
                existeInscripcionDuplicada()
              }
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex items-center justify-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Agregar inscripción
              </span>
            </button>
          </div>
        </div>

        {/* Columna derecha - Fichas de información */}
        <div className="space-y-4">
          
          {/* Información de la modalidad seleccionada */}
          {modalidad && (
            <div className="bg-blue-50 rounded-md border border-blue-200 p-3 text-sm shadow-sm">
              <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
                Información de la modalidad
              </h4>
              <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-gray-800">
                <span className="font-medium text-gray-600">Modalidad:</span>
                <span>{modalidad}</span>
                <span className="font-medium text-gray-600">Precio:</span>
                <span>S/. {event.settings.levels[modalidad]?.price || 0}</span>
                <span className="font-medium text-gray-600">Requiere pareja:</span>
                <span>{requierePareja ? "Sí" : "No"}</span>
                <span className="font-medium text-gray-600">Categorías:</span>
                <span>{categoriasDisponibles.join(', ') || "No especificadas"}</span>
              </div>
            </div>
          )}

          {/* Ficha del participante */}
          {participanteInfo && (
            <ParticipantCard
              participant={participanteInfo}
              calcularEdad={getEdadDisplay}
              type="participante"
            />
          )}

          {/* Ficha de la pareja */}
          {requierePareja && parejaInfo && (
            <ParticipantCard
              participant={parejaInfo}
              calcularEdad={getEdadDisplay}
              type="pareja"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InscriptionForm;