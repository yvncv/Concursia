"use client";
import { Timestamp } from "firebase/firestore";
import { User } from "@/app/types/userType";
import { JSX } from "react";

export interface FieldDefinition {
  key: string;
  label: string;
  span?: number;
  formatter?: (value: any) => string | JSX.Element;
}

const formatDate = (timestamp: Timestamp) =>
  timestamp?.toDate().toLocaleString() || "Fecha no disponible";

export const getUserFieldDefinitions = (user: User): FieldDefinition[] => {
  return [
    { key: "id", label: "ID", formatter: () => user.id || "N/A" },
    { key: "roleId", label: "Role ID", formatter: () => user.roleId || "N/A" },
    { key: "dni", label: "DNI", formatter: () => user.dni || "N/A" },
    { key: "fullName", label: "Nombre Completo", formatter: () => user.fullName || "N/A" },
    { key: "firstName", label: "Nombre", formatter: () => user.firstName || "N/A" },
    { key: "lastName", label: "Apellido", formatter: () => user.lastName || "N/A" },
    { key: "birthDate", label: "Fecha de Nacimiento", formatter: () => formatDate(user.birthDate) },
    { key: "gender", label: "Género", formatter: () => user.gender || "N/A" },
    // Aquí se usará la clave "email" para mostrar los correos, pero en el modal de edición se hará el tratamiento especial.
    { key: "email", label: "Email", formatter: () => Array.isArray(user.email) ? user.email.join(", ") : user.email || "N/A" },
    // Para el teléfono se hace lo mismo.
    { key: "phoneNumber", label: "Teléfonos", formatter: () => Array.isArray(user.phoneNumber) ? user.phoneNumber.join(", ") : user.phoneNumber || "N/A" },
    { key: "category", label: "Categoría", formatter: () => user.category || "N/A" },
    { key: "attendedEvents", label: "Eventos Asistidos", formatter: () => user.attendedEvents ? user.attendedEvents.join(", ") : "N/A" },
    { key: "participatedEvents", label: "Eventos Participados", formatter: () => user.participatedEvents ? user.participatedEvents.join(", ") : "N/A" },
    { key: "level", label: "Nivel", formatter: () => user.level || "N/A" },
    { key: "academyId", label: "Academia ID", formatter: () => user.academyId || "N/A" },
    // Puedes agregar más campos según necesites.
    { key: "createdAt", label: "Fecha de Creación", formatter: () => formatDate(user.createdAt) },
  ];
};
