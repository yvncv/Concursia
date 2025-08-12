// app/services/emailService.ts (VERSIÓN FINAL)
import { EmailNotificationData, EmailTemplate, EmailSendResult } from '@/app/types/emailTypes';

export class EmailService {
  private fromName: string;

  constructor() {
    // En el frontend no necesitamos acceso a las variables del servidor
    this.fromName = 'Competencia de Marinera';
  }

  // Crear plantilla de email para participantes
  private createParticipantEmailTemplate(data: EmailNotificationData): EmailTemplate {
    const subject = `🎉 ¡Tu categoría ${data.category} ha comenzado! - Tanda N° ${data.tandaNumber}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificación de Tanda</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f3f4f6;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          .header p {
            margin: 8px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .content { 
            padding: 30px 20px; 
          }
          .participant-code { 
            background: #f9fafb; 
            border: 3px solid #e5e7eb; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px; 
            margin: 20px 0; 
          }
          .participant-code .label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
          }
          .participant-code .code {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            font-family: 'Courier New', monospace;
          }
          .tanda-info { 
            background: #fed7aa; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
          }
          .tanda-info h3 {
            margin: 0 0 15px 0;
            color: #9a3412;
            font-size: 18px;
          }
          .tanda-info p {
            margin: 8px 0;
            font-size: 16px;
          }
          .track-info { 
            background: #dc2626; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px; 
            margin: 20px 0; 
          }
          .track-info h3 {
            margin: 0 0 8px 0;
            font-size: 24px;
            font-weight: bold;
          }
          .track-info p {
            margin: 0;
            font-size: 16px;
          }
          .important { 
            background: #fef3c7; 
            border-left: 4px solid #f59e0b; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 0 8px 8px 0;
          }
          .important h3 {
            margin: 0 0 15px 0;
            color: #92400e;
            font-size: 18px;
          }
          .important ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .important li {
            margin: 8px 0;
            font-size: 15px;
          }
          .time-info {
            background: #e0f2fe;
            border: 1px solid #0891b2;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .time-info h3 {
            margin: 0 0 10px 0;
            color: #0c4a6e;
            font-size: 18px;
          }
          .success-message {
            text-align: center;
            background: #f0fdf4;
            color: #166534;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 18px;
            font-weight: 600;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280; 
            font-size: 14px; 
          }
          .footer p {
            margin: 5px 0;
          }
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 8px;
            }
            .header, .content {
              padding: 20px 15px;
            }
            .participant-code .code {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Tu categoría ha comenzado!</h1>
            <p>${data.competitionName || 'Competencia de Marinera'}</p>
          </div>
          
          <div class="content">
            <h2 style="margin: 0 0 20px 0; color: #1f2937;">Hola ${data.fullName},</h2>
            
            <p style="font-size: 16px; color: #374151;">
              Te informamos que la categoría <strong>${data.category}</strong> ya ha iniciado 
              y debes estar atento/a para tu participación.
            </p>
            
            <div class="participant-code">
              <div class="label">Tu código de participante:</div>
              <div class="code">#${data.participantCode}</div>
            </div>
            
            <div class="tanda-info">
              <h3>📋 Información de tu Tanda</h3>
              <p><strong>Tanda N°:</strong> ${data.tandaNumber}</p>
              <p><strong>Nivel:</strong> ${data.level}</p>
              <p><strong>Categoría:</strong> ${data.category}</p>
              <p><strong>Género:</strong> ${data.gender}</p>
              ${data.blockNumber ? `<p><strong>Bloque:</strong> ${data.blockNumber}</p>` : ''}
            </div>
            
            <div class="track-info">
              <h3>🎯 PISTA ${data.trackNumber}</h3>
              <p>Esta es tu pista asignada</p>
            </div>
            
            ${data.estimatedTime ? `
              <div class="time-info">
                <h3>⏰ Tiempo Estimado</h3>
                <p>Tu tanda está programada aproximadamente para: <strong>${data.estimatedTime}</strong></p>
                <p style="font-size: 14px; margin-top: 10px; font-style: italic;">
                  * Los horarios pueden variar según el desarrollo del evento
                </p>
              </div>
            ` : ''}
            
            <div class="important">
              <h3>📢 Instrucciones Importantes</h3>
              <ul>
                <li><strong>Mantente cerca del área de competencia</strong></li>
                <li><strong>Escucha los anuncios del locutor</strong></li>
                <li>Prepárate con anticipación</li>
                <li>Verifica tu número de participante: <strong>#${data.participantCode}</strong></li>
                <li>Dirígete a la <strong>PISTA ${data.trackNumber}</strong> cuando sea tu turno</li>
                <li>Ten tu documentación lista si es requerida</li>
              </ul>
            </div>
            
            <div class="success-message">
              🎭 ¡Te deseamos mucha suerte en tu presentación! ✨
            </div>
            
            <div class="footer">
              <p>Este es un mensaje automático del sistema de competencias</p>
              <p>Si tienes alguna duda, acércate a los organizadores</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
¡Tu categoría ${data.category} ha comenzado!

Hola ${data.fullName},

Te informamos que la categoría ${data.category} ya ha iniciado y debes estar atento/a para tu participación.

TU CÓDIGO DE PARTICIPANTE: #${data.participantCode}

INFORMACIÓN DE TU TANDA:
- Tanda N°: ${data.tandaNumber}
- Nivel: ${data.level}
- Categoría: ${data.category}
- Género: ${data.gender}
- Pista: ${data.trackNumber}
${data.blockNumber ? `- Bloque: ${data.blockNumber}` : ''}
${data.estimatedTime ? `- Tiempo estimado: ${data.estimatedTime}` : ''}

INSTRUCCIONES IMPORTANTES:
- Mantente cerca del área de competencia
- Escucha los anuncios del locutor
- Prepárate con anticipación
- Verifica tu número de participante: #${data.participantCode}
- Dirígete a la PISTA ${data.trackNumber} cuando sea tu turno
- Ten tu documentación lista si es requerida

¡Te deseamos mucha suerte en tu presentación! 🎭✨

---
Este es un mensaje automático del sistema de competencias.
Si tienes alguna duda, acércate a los organizadores.
    `;

    return { subject, htmlContent, textContent };
  }

