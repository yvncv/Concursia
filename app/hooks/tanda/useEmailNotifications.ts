// app/hooks/useEmailNotifications.ts (VERSIÓN CORREGIDA)
import { useState } from 'react';
import { EmailService } from '@/app/services/emailService';
import { Tanda } from '@/app/types/tandaType';
import { Participant } from '@/app/types/participantType';
import { User } from '@/app/types/userType';
import { EmailNotificationData } from '@/app/types/emailTypes';

export const useEmailNotifications = () => {
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [currentEmail, setCurrentEmail] = useState(0);
  const [totalEmails, setTotalEmails] = useState(0);
  const [currentEmailAddress, setCurrentEmailAddress] = useState('');

  const sendTandaNotifications = async (
    tandas: Tanda[],
    allParticipants: Participant[],
    allUsers: User[],
    level: string,
    category: string,
    gender: string,
    competitionName?: string
  ) => {
    setIsSending(true);
    setSendingProgress(0);
    setCurrentEmail(0);
    setCurrentEmailAddress('');

    try {
      console.log('Iniciando proceso de envío de emails...');
      console.log('Tandas recibidas:', tandas?.length || 0);
      console.log('Participantes recibidos:', allParticipants?.length || 0);
      console.log('Usuarios recibidos:', allUsers?.length || 0);

      // VALIDACIONES IMPORTANTES
      if (!tandas || tandas.length === 0) {
        return {
          success: false,
          message: 'No hay tandas para procesar',
          results: { success: 0, failed: 0, errors: ['No hay tandas'], details: [] },
          notifications: 0,
          totalEmails: 0,
        };
      }

      if (!allParticipants || allParticipants.length === 0) {
        return {
          success: false,
          message: 'No hay participantes para notificar',
          results: { success: 0, failed: 0, errors: ['No hay participantes'], details: [] },
          notifications: 0,
          totalEmails: 0,
        };
      }

      if (!allUsers || allUsers.length === 0) {
        return {
          success: false,
          message: 'No hay usuarios cargados. Por favor, asegúrate de cargar los usuarios antes de enviar notificaciones.',
          results: { success: 0, failed: 0, errors: ['No hay usuarios cargados'], details: [] },
          notifications: 0,
          totalEmails: 0,
        };
      }
      
      // Configurar el servicio de email
      const emailService = new EmailService();

      // Preparar datos de notificación
      const notifications: EmailNotificationData[] = [];

      tandas.forEach((tanda, tandaIndex) => {
        console.log(`Procesando tanda ${tandaIndex + 1}...`);
        
        if (!tanda.blocks || tanda.blocks.length === 0) {
          console.warn(`Tanda ${tandaIndex + 1} no tiene bloques`);
          return;
        }

        tanda.blocks.forEach((block, blockIndex) => {
          if (!block.participants || block.participants.length === 0) {
            console.warn(`Bloque ${blockIndex + 1} de tanda ${tandaIndex + 1} no tiene participantes`);
            return;
          }

          block.participants.forEach((tandaParticipant, trackIndex) => {
            if (!tandaParticipant.participantId) {
              console.warn(`Participante en posición ${trackIndex + 1} no tiene ID`);
              return;
            }

            const participant = allParticipants.find(p => p.id === tandaParticipant.participantId);
            
            if (!participant) {
              console.warn(`No se encontró participante con ID: ${tandaParticipant.participantId}`);
              return;
            }

            console.log(`Procesando participante ${participant.code}...`);
            
            // Validar que el participante tenga userIds
            if (!participant.usersId || participant.usersId.length === 0) {
              console.warn(`Participante ${participant.code} no tiene usuarios asociados`);
              return;
            }

            // Obtener usuarios asociados al participante
            const participantUsers = allUsers.filter(user => 
              participant.usersId.includes(user.id)
            );

            if (participantUsers.length === 0) {
              console.warn(`No se encontraron usuarios para participante ${participant.code} con IDs: ${participant.usersId.join(', ')}`);
              return;
            }

            console.log(`Encontrados ${participantUsers.length} usuarios para participante ${participant.code}`);

            // Recopilar todos los emails de todos los usuarios del participante
            const allEmails: string[] = [];
            participantUsers.forEach(user => {
              if (user.email && Array.isArray(user.email)) {
                // Filtrar emails válidos
                const validEmails = user.email.filter(email => 
                  email && 
                  typeof email === 'string' && 
                  email.includes('@') && 
                  email.includes('.') &&
                  email.length > 5
                );
                allEmails.push(...validEmails);
                console.log(`Usuario ${user.firstName} ${user.lastName} tiene emails:`, validEmails);
              } else {
                console.warn(`Usuario ${user.firstName} ${user.lastName} no tiene emails válidos`);
              }
            });

            // Crear nombre completo del participante
            const fullName = participantUsers.length === 1 
              ? `${participantUsers[0].firstName} ${participantUsers[0].lastName}`
              : participantUsers.map(user => `${user.firstName} ${user.lastName}`).join(' & ');

            if (allEmails.length > 0) {
              const uniqueEmails = [...new Set(allEmails)]; // Eliminar duplicados
              console.log(`Participante ${participant.code} (${fullName}) tiene ${uniqueEmails.length} emails únicos`);
              
              notifications.push({
                participantId: participant.id,
                emails: uniqueEmails,
                fullName,
                tandaNumber: tandaIndex + 1,
                trackNumber: trackIndex + 1,
                blockNumber: tanda.blocks.length > 1 ? blockIndex + 1 : undefined,
                category,
                level,
                gender,
                participantCode: participant.code,
                competitionName,
                estimatedTime: calculateEstimatedTime(tandaIndex),
              });
            } else {
              console.warn(`Participante ${participant.code} (${fullName}) no tiene emails válidos`);
            }
          });
        });
      });

      console.log(`Preparados ${notifications.length} participantes para notificar`);

      // Calcular total de emails
      const emailCount = notifications.reduce((total, notification) => 
        total + notification.emails.length, 0
      );
      setTotalEmails(emailCount);

      console.log(`Total de emails a enviar: ${emailCount}`);

      if (emailCount === 0) {
        return {
          success: false,
          message: 'No se encontraron emails válidos para enviar notificaciones. Verifica que los participantes tengan usuarios con emails asociados.',
          results: { success: 0, failed: 0, errors: ['No hay emails válidos'], details: [] },
          notifications: notifications.length,
          totalEmails: 0,
        };
      }

      // Enviar notificaciones con callback de progreso
      const results = await emailService.sendTandaNotifications(
        notifications,
        (current, total, email) => {
          setCurrentEmail(current);
          setCurrentEmailAddress(email || '');
          setSendingProgress(Math.round((current / total) * 100));
        }
      );
      
      console.log('Resultados del envío:', results);

      return {
        success: true,
        message: `Emails procesados: ${results.success} exitosos, ${results.failed} fallidos`,
        results,
        notifications: notifications.length,
        totalEmails: emailCount,
      };

    } catch (error) {
      console.error('Error sending notifications:', error);
      return {
        success: false,
        message: 'Error enviando notificaciones: ' + (error instanceof Error ? error.message : 'Error desconocido'),
        error,
      };
    } finally {
      setIsSending(false);
      setSendingProgress(0);
      setCurrentEmailAddress('');
    }
  };

  return {
    sendTandaNotifications,
    isSending,
    sendingProgress,
    currentEmail,
    totalEmails,
    currentEmailAddress,
  };
};

// Función helper para calcular tiempo estimado
function calculateEstimatedTime(tandaIndex: number): string {
  const baseTime = new Date();
  const minutesPerTanda = 15; // Estimación de 15 minutos por tanda
  
  baseTime.setMinutes(baseTime.getMinutes() + (tandaIndex * minutesPerTanda));
  
  return baseTime.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}