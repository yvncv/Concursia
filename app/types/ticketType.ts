import { Timestamp } from "firebase/firestore";

// Cada inscripción individual o en pareja
export interface TicketEntry {
  usersId: string[];             // IDs de los usuarios inscritos
  academiesId: string[];         // IDs de sus academias (null para nuevas)
  academiesName: string[];       // Nombres de academias
  category: string;              // Categoría de la inscripción  
  level: string;                 // Nivel
  amount: number;                // Precio correspondiente a esta entrada
  
  // Campos de cancelación por entry (opcionales)
  status?: 'Anulado';            // Status específico de esta entry
  cancelledDate?: Timestamp;     // Fecha de cancelación de esta entry
  cancellationReason?: string;   // Motivo de cancelación de esta entry
  cancelledBy?: string;          // Usuario que canceló esta entry
}

// Ticket principal
export interface Ticket {
  id: string;                                // Autogenerado por Firebase
  status: 'Pendiente' | 'Pagado' | 'Anulado';
  eventId: string;
  registrationDate: Timestamp;
  paymentDate?: Timestamp;
  expirationDate: Timestamp;
  inscriptionType: 'Individual' | 'Grupal' | 'Presencial';
  totalAmount: number;
  entries: TicketEntry[];                    // Aquí está toda la info
  createdBy: string;                         // ID del usuario que lo generó
  
  // Campos de cancelación (opcionales)
  cancelledDate?: Timestamp;                 // Fecha y hora de cancelación
  cancellationReason?: string;               // Motivo de la cancelación
  cancelledBy?: string;                      // ID del usuario que canceló
}

// Para guardar en Firestore sin el ID
export type TicketData = Omit<Ticket, 'id'>;