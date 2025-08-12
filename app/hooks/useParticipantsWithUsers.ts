// app/hooks/useParticipantsWithUsers.ts
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Participant } from '@/app/types/participantType';
import { User } from '@/app/types/userType';

export interface ParticipantWithUsers {
  participant: Participant;
  users: User[];
  isLoading: boolean;
  error?: string;
}

/**
 * Hook para obtener datos completos de usuarios para un array de participantes
 * @param participants Array de participantes
 * @returns Array de participantes con sus datos de usuarios
 */
export const useParticipantsWithUsers = (participants: Participant[]): ParticipantWithUsers[] => {
  const [participantsWithUsers, setParticipantsWithUsers] = useState<ParticipantWithUsers[]>([]);

  useEffect(() => {
    const fetchUsersData = async () => {
      if (!participants.length) {
        setParticipantsWithUsers([]);
        return;
      }

      // Inicializar estado de loading
      const initialData: ParticipantWithUsers[] = participants.map(participant => ({
        participant,
        users: [],
        isLoading: true
      }));
      setParticipantsWithUsers(initialData);

      // Obtener datos de usuarios para cada participante
      const updatedData = await Promise.all(
        participants.map(async (participant) => {
          try {
            const usersData: User[] = [];
            
            // Obtener datos de cada usuario del participante
            for (const userId of participant.usersId) {
              const userRef = doc(db, 'users', userId);
              const userSnapshot = await getDoc(userRef);
              
              if (userSnapshot.exists()) {
                usersData.push({ id: userSnapshot.id, ...userSnapshot.data() } as User);
              }
            }

            return {
              participant,
              users: usersData,
              isLoading: false
            };
          } catch (error) {
            console.error(`Error fetching users for participant ${participant.id}:`, error);
            return {
              participant,
              users: [],
              isLoading: false,
              error: `Error loading user data: ${error}`
            };
          }
        })
      );

      setParticipantsWithUsers(updatedData);
    };

    fetchUsersData();
  }, [JSON.stringify(participants.map(p => p.id))]); // ← DEPENDENCIA CORREGIDA

  return participantsWithUsers;
};

/**
 * Función helper para obtener el nombre completo de un participante
 * @param participantWithUsers Participante con datos de usuarios
 * @returns Nombre completo formateado
 */
export const getParticipantDisplayName = (participantWithUsers: ParticipantWithUsers): string => {
  if (participantWithUsers.users.length === 0) {
    return 'Usuario no encontrado';
  }
  
  if (participantWithUsers.users.length === 1) {
    // Participante individual
    const user = participantWithUsers.users[0];
    return `${user.firstName} ${user.lastName}`;
  } else {
    // Pareja
    return participantWithUsers.users
      .map(user => `${user.firstName} ${user.lastName}`)
      .join(' & ');
  }
};

/**
 * Función helper para obtener las imágenes de perfil
 * @param participantWithUsers Participante con datos de usuarios
 * @returns Array de URLs de imágenes de perfil
 */
export const getParticipantImages = (participantWithUsers: ParticipantWithUsers): (string | undefined)[] => {
  return participantWithUsers.users.map(user => user.profileImage as string | undefined);
};