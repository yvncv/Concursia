import { useMemo } from 'react';
import { User } from '@/app/types/userType';

// Tipos para participantes
interface Participante {
  id: string;
  academyId: string;
  academyName: string;
  [key: string]: any;
}

interface AcademyAffiliationResult {
  isValid: boolean;
  message: string;
  userAcademyName: string | null;
  participanteAffiliation: {
    isFromUserAcademy: boolean;
    academyName: string;
  } | null;
  parejaAffiliation: {
    isFromUserAcademy: boolean;
    academyName: string;
  } | null;
}

/**
 * Hook para validar la afiliación de academia en inscripciones grupales
 * Regla: Al menos uno de los participantes debe ser de la academia del usuario que inscribe
 */
export const useAcademyAffiliationValidation = (
  participante: Participante | null,
  pareja: Participante | null,
  user: User
): AcademyAffiliationResult => {
  
  const validation = useMemo(() => {
    const userAcademyId = user.marinera?.academyId;
    const userAcademyName = user.marinera?.academyName || null;

    // Información básica de retorno
    const baseResult = {
      userAcademyName,
      participanteAffiliation: null,
      parejaAffiliation: null,
    };

    // Si el usuario no tiene academia asignada
    if (!userAcademyId) {
      return {
        ...baseResult,
        isValid: false,
        message: "❌ Tu usuario no tiene una academia asignada",
      };
    }

    // Si no hay participante seleccionado
    if (!participante) {
      return {
        ...baseResult,
        isValid: false,
        message: "Selecciona un participante",
      };
    }

    // Verificar afiliación del participante
    const participanteEsDeAcademia = participante.academyId === userAcademyId;
    const participanteAffiliation = {
      isFromUserAcademy: participanteEsDeAcademia,
      academyName: participante.academyName || "Academia no especificada",
    };

    // Si no hay pareja (modalidad individual)
    if (!pareja) {
      return {
        ...baseResult,
        participanteAffiliation,
        isValid: participanteEsDeAcademia,
        message: participanteEsDeAcademia 
          ? `✅ ${participante.academyName || 'Participante'} es de tu academia`
          : `❌ El participante debe ser de tu academia (${userAcademyName})`,
      };
    }

    // Verificar afiliación de la pareja (modalidad parejas)
    const parejaEsDeAcademia = pareja.academyId === userAcademyId;
    const parejaAffiliation = {
      isFromUserAcademy: parejaEsDeAcademia,
      academyName: pareja.academyName || "Academia no especificada",
    };

    // Al menos uno debe ser de la academia del usuario
    const alMenosUnoEsDeAcademia = participanteEsDeAcademia || parejaEsDeAcademia;

    // Determinar mensaje apropiado
    let message: string;
    if (alMenosUnoEsDeAcademia) {
      if (participanteEsDeAcademia && parejaEsDeAcademia) {
        message = `✅ Ambos participantes son de tu academia (${userAcademyName})`;
      } else if (participanteEsDeAcademia) {
        message = `✅ El participante es de tu academia (${userAcademyName})`;
      } else {
        message = `✅ La pareja es de tu academia (${userAcademyName})`;
      }
    } else {
      message = `❌ Al menos un participante debe ser de tu academia (${userAcademyName})`;
    }

    return {
      ...baseResult,
      participanteAffiliation,
      parejaAffiliation,
      isValid: alMenosUnoEsDeAcademia,
      message,
    };

  }, [participante, pareja, user.marinera?.academyId, user.marinera?.academyName]);

  return validation;
};

/**
 * Hook auxiliar para validar una lista completa de inscripciones
 * Útil para validar antes de confirmar el ticket grupal
 */
export const useGroupInscriptionsValidation = (
  inscripciones: Array<{
    participante: Participante;
    pareja: Participante | null;
  }>,
  user: User
) => {
  const validation = useMemo(() => {
    const userAcademyId = user.marinera?.academyId;
    const userAcademyName = user.marinera?.academyName;

    if (!userAcademyId) {
      return {
        isValid: false,
        message: "Tu usuario no tiene una academia asignada",
        invalidInscriptions: [],
      };
    }

    if (!inscripciones.length) {
      return {
        isValid: false,
        message: "No hay inscripciones para validar",
        invalidInscriptions: [],
      };
    }

    const invalidInscriptions: number[] = [];

    // Validar cada inscripción
    inscripciones.forEach((inscripcion, index) => {
      const participanteEsDeAcademia = inscripcion.participante.academyId === userAcademyId;
      const parejaEsDeAcademia = inscripcion.pareja?.academyId === userAcademyId;
      const alMenosUnoEsDeAcademia = participanteEsDeAcademia || parejaEsDeAcademia;

      if (!alMenosUnoEsDeAcademia) {
        invalidInscriptions.push(index + 1); // +1 para mostrar número humano
      }
    });

    const isValid = invalidInscriptions.length === 0;
    let message: string;

    if (isValid) {
      message = `✅ Todas las inscripciones son válidas para ${userAcademyName}`;
    } else if (invalidInscriptions.length === 1) {
      message = `❌ La inscripción ${invalidInscriptions[0]} no tiene participantes de tu academia`;
    } else {
      message = `❌ Las inscripciones ${invalidInscriptions.join(', ')} no tienen participantes de tu academia`;
    }

    return {
      isValid,
      message,
      invalidInscriptions,
      userAcademyName,
      totalInscriptions: inscripciones.length,
      validInscriptions: inscripciones.length - invalidInscriptions.length,
    };

  }, [inscripciones, user.marinera?.academyId, user.marinera?.academyName]);

  return validation;
};

export default useAcademyAffiliationValidation;