// app/my-registrations/services/PDFGeneratorService.ts
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { RegistrationItem } from '@/app/hooks/my-registrations/useMyRegistrations';

export class PDFGeneratorService {
  private static instance: PDFGeneratorService;
  
  public static getInstance(): PDFGeneratorService {
    if (!PDFGeneratorService.instance) {
      PDFGeneratorService.instance = new PDFGeneratorService();
    }
    return PDFGeneratorService.instance;
  }

  // Método principal optimizado para una sola página
  async generateCompactPDF(registration: RegistrationItem): Promise<boolean> {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Paleta de colores mejorada
      const colors = {
        primary: [220, 38, 38], // Rojo vibrante
        secondary: [248, 250, 252], // Blanco azulado
        accent: [15, 23, 42], // Azul oscuro
        lightGray: [241, 245, 249],
        darkGray: [71, 85, 105],
        success: [34, 197, 94],
        warning: [234, 179, 8],
        error: [239, 68, 68],
        white: [255, 255, 255]
      };
      
      let yPos = 15;

      // FONDO PRINCIPAL
      pdf.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.rect(0, 0, 210, 297, 'F');

      // HEADER PRINCIPAL
      pdf.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
      pdf.roundedRect(10, yPos - 5, 190, 30, 4, 4, 'F');
      
      // Borde decorativo del header
      pdf.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(10, yPos - 5, 190, 30, 4, 4, 'D');

      // Logo y marca
      try {
        const logoImg = await this.loadImage('/concursia-texto.png');
        if (logoImg) {
          // Fondo blanco para el logo
          pdf.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
          pdf.roundedRect(15, yPos - 2, 70, 20, 2, 2, 'F');
          pdf.addImage(logoImg, 'PNG', 20, yPos + 1, 60, 16);
        }
      } catch (error) {
        // Fallback elegante para el logo
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.roundedRect(15, yPos - 2, 70, 20, 2, 2, 'F');
        pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CONCURSIA', 20, yPos + 8);
      }
      
      // Título del documento
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('COMPROBANTE DE INSCRIPCIÓN', 195, yPos + 5, { align: 'right' });
      
      // Fecha de emisión
      pdf.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const now = new Date();
      pdf.text(`${now.toLocaleDateString()} - ${now.toLocaleTimeString()}`, 195, yPos + 15, { align: 'right' });

      yPos += 40;

      // INFORMACIÓN DEL EVENTO
      yPos = this.addSection(pdf, 'INFORMACIÓN DEL EVENTO', yPos, colors.primary);
      
      const eventData = [
        { label: 'Evento:', value: registration.eventName },
        { label: 'Fecha:', value: registration.eventDate.toLocaleDateString() },
        { label: 'Lugar:', value: registration.location },
        { label: 'Categoría:', value: registration.category },
        { label: 'Modalidad:', value: registration.level }
      ];

      yPos = this.addInfoGrid(pdf, eventData, yPos, colors, 2);

      // DETALLES DE INSCRIPCIÓN
      yPos = this.addSection(pdf, 'DETALLES DE INSCRIPCIÓN', yPos, colors.primary);
      
      const registrationData = [
        { label: 'Código:', value: registration.participantCode || 'PENDIENTE' },
        { label: 'Estado:', value: registration.status },
        { label: 'Monto:', value: `S/ ${registration.amount.toFixed(2)}` },
        { label: 'Fecha Inscripción:', value: registration.registrationDate.toLocaleDateString() }
      ];

      if (registration.paymentDate) {
        registrationData.push({ 
          label: 'Fecha Pago:', 
          value: registration.paymentDate.toLocaleDateString() 
        });
      }

      yPos = this.addInfoGrid(pdf, registrationData, yPos, colors, 2);

      // PARTICIPANTES
      yPos = this.addSection(pdf, 'PARTICIPANTES', yPos, colors.primary);
      
      registration.participants.forEach((participant, index) => {
        pdf.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
        pdf.roundedRect(15, yPos - 2, 180, 10, 2, 2, 'F');
        
        // Número del participante
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.circle(25, yPos + 3, 3, 'F');
        pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text((index + 1).toString(), 25, yPos + 4, { align: 'center' });
        
        // Nombre del participante
        pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(participant, 35, yPos + 4);
        
        yPos += 12;
      });

      // ACADEMIA (si existe)
      if (registration.academies.length > 0) {
        yPos = this.addSection(pdf, 'ACADEMIA', yPos, colors.primary);
        
        pdf.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
        pdf.roundedRect(15, yPos - 2, 180, 12, 2, 2, 'F');
        
        pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(registration.academies.join(', '), 20, yPos + 4);
        
        yPos += 20;
      }

      // QR CODE Y ESTADO
      const qrData = `ID:${registration.id}-CODE:${registration.participantCode || 'PENDING'}-EVENT:${registration.eventName}`;
      const qrDataURL = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      });

      // Contenedor del QR y estado
      pdf.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
      pdf.roundedRect(15, yPos, 180, 35, 3, 3, 'F');
      
      // QR Code
      const qrSize = 25;
      pdf.addImage(qrDataURL, 'PNG', 20, yPos + 5, qrSize, qrSize);
      
      // Información del QR
      pdf.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Código de Verificación:', 55, yPos + 12);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`ID: ${registration.id}`, 55, yPos + 20);
      
      // Estado con color
      const statusStyle = this.getStatusStyle(registration.status);
      pdf.setFillColor(statusStyle.bg[0], statusStyle.bg[1], statusStyle.bg[2]);
      pdf.roundedRect(130, yPos + 8, 50, 12, 6, 6, 'F');
      
      pdf.setTextColor(statusStyle.text[0], statusStyle.text[1], statusStyle.text[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(registration.status, 155, yPos + 16, { align: 'center' });

      yPos += 45;

      // INSTRUCCIONES
      pdf.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      pdf.roundedRect(15, yPos, 180, 30, 3, 3, 'F');
      
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📋 INSTRUCCIONES IMPORTANTES', 20, yPos + 8);
      
      pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const instructions = [
        '• Presenta este comprobante junto con tu documento de identidad',
        '• Llega 30 minutos antes del evento',
        '• Para consultas: soporte@concursia.com'
      ];
      
      instructions.forEach((instruction, index) => {
        pdf.text(instruction, 20, yPos + 15 + (index * 5));
      });

      // FOOTER
      const footerY = 275;
      pdf.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.rect(0, footerY, 210, 22, 'F');
      
      pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CONCURSIA - Plataforma de Concursos', 105, footerY + 8, { align: 'center' });
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('📧 soporte@concursia.com | 📱 +51 999 888 777 | 🌐 www.concursia.com', 105, footerY + 15, { align: 'center' });

      // Guardar PDF
      const fileName = `Comprobante_${registration.eventName.replace(/[^a-zA-Z0-9]/g, '_')}_${registration.participantCode || registration.id}.pdf`;
      pdf.save(fileName);
      
      return true;
    } catch (error) {
      console.error('Error generando PDF:', error);
      return false;
    }
  }

  // Método para agregar secciones
  private addSection(pdf: jsPDF, title: string, yPos: number, primaryColor: number[]): number {
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.roundedRect(15, yPos, 180, 8, 2, 2, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 20, yPos + 5);
    
    return yPos + 15;
  }

  // Método para agregar información en grilla
  private addInfoGrid(pdf: jsPDF, data: Array<{label: string, value: string}>, yPos: number, colors: any, columns: number = 2): number {
    const colWidth = 180 / columns;
    let currentCol = 0;
    let currentRow = 0;

    data.forEach((item, index) => {
      const x = 15 + (currentCol * colWidth);
      const y = yPos + (currentRow * 12);

      // Fondo alternado
      if (currentRow % 2 === 0) {
        pdf.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
        pdf.roundedRect(x, y - 3, colWidth - 5, 10, 1, 1, 'F');
      }

      // Etiqueta
      pdf.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.label, x + 3, y + 2);

      // Valor
      pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setFont('helvetica', 'normal');
      const maxWidth = colWidth - 40;
      const truncatedValue = item.value.length > 20 ? item.value.substring(0, 20) + '...' : item.value;
      pdf.text(truncatedValue, x + 35, y + 2);

      currentCol++;
      if (currentCol >= columns) {
        currentCol = 0;
        currentRow++;
      }
    });

    return yPos + (Math.ceil(data.length / columns) * 12) + 10;
  }

  // Método para obtener estilos de estado
  private getStatusStyle(status: string) {
    switch (status.toLowerCase()) {
      case 'confirmada':
      case 'confirmado':
        return { bg: [34, 197, 94], text: [255, 255, 255] };
      case 'pendiente':
        return { bg: [234, 179, 8], text: [255, 255, 255] };
      case 'anulado':
      case 'cancelado':
        return { bg: [239, 68, 68], text: [255, 255, 255] };
      default:
        return { bg: [156, 163, 175], text: [255, 255, 255] };
    }
  }

  // Método para cargar imágenes
  private loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }
}