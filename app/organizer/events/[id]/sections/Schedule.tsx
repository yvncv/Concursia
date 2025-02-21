import React from 'react';
import { CustomEvent } from '@/app/types/eventType';

interface ScheduleProps {
    event: CustomEvent;
}

const Schedule: React.FC<ScheduleProps> = ({ event }) => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Schedule del Evento</h1>
            <div className="bg-white p-4 shadow-md rounded-lg">
                <h2 className="text-lg font-semibold">Detalles del Evento</h2>
                <p><strong>Nombre:</strong> {event.name}</p>
            </div>
        </div>
    );
};

export default Schedule;