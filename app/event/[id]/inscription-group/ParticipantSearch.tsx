import { useState, useCallback, useEffect } from "react";
import { getFirestore, doc, getDoc, DocumentData } from "firebase/firestore";
import { Search, AlertCircle, Users, CheckCircle } from "lucide-react";
import toast from 'react-hot-toast';
import { User } from "@/app/types/userType";
import { useGlobalCategories } from "@/app/hooks/useGlobalCategories";
import { useParticipantSearch, Participante } from "@/app/hooks/useParticipantSearch";
import { usePullCoupleValidation } from "@/app/hooks/usePullCoupleValidation";
import { useAcademyAffiliationValidation } from "@/app/hooks/tickets/useAcademyAffiliationValidation";

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

interface ParticipantSearchProps {
  eventId: string;
  modalidad: string;
  requierePareja: boolean;
  categoriasDisponibles: string[];
  user: User;
  academies: Academy[];
  inscripcionesExistentes: Inscripcion[];
  loadingAcademies: boolean;
  onParticipantFound: (participante: Participante, academia: string) => void;
  onCoupleFound: (pareja: Participante, academia: string) => void;
  onValidationChange: (isValid: boolean) => void;
  onPullCoupleChange: (data: { aplicar: boolean; categoriaFinal: string }) => void;
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
  onPullCoupleChange
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
  const [academiaParticipante, setAcademiaParticipante] = useState<string>("");
  const [academiaPareja, setAcademiaPareja] = useState<string>("");
  const [eventSettings, setEventSettings] = useState<DocumentData | null>(null);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);

  // Hooks de validación
  const academyValidation = useAcademyAffiliationValidation(
    participanteInfo ? {
      id: participanteInfo.id,
      academyId: academiaParticipante,
      academyName: academies.find(a => a.id === academiaParticipante)?.name || ""
    } : null,
    parejaInfo ? {
      id: parejaInfo.id,
      academyId: academiaPareja,
      academyName: academies.find(a => a.id === academiaPareja)?.name || ""
    } : null,
    user
  );

  const {
    allowed: pullCoupleAllowed,
    message: pullCoupleMessage,
    diferenciaValor,
    categoriaFinal
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
        toast.error("Error al cargar configuraciones del evento");
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
    const fechaNac = birthDate.toDate();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  }, []);

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

  // Validar categoría del participante
  const validarCategoriaParticipante = useCallback((): string | null => {
    if (!participanteInfo) return null;
    
    if (!esCategoriaDisponible(participanteInfo.category)) {
      return `La categoría del participante (${participanteInfo.category}) no está disponible en esta modalidad`;
    }
    
    if (existeInscripcionDuplicada()) {
      return `El participante ya está inscrito en la modalidad ${modalidad}`;
    }

    return null;
  }, [participanteInfo, esCategoriaDisponible, existeInscripcionDuplicada, modalidad]);

  // Validar pareja
  const validarPareja = useCallback((): string | null => {
    if (!requierePareja || !participanteInfo || !parejaInfo) return null;

    if (!sonGenerosCompatibles()) {
      return "La pareja debe ser de género opuesto (hombre-mujer)";
    }
    
    if (!esCategoriaDisponible(parejaInfo.category)) {
      return `La categoría de la pareja (${parejaInfo.category}) no está disponible en esta modalidad`;
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
    pullCoupleMessage
  ]);

  // Determinar si el formulario es válido
  const esFormularioValido = useCallback((): boolean => {
    if (!participanteInfo || !academiaParticipante) return false;
    if (validarCategoriaParticipante()) return false;
    if (!academyValidation.isValid) return false;
    
    if (requierePareja) {
      if (!parejaInfo || !academiaPareja) return false;
      if (validarPareja()) return false;
    }
    
    return true;
  }, [
    participanteInfo,
    academiaParticipante,
    validarCategoriaParticipante,
    academyValidation.isValid,
    requierePareja,
    parejaInfo,
    academiaPareja,
    validarPareja
  ]);

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
        categoriaFinal: participanteInfo?.category || ""
      });
    }
  }, [pullCoupleAllowed, diferenciaValor, categoriaFinal, participanteInfo, onPullCoupleChange]);

  // Notificar cambios de validación al componente padre
  useEffect(() => {
    onValidationChange(esFormularioValido());
  }, [esFormularioValido, onValidationChange]);

  // Notificar datos al componente padre cuando están listos
  useEffect(() => {
    if (participanteInfo && academiaParticipante && !validarCategoriaParticipante()) {
      onParticipantFound(participanteInfo, academiaParticipante);
    }
  }, [participanteInfo, academiaParticipante, validarCategoriaParticipante, onParticipantFound]);

  useEffect(() => {
    if (parejaInfo && academiaPareja && !validarPareja()) {
      onCoupleFound(parejaInfo, academiaPareja);
    }
  }, [parejaInfo, academiaPareja, validarPareja, onCoupleFound]);

  // Manejar búsqueda de participante
  const handleBuscarParticipante = useCallback(async (): Promise<void> => {
    if (!dniParticipante.trim()) {
      toast.error("Ingresa un DNI válido");
      return;
    }

    try {
      await buscarParticipante(dniParticipante);
      if (!searchErrorParticipante) {
        toast.success("Participante encontrado");
      }
    } catch (error) {
      toast.error("Error al buscar participante");
    }
  }, [buscarParticipante, dniParticipante, searchErrorParticipante]);

  // Manejar búsqueda de pareja
  const handleBuscarPareja = useCallback(async (): Promise<void> => {
    if (!dniPareja.trim()) {
      toast.error("Ingresa un DNI válido para la pareja");
      return;
    }

    if (dniPareja === dniParticipante) {
      toast.error("El DNI de la pareja no puede ser igual al del participante");
      return;
    }

    try {
      await buscarPareja(dniPareja, dniParticipante);
      if (!searchErrorPareja) {
        toast.success("Pareja encontrada");
      }
    } catch (error) {
      toast.error("Error al buscar pareja");
    }
  }, [buscarPareja, dniPareja, dniParticipante, searchErrorPareja]);

  // Limpiar formulario
  const limpiarFormulario = useCallback(() => {
    setDniParticipante("");
    setDniPareja("");
    limpiarParticipante();
    limpiarPareja();
    setAcademiaParticipante("");
    setAcademiaPareja("");
  }, [limpiarParticipante, limpiarPareja]);

  // Exponer función de limpieza
  useEffect(() => {
    // Podríamos usar useImperativeHandle si necesitamos exponer funciones al padre
  }, []);

  // Estado derivado: determinar si se aplicará jalar pareja
  const aplicarJalarPareja = useCallback((): boolean => {
    return requierePareja && 
           parejaInfo !== null && 
           pullCoupleAllowed && 
           diferenciaValor > 0;
  }, [requierePareja, parejaInfo, pullCoupleAllowed, diferenciaValor]);

  return (
    <div className="space-y-6">
      {/* Búsqueda de participante */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          🔍 Buscar participante por DNI:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={dniParticipante}
            onChange={(e) => setDniParticipante(e.target.value)}
            placeholder="Ingresa 8 dígitos del DNI"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            maxLength={8}
          />
          <button
            onClick={handleBuscarParticipante}
            disabled={isSearchingParticipante}
            className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center min-w-[50px]"
          >
            {isSearchingParticipante ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {searchErrorParticipante && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {searchErrorParticipante}
          </div>
        )}

        {validarCategoriaParticipante() && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {validarCategoriaParticipante()}
          </div>
        )}
      </div>

      {/* Selección de academia del participante */}
      {participanteInfo && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏫 Academia del participante:
          </label>
          <select
            value={academiaParticipante}
            onChange={(e) => setAcademiaParticipante(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
            disabled={loadingAcademies}
          >
            <option value="">Seleccionar academia</option>
            {academies.map(academia => (
              <option key={academia.id} value={academia.id}>{academia.name}</option>
            ))}
          </select>
          {loadingAcademies && (
            <p className="text-xs text-gray-500 mt-1">Cargando academias...</p>
          )}
        </div>
      )}

      {/* Búsqueda de pareja (solo para modalidades que lo requieren) */}
      {requierePareja && participanteInfo && !validarCategoriaParticipante() && (
        <div className="space-y-3 border-t pt-4">
          <label className="block text-sm font-medium text-gray-700">
            🤝 Buscar pareja por DNI:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={dniPareja}
              onChange={(e) => setDniPareja(e.target.value)}
              placeholder="Ingresa 8 dígitos del DNI"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              maxLength={8}
            />
            <button
              onClick={handleBuscarPareja}
              disabled={isSearchingPareja}
              className="bg-purple-600 text-white px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 flex items-center justify-center min-w-[50px]"
            >
              {isSearchingPareja ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {searchErrorPareja && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {searchErrorPareja}
            </div>
          )}

          {validarPareja() && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {validarPareja()}
            </div>
          )}
        </div>
      )}

      {/* Selección de academia de la pareja */}
      {requierePareja && parejaInfo && !validarPareja() && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏫 Academia de la pareja:
          </label>
          <select
            value={academiaPareja}
            onChange={(e) => setAcademiaPareja(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white"
            disabled={loadingAcademies}
          >
            <option value="">Seleccionar academia</option>
            {academies.map(academia => (
              <option key={academia.id} value={academia.id}>{academia.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Validación de academia */}
      {(participanteInfo && academiaParticipante) && (
        <div className={`p-3 rounded-lg border ${
          academyValidation.isValid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              academyValidation.isValid ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <p className={`text-sm ${
              academyValidation.isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              {academyValidation.message}
            </p>
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

      {/* Preview de participantes encontrados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {participanteInfo && (
          <ParticipantCard
            participant={participanteInfo}
            calcularEdad={getEdadDisplay}
            type="participante"
            academyName={academies.find(a => a.id === academiaParticipante)?.name}
          />
        )}

        {requierePareja && parejaInfo && (
          <ParticipantCard
            participant={parejaInfo}
            calcularEdad={getEdadDisplay}
            type="pareja"
            academyName={academies.find(a => a.id === academiaPareja)?.name}
          />
        )}
      </div>

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

// Componente auxiliar para mostrar información de participantes
interface ParticipantCardProps {
  participant: Participante;
  calcularEdad: (birthDate: any) => string | number;
  type: "participante" | "pareja";
  academyName?: string;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ 
  participant, 
  calcularEdad, 
  type, 
  academyName 
}) => {
  if (!participant) return null;

  const isParticipante = type === "participante";
  const cardTitle = isParticipante ? "👤 Participante" : "👥 Pareja";

  const bgColor = isParticipante ? "bg-blue-50" : "bg-purple-50";
  const borderColor = isParticipante ? "border-blue-200" : "border-purple-200";
  const titleColor = isParticipante ? "text-blue-700" : "text-purple-700";

  return (
    <div className={`rounded-lg ${bgColor} border ${borderColor} p-4 shadow-sm transition-all duration-200 hover:shadow-md`}>
      <h4 className={`font-semibold ${titleColor} mb-3 flex items-center justify-between`}>
        {cardTitle}
        <div className={`w-3 h-3 rounded-full ${isParticipante ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
      </h4>

      <div className="space-y-3 text-sm">
        <div className="bg-white rounded-lg p-3 border">
          <span className="font-medium text-gray-700 block">Nombre completo:</span>
          <p className="text-gray-900 font-medium">{participant.firstName} {participant.lastName}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-2 border">
            <span className="font-medium text-gray-700 text-xs block">Categoría:</span>
            <p className="text-gray-900 font-medium">{participant.category}</p>
          </div>
          
          <div className="bg-white rounded-lg p-2 border">
            <span className="font-medium text-gray-700 text-xs block">Edad:</span>
            <p className="text-gray-900 font-medium">{calcularEdad(participant.birthDate)} años</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-2 border">
          <span className="font-medium text-gray-700 text-xs block">Género:</span>
          <p className="text-gray-900">
            {participant.gender === 'Masculino' ? '👨 Masculino' : '👩 Femenino'}
          </p>
        </div>

        {academyName && (
          <div className="bg-white rounded-lg p-2 border">
            <span className="font-medium text-gray-700 text-xs block">Academia:</span>
            <p className="text-gray-900 font-medium">{academyName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantSearch;