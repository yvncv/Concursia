// app/events/[id]/layout.tsx
"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import EventHeader from './eventHeader/EventHeader';
import EventSidebar from './eventSideBar/EventSideBar';
import useEvents from '@/app/hooks/useEvents';
import { useState, useEffect } from 'react';
import { CustomEvent } from '@/app/types/eventType';

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id } = useParams();
  const { events } = useEvents();
  const [currentEvent, setCurrentEvent] = useState<CustomEvent | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const event = events.find(e => e.id === id);
    if (event) {
      setCurrentEvent(event);
    }
  }, [id, events]);

  if (!currentEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <EventHeader event={currentEvent} />
      <div className="flex">
        <EventSidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}