import React from 'react';
import { CustomEvent } from '@/app/types/eventType';

interface OverviewProps {
    event: CustomEvent;
}

const Overview: React.FC<OverviewProps> = ({ event }) => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Resumen del Evento</h1>
            <div className="bg-white p-4 shadow-md rounded-lg">
                <h2 className="text-lg font-semibold">Detalles del Evento</h2>
                <p><strong>Nombre:</strong> {event.name}</p>
                <p><strong>Fecha de Inicio:</strong> {event.startDate.toDate().toLocaleDateString()}</p>
                <p><strong>Fecha de Fin:</strong> {event.endDate.toDate().toLocaleDateString()}</p>
                <p><strong>Ubicación:</strong> {event.location.placeName}</p>
                <p><strong>Descripción:</strong> {event.description}</p>
            </div>
        </div>
    );
};

export default Overview;