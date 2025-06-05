// app/organize/events/[id]/page.tsx
"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import useEvents from '@/app/hooks/useEvents';
import { useEffect, useState } from 'react';
import { CustomEvent } from '@/app/types/eventType';
import Overview from './sections/Overview';

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
      <div className="p-6 overflow-hidden">
        <Overview event={currentEvent} />
      </div>
  );
};

export default EventDashboard;