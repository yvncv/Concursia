import { useState } from 'react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { decryptValue } from "@/app/utils/security/securityHelpers";

// Tipos
interface Participante {
  id: string;
  nombre: string;
  dni: string;
  edad: string | number;
  genero: string;
  telefono: string;
  academyId: string;
  academyName: string;
  birthDate: Date;
}

interface Inscripcion {
  modalidad: string;
  level: string;
  category: string;
  isPullCouple: boolean;
  participante: Participante;
  pareja: Participante | null;
  precio: number;
}

interface ExportData {
  modalidad: string;
  nombreParticipante: string;
  academiaParticipante: string;
  nombrePareja: string;
  academiaPareja: string;
  categoria: string;
  precio: number;
  dniParticipante?: string;
  dniPareja?: string;
}

interface UseExportInscriptionsProps {
  inscripciones: Inscripcion[];
  eventName: string;
  getParticipantCategory: (participante: { birthDate: Date }) => string;
}

export const useExportInscriptions = ({ 
  inscripciones, 
  eventName,
  getParticipantCategory 
}: UseExportInscriptionsProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const prepareExportData = (): ExportData[] => {
    return inscripciones.map((inscripcion) => {
      const data: ExportData = {
        modalidad: inscripcion.modalidad,
        nombreParticipante: inscripcion.participante.nombre,
        academiaParticipante: inscripcion.participante.academyName,
        nombrePareja: inscripcion.pareja?.nombre || '-',
        academiaPareja: inscripcion.pareja?.academyName || '-',
        categoria: inscripcion.category,
        precio: inscripcion.precio,
        dniParticipante: decryptValue(inscripcion.participante.dni),
        dniPareja: inscripcion.pareja ? decryptValue(inscripcion.pareja.dni) : '-',
      };

      return data;
    });
  };

  const exportToExcel = async (includePersonalData: boolean = false) => {
    if (inscripciones.length === 0) {
      toast.error('No hay inscripciones para exportar');
      return;
    }

    setIsExporting(true);

    try {
      const exportData = prepareExportData();
      
      // Configurar columnas según si incluye datos personales o no
      const columns = includePersonalData 
        ? [
            { header: 'Modalidad', key: 'modalidad', width: 20 },
            { header: 'Participante', key: 'nombreParticipante', width: 30 },
            { header: 'DNI Participante', key: 'dniParticipante', width: 15 },
            { header: 'Academia Participante', key: 'academiaParticipante', width: 25 },
            { header: 'Pareja', key: 'nombrePareja', width: 30 },
            { header: 'DNI Pareja', key: 'dniPareja', width: 15 },
            { header: 'Academia Pareja', key: 'academiaPareja', width: 25 },
            { header: 'Categoría', key: 'categoria', width: 15 },
            { header: 'Precio (S/.)', key: 'precio', width: 12 }
          ]
        : [
            { header: 'Modalidad', key: 'modalidad', width: 20 },
            { header: 'Participante', key: 'nombreParticipante', width: 30 },
            { header: 'Academia Participante', key: 'academiaParticipante', width: 25 },
            { header: 'Pareja', key: 'nombrePareja', width: 30 },
            { header: 'Academia Pareja', key: 'academiaPareja', width: 25 },
            { header: 'Categoría', key: 'categoria', width: 15 },
            { header: 'Precio (S/.)', key: 'precio', width: 12 }
          ];

      // Crear workbook
      const wb = XLSX.utils.book_new();
      
      // Preparar datos para la hoja
      const wsData = [
        // Headers
        columns.map(col => col.header),
        // Data rows
        ...exportData.map(row => 
          columns.map(col => row[col.key as keyof ExportData] || '')
        )
      ];

      // Crear worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Configurar anchos de columna
      ws['!cols'] = columns.map(col => ({ width: col.width }));

      // Estilo para headers (primera fila)
      const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;
        
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F46E5" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }

      // Agregar hoja al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Inscripciones');

      // Crear segunda hoja con resumen
      const totalParticipants = inscripciones.reduce((total, insc) => total + (insc.pareja ? 2 : 1), 0);
      const totalAmount = inscripciones.reduce((total, insc) => total + insc.precio, 0);
      const uniqueAcademies = new Set([
        ...inscripciones.map(insc => insc.participante.academyName),
        ...inscripciones.filter(insc => insc.pareja).map(insc => insc.pareja!.academyName)
      ]);

      const summaryData = [
        ['RESUMEN DEL EVENTO'],
        [''],
        ['Evento:', eventName],
        ['Total de Inscripciones:', inscripciones.length],
        ['Total de Participantes:', totalParticipants],
        ['Academias Participantes:', uniqueAcademies.size],
        ['Monto Total (S/.):', totalAmount],
        [''],
        ['MODALIDADES:'],
        ...Object.entries(
          inscripciones.reduce((acc, insc) => {
            acc[insc.modalidad] = (acc[insc.modalidad] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([modalidad, count]) => [modalidad + ':', count]),
        [''],
        ['ACADEMIAS:'],
        ...Array.from(uniqueAcademies).map(academia => [academia, '']),
        [''],
        ['Exportado el:', new Date().toLocaleString('es-PE', {
          timeZone: 'America/Lima',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })]
      ];

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      summaryWs['!cols'] = [{ width: 25 }, { width: 15 }];
      
      // Estilo para el título del resumen
      if (summaryWs['A1']) {
        summaryWs['A1'].s = {
          font: { bold: true, size: 14 },
          alignment: { horizontal: "center" }
        };
      }

      XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');

      // Generar nombre del archivo
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const sanitizedEventName = eventName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
      const fileName = `Inscripciones_${sanitizedEventName}_${timestamp}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(wb, fileName);

      toast.success(`✅ Archivo exportado: ${fileName}`, {
        duration: 4000,
        icon: '📊'
      });

    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar el archivo');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async () => {
    if (inscripciones.length === 0) {
      toast.error('No hay inscripciones para exportar');
      return;
    }

    setIsExporting(true);

    try {
      const exportData = prepareExportData();
      
      // Headers para CSV
      const headers = [
        'Modalidad',
        'Participante', 
        'Academia Participante',
        'Pareja',
        'Academia Pareja', 
        'Categoría',
        'Precio'
      ];

      // Convertir datos a CSV
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => [
          `"${row.modalidad}"`,
          `"${row.nombreParticipante}"`,
          `"${row.academiaParticipante}"`,
          `"${row.nombrePareja}"`,
          `"${row.academiaPareja}"`,
          `"${row.categoria}"`,
          row.precio
        ].join(','))
      ].join('\n');

      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const sanitizedEventName = eventName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
      const fileName = `Inscripciones_${sanitizedEventName}_${timestamp}.csv`;

      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();

      toast.success(`✅ Archivo CSV exportado: ${fileName}`, {
        duration: 4000,
        icon: '📄'
      });

    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast.error('Error al exportar el archivo CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToExcel,
    exportToCSV,
    isExporting,
    canExport: inscripciones.length > 0
  };
};