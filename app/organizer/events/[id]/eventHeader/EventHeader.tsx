// app/events/[id]/eventHeader/EventHeader.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CustomEvent } from '@/app/types/eventType';

interface EventHeaderProps {
  event: CustomEvent;
}

const EventHeader: React.FC<EventHeaderProps> = ({ event }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/organizer/events" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
              <p className="text-sm text-gray-500">{event.eventType}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              event.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {event.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EventHeader;