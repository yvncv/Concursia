"use client";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";
import { Event } from "@/app/types/eventType";
import { JSX } from "react";

export interface FieldDefinition {
  key: string;
  label: string;
  span?: number;
  formatter?: (value: any) => string | JSX.Element;
}

const formatDate = (timestamp: Timestamp) =>
  timestamp?.toDate().toLocaleString() || "Fecha no disponible";

export const getFieldDefinitions = (event: Event): FieldDefinition[] => {
  return [
    { key: "id", label: "ID", formatter: () => event.id || "N/A" },
    { key: "name", label: "Nombre", formatter: () => event.name || "Sin nombre" },
    { key: "description", label: "Descripción", formatter: () => event.description || "Sin descripción" },
    { key: "startDate", label: "Fecha de Inicio", formatter: () => formatDate(event.startDate) },
    { key: "endDate", label: "Fecha Fin", formatter: () => formatDate(event.endDate) },
    { key: "eventType", label: "Tipo", formatter: () => event.eventType || "No especificado" },
    { key: "status", label: "Estado", formatter: () => event.status === "active" ? "Activo" : "Inactivo" },
    { key: "academyName", label: "Academia", formatter: () => event.academyName || "N/A" },
    { key: "organizerId", label: "Organizador", formatter: () => event.organizerId || "N/A" },
    { key: "capacity", label: "Capacidad", formatter: () => event.capacity ? event.capacity.toString() : "No definido" },

    // Datos de ubicación con validación segura
    { key: "placeName", label: "Nombre del Lugar", formatter: () => event.location?.placeName || "No disponible" },
    { key: "street", label: "Calle", formatter: () => event.location?.street || "No disponible" },
    { key: "district", label: "Distrito", formatter: () => event.location?.district || "No disponible" },
    { key: "province", label: "Provincia", formatter: () => event.location?.province || "No disponible" },
    { key: "department", label: "Departamento", formatter: () => event.location?.department || "No disponible" },

    // Coordenadas seguras
    { key: "latitude", label: "Latitud", formatter: () => event.location?.coordinates?.latitude ?? "No disponible" },
    { key: "longitude", label: "Longitud", formatter: () => event.location?.coordinates?.longitude ?? "No disponible" },

    // Categorías y niveles asegurando que existan
    { key: "categories", label: "Categorías", span: 2, formatter: () => event.settings?.categories?.join(", ") || "No disponibles" },

    {
      key: "levels",
      label: "Niveles",
      span: 2,
      formatter: () =>
        event.settings?.levels && Object.keys(event.settings.levels).length ? (
          <ul className="list-disc list-inside">
            {Object.entries(event.settings.levels).map(([level, info]: any) => (
              <li key={level}>
                <span className="font-bold">{level}</span>: {info.couple ? "Pareja" : "Individual"}, Precio: S/{info.price}
              </li>
            ))}
          </ul>
        ) : (
          "No definidos"
        ),
    },

    { key: "registrationType", label: "Tipos de Inscripción", span: 2, formatter: () => event.settings?.registrationType?.join(", ") || "No disponibles" },

    { key: "createdBy", label: "Creado por", formatter: () => event.createdBy || "Desconocido" },
    { key: "createdAt", label: "Fecha de creación", formatter: () => formatDate(event.createdAt) },
    { key: "updatedAt", label: "Última actualización", formatter: () => formatDate(event.updatedAt) },

    // Imágenes con verificación
    ...(event.smallImage
      ? [
          {
            key: "smallImage",
            label: "Imagen Pequeña",
            span: 2,
            formatter: () => (
              <Image src={event.smallImage} alt="Imagen Pequeña" width={150} height={150} className="rounded" />
            ),
          },
        ]
      : []),

    ...(event.bannerImage
      ? [
          {
            key: "bannerImage",
            label: "Banner",
            span: 2,
            formatter: () => (
              <Image src={event.bannerImage} alt="Banner" width={600} height={200} className="rounded" />
            ),
          },
        ]
      : []),
  ];
};
