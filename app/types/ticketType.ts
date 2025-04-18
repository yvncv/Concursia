import { Timestamp } from "firebase/firestore";

// Cada inscripción individual o en pareja
export interface TicketEntry {
  usersId: string[];             // IDs de los usuarios inscritos
  academiesId: string[];         // IDs de sus academias
  academiesName: string[];       // Nombres de las academias
  category: string;              // Categoría de la inscripción
  level: string;                 // Nivel (ej. Pre-infante, Infantil, etc.)
  amount: number;                // Precio correspondiente a esta entrada
}

// Ticket principal
export interface Ticket {
  id: string;                                // Autogenerado por Firebase
  status: 'Pendiente' | 'Pagado' | 'Anulado';
  eventId: string;
  registrationDate: Timestamp;
  paymentDate?: Timestamp;
  expirationDate: Timestamp;
  inscriptionType: 'IndividualWeb' | 'MasivaExcel' | 'Presencial';
  totalAmount: number;
  entries: TicketEntry[];
  createdBy: string;                         // ID del usuario que lo generó
}

// Para guardar en Firestore sin el ID (opcional)
export type TicketData = Omit<Ticket, 'id' | 'paymentDate'>;