  // Enviar notificaciones usando la API route
  async sendTandaNotifications(
    notifications: EmailNotificationData[],
    onProgress?: (current: number, total: number, currentEmail?: string) => void
  ): Promise<EmailSendResult> {
    const results: EmailSendResult = {
      success: 0,
      failed: 0,
      errors: [],
      details: [],
    };

    // Preparar todos los emails
    const emails: Array<{
      to: string;
      subject: string;
      html: string;
      text: string;
      participantCode: string;
    }> = [];

    notifications.forEach(notification => {
      const template = this.createParticipantEmailTemplate(notification);
      
      notification.emails.forEach(email => {
        emails.push({
          to: email,
          subject: template.subject,
          html: template.htmlContent,
          text: template.textContent,
          participantCode: notification.participantCode
        });
      });
    });

    const totalEmails = emails.length;
    console.log(`📧 Preparando envío de ${totalEmails} emails...`);

    try {
      // Llamar a la API route
      const response = await fetch('/api/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Simular progreso para la UI (ya que el envío real es en el servidor)
      for (let i = 1; i <= totalEmails; i++) {
        onProgress?.(i, totalEmails, emails[i - 1]?.to);
        await new Promise(resolve => setTimeout(resolve, 50)); // Progreso rápido
      }

      return result.results;

    } catch (error) {
      console.error('Error enviando emails:', error);
      
      // Retornar error
      return {
        success: 0,
        failed: totalEmails,
        errors: [`Error de conexión: ${error.message}`],
        details: emails.map(email => ({
          email: email.to,
          success: false,
          error: `Error de conexión: ${error.message}`,
          participantCode: email.participantCode
        }))
      };
    }
  }
}