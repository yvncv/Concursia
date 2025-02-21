import { Timestamp } from "firebase/firestore";

// Define el tipo de Event para TypeScript
export interface Ticket {
    id: string; // Autogenerado por Firebase
    status: string;
    usersId: string[];
    academiesId: string[];
    academiesName: string[];
    eventId: string;
    category: string;
    level: string;
    registrationDate: Timestamp;
    paymentDate?: Timestamp;
}

export interface TicketData {
    status: string;
    usersId: string[];
    academiesId: string[];
    academiesName: string[];
    eventId: string;
    category: string;
    level: string;
    registrationDate: Timestamp;
    paymentDate?: Timestamp;
}

