// app/my-registrations/hooks/usePDFGenerator.ts
import { useState, useCallback } from 'react';
import { RegistrationItem } from './useMyRegistrations';
import { PDFGeneratorService } from '@/app/services/my-registrations/PDFGeneratorService';

export interface PDFGeneratorState {
  isGenerating: boolean;
  error: string | null;
  success: boolean;
}

export const usePDFGenerator = () => {
  const [state, setState] = useState<PDFGeneratorState>({
    isGenerating: false,
    error: null,
    success: false,
  });

  const pdfService = PDFGeneratorService.getInstance();

  // Resetear estado
  const resetState = useCallback(() => {
    setState({
      isGenerating: false,
      error: null,
      success: false,
    });
  }, []);

  // Generar PDF compacto (método principal)
  const generatePDF = useCallback(async (
    registration: RegistrationItem,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    setState(prev => ({ ...prev, isGenerating: true, error: null, success: false }));

    try {
      const success = await pdfService.generateCompactPDF(registration);
      
      if (success) {
        setState(prev => ({ ...prev, isGenerating: false, success: true }));
        onSuccess?.();
      } else {
        const errorMsg = 'Error al generar el PDF comprobante';
        setState(prev => ({ ...prev, isGenerating: false, error: errorMsg }));
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, isGenerating: false, error: errorMsg }));
      onError?.(errorMsg);
    }
  }, [pdfService]);

  return {
    ...state,
    generatePDF,
    resetState,
  };
};