// app/events/[id]/page.tsx
"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import useEvents from '@/app/hooks/useEvents';
import { useEffect, useState } from 'react';
import { CustomEvent } from '@/app/types/eventType';

const EventDashboard = () => {
  const { id } = useParams();
  const { events } = useEvents();
  const [currentEvent, setCurrentEvent] = useState<CustomEvent | null>(null);

  useEffect(() => {
    const event = events.find(e => e.id === id);
    if (event) {
      setCurrentEvent(event);
    }
  }, [id, events]);

  if (!currentEvent) {
    return null;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Resumen del Evento</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Detalles Básicos</h3>
          <p><span className="font-medium">Nombre:</span> {currentEvent.name}</p>
          <p><span className="font-medium">Tipo:</span> {currentEvent.eventType}</p>
          <p><span className="font-medium">Capacidad:</span> {currentEvent.capacity}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Ubicación</h3>
          <p><span className="font-medium">Lugar:</span> {currentEvent.location.placeName}</p>
          <p><span className="font-medium">Dirección:</span> {currentEvent.location.street}</p>
          <p><span className="font-medium">Distrito:</span> {currentEvent.location.district}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Fechas</h3>
          <p><span className="font-medium">Inicio:</span> {currentEvent.startDate.toDate().toLocaleDateString()}</p>
          <p><span className="font-medium">Fin:</span> {currentEvent.endDate.toDate().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default EventDashboard;