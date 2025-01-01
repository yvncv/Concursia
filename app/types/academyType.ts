import { Timestamp } from "firebase/firestore";

export interface Academy {
    id: string;
    idOrganizador: string;
    nombre: string;
    contacto: {
        correo: string;
        telefono: string;
    }
    lugar: {
      nombreLugar: string;
      calle: string;
      coordenadas: string;
      departamento: string;
      distrito: string;
      provincia: string;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }