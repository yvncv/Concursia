"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import EventHeader from './eventHeader/EventHeader';
import EventSidebar from './eventSideBar/EventSideBar';
import useEvents from '@/app/hooks/useEvents';
import { CustomEvent } from '@/app/types/eventType';

import Overview from './sections/Overview';
import Tickets from './sections/Tickets';
import Participants from './sections/Participants';
import Schedule from './sections/Schedule';
import Statistics from './sections/Statistics';
import Messages from './sections/Messages';
import Settings from './sections/Settings';

export default function EventLayout() {
  const { id } = useParams();
  const { events } = useEvents();
  const [currentEvent, setCurrentEvent] = useState<CustomEvent | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const event = events.find(e => e.id === id);
    if (event) {
      setCurrentEvent(event);
    }

    // Inicializar el estado de colapso según el tamaño de pantalla
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [id, events]);

  if (!currentEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview event={currentEvent} />;
      case 'tickets':
        return <Tickets event={currentEvent} />;
      case 'participants':
        return <Participants event={currentEvent} />;
      case 'schedule':
        return <Schedule event={currentEvent} />;
      case 'statistics':
        return <Statistics event={currentEvent} />;
      case 'messages':
        return <Messages event={currentEvent} />;
      case 'settings':
        return <Settings event={currentEvent} />;
      default:
        return <Overview event={currentEvent} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <EventHeader event={currentEvent} />
      <div className="flex">
        <EventSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <main className="transition-all duration-300 overflow-x-auto flex-1">
          <div className={`min-w-[1024px] p-6 transition-all duration-300 ${isCollapsed ? 'w-[calc(100vw-4rem)]' : 'w-[calc(100vw-16rem)]'}`} >
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
