"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import useEvents from '@/app/hooks/useEvents';
import useUser from '@/app/hooks/useUser';
import EventHeader from './eventHeader/EventHeader';
import EventSidebar from './eventSideBar/EventSideBar';
import { CustomEvent } from '@/app/types/eventType';

import Overview from './sections/Overview';

import { ALL_SECTIONS_COMPONENT } from './sections/sectionsMap';

export default function EventLayout() {
  const { id } = useParams();
  const { events } = useEvents();
  const { user } = useUser();
  const [currentEvent, setCurrentEvent] = useState<CustomEvent | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const myEntry = useMemo(() => {
    if (!user?.id || !currentEvent?.staff) return null;
    return currentEvent.staff.find(s => s.userId === user.id) ?? null;
  }, [currentEvent?.staff, user?.id]);
  const myPerms = myEntry?.permissions || [];

  // Secciones permitidas
  const allowedSections = useMemo(() => {
    if (user?.roleId === "organizer") return ALL_SECTIONS_COMPONENT;
    return ALL_SECTIONS_COMPONENT.filter(sec =>
      sec.id === 'overview' || myPerms.includes(sec.id)
    );
  }, [user?.roleId, myPerms]);

  // Sección activa
  const [activeSection, setActiveSection] = useState<string | null>(
    allowedSections?.[0]?.id ?? null
  );
  useEffect(() => {
    if (!activeSection && allowedSections?.length > 0) {
      setActiveSection(allowedSections[0].id);
    }
  }, [allowedSections, activeSection]);
  useEffect(() => {
    const ev = events.find(e => e.id === id);
    if (ev) setCurrentEvent(ev);

    const onResize = () => setIsCollapsed(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [id, events]);

  if (!currentEvent) return null;

  // Extraer permisos para el usuario actual


  // Obtener componente activo
  const ActiveComponent = allowedSections.find(s => s.id === activeSection)?.component || Overview;

  const onBack = () => {
    setActiveSection("overview"); // o lo que tenga sentido en tu flujo
  };

  if (!allowedSections.length) {
    return <div className="p-6">No tienes permisos para ver este evento.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <EventHeader event={currentEvent} />
      <div className="flex">
        <EventSidebar
          sections={allowedSections}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <main className="flex-1 overflow-x-auto transition-all duration-300">
          <div className={`${isCollapsed ? 'w-[calc(100vw-4rem)]' : 'w-[calc(100vw-16rem)]'} p-6 min-w-[1024px]`}>
            <ActiveComponent event={currentEvent} onBack={onBack} />
          </div>
        </main>
      </div>
    </div>
  );
}
