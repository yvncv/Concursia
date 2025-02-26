// app/types/scoreType.ts
import { Timestamp } from "firebase/firestore";

export interface Score {
    id: string; // Autogenerado por Firebase
    participantId: string;
    heatId: string;
    judgesId: string;
    score: number;
    createdAt: Timestamp; // Timestamp de Firestore
    updatedAt: Timestamp; // Timestamp de Firestore
}