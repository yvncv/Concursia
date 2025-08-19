import { useState } from 'react';
import { doc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase/config';

interface AssignOrganizerResult {
  success: boolean;
  message: string;
  userFound?: boolean;
  userUpdated?: boolean;
  academyUpdated?: boolean;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string | string[];
  roleId: string;
  marinera?: {
    academyId?: string;
    academyName?: string;
  };
}

interface AcademyData {
  id: string;
  name: string;
  organizerId: string;
}

const useAssignOrganizer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignOrganizerToAcademy = async (
    userId: string, 
    academyId: string, 
    academyName: string
  ): Promise<AssignOrganizerResult> => {
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!userId.trim()) {
        throw new Error('El ID del usuario es requerido');
      }
      if (!academyId.trim()) {
        throw new Error('El ID de la academia es requerido');
      }

      // Ejecutar transacción para garantizar consistencia
      const result = await runTransaction(db, async (transaction) => {
        // 1. Verificar que el usuario existe
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error(`No se encontró un usuario con ID: ${userId}`);
        }

        const userData = userDoc.data() as UserData;

        // 2. Verificar que la academia existe
        const academyRef = doc(db, 'academies', academyId);
        const academyDoc = await transaction.get(academyRef);
        
        if (!academyDoc.exists()) {
          throw new Error(`No se encontró la academia con ID: ${academyId}`);
        }

        const academyData = academyDoc.data() as AcademyData;

        // 3. Verificar si el usuario ya es organizador de otra academia
        if (userData.roleId === 'organizer' && 
            userData.marinera?.academyId && 
            userData.marinera.academyId !== academyId &&
            userData.marinera.academyId !== 'SIN_ASIGNAR') {
          throw new Error(
            `El usuario ${userData.firstName} ${userData.lastName} ya es organizador de otra academia: ${userData.marinera.academyName || userData.marinera.academyId}`
          );
        }

        // 4. Verificar si la academia ya tiene un organizador diferente
        if (academyData.organizerId && 
            academyData.organizerId !== 'SIN_ASIGNAR' && 
            academyData.organizerId !== userId) {
          throw new Error(
            `La academia "${academyData.name}" ya tiene asignado el organizador: ${academyData.organizerId}`
          );
        }

        // 5. Actualizar el usuario
        const updatedUserData = {
          roleId: 'organizer',
          marinera: {
            ...userData.marinera,
            academyId: academyId,
            academyName: academyName
          },
          updatedAt: new Date()
        };

        transaction.update(userRef, updatedUserData);

        // 6. Actualizar la academia
        transaction.update(academyRef, {
          organizerId: userId,
          updatedAt: new Date()
        });

        return {
          success: true,
          message: `Usuario ${userData.firstName} ${userData.lastName} asignado exitosamente como organizador de "${academyName}"`,
          userFound: true,
          userUpdated: true,
          academyUpdated: true,
          userData: userData
        };
      });

      setLoading(false);
      return result;

    } catch (error: any) {
      setLoading(false);
      const errorMessage = error.message || 'Error desconocido al asignar organizador';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        userFound: !errorMessage.includes('No se encontró un usuario'),
        userUpdated: false,
        academyUpdated: false
      };
    }
  };

  const unassignOrganizerFromAcademy = async (
    academyId: string
  ): Promise<AssignOrganizerResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await runTransaction(db, async (transaction) => {
        // 1. Obtener la academia
        const academyRef = doc(db, 'academies', academyId);
        const academyDoc = await transaction.get(academyRef);
        
        if (!academyDoc.exists()) {
          throw new Error(`No se encontró la academia con ID: ${academyId}`);
        }

        const academyData = academyDoc.data() as AcademyData;
        
        if (!academyData.organizerId || academyData.organizerId === 'SIN_ASIGNAR') {
          throw new Error('La academia no tiene un organizador asignado');
        }

        // 2. Obtener el usuario organizador
        const userRef = doc(db, 'users', academyData.organizerId);
        const userDoc = await transaction.get(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          
          // 3. Actualizar el usuario (remover asignación de academia)
          transaction.update(userRef, {
            marinera: {
              ...userData.marinera,
              academyId: 'SIN_ASIGNAR',
              academyName: null
            },
            updatedAt: new Date()
          });
        }

        // 4. Actualizar la academia
        transaction.update(academyRef, {
          organizerId: 'SIN_ASIGNAR',
          updatedAt: new Date()
        });

        return {
          success: true,
          message: `Organizador desasignado exitosamente de la academia "${academyData.name}"`,
          userFound: userDoc.exists(),
          userUpdated: userDoc.exists(),
          academyUpdated: true
        };
      });

      setLoading(false);
      return result;

    } catch (error: any) {
      setLoading(false);
      const errorMessage = error.message || 'Error desconocido al desasignar organizador';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        userFound: false,
        userUpdated: false,
        academyUpdated: false
      };
    }
  };

  const validateUserId = async (userId: string): Promise<{
    exists: boolean;
    userData?: UserData;
    canBeOrganizer: boolean;
    message: string;
  }> => {
    try {
      if (!userId.trim()) {
        return {
          exists: false,
          canBeOrganizer: false,
          message: 'ID de usuario requerido'
        };
      }

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return {
          exists: false,
          canBeOrganizer: false,
          message: `No se encontró usuario con ID: ${userId}`
        };
      }

      const userData = userDoc.data() as UserData;
      
      // Verificar si ya es organizador de otra academia
      const isOrganizerElsewhere = userData.roleId === 'organizer' && 
                                  userData.marinera?.academyId && 
                                  userData.marinera.academyId !== 'SIN_ASIGNAR';

      return {
        exists: true,
        userData,
        canBeOrganizer: !isOrganizerElsewhere,
        message: isOrganizerElsewhere 
          ? `${userData.firstName} ${userData.lastName} ya es organizador de: ${userData.marinera?.academyName || userData.marinera?.academyId}`
          : `${userData.firstName} ${userData.lastName} puede ser asignado como organizador`
      };

    } catch (error: any) {
      return {
        exists: false,
        canBeOrganizer: false,
        message: `Error al validar usuario: ${error.message}`
      };
    }
  };

  const clearError = () => setError(null);

  return {
    assignOrganizerToAcademy,
    unassignOrganizerFromAcademy,
    validateUserId,
    loading,
    error,
    clearError
  };
};

export default useAssignOrganizer;