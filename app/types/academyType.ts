import { Timestamp } from "firebase/firestore";

export interface Academy {
  id: string;
  organizerId: string;
  name: string;
  email: string;
  phoneNumber: string;
  profileImage: string | File;
  location: {
    street: string; // Calle del lugar del evento
    district: string; // Distrito del lugar del evento
    province: string; // Provincia del lugar del evento
    department: string; // Departamento del lugar del evento
    placeName: string; // Nombre del lugar del evento
    coordinates: {
      latitude: string; // Latitud del lugar del evento
      longitude: string; // Longitud del lugar del evento
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
