"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import useEvents from '@/app/hooks/useEvents';
import useUser from '@/app/hooks/useUser';
import EventHeader from './eventHeader/EventHeader';
import EventSidebar from './eventSideBar/EventSideBar';
import { CustomEvent } from '@/app/types/eventType';

import Overview from './sections/Overview';
import Tickets from './sections/Tickets';
import Participants from './sections/Participants';
import EventStaff from './sections/EventStaff';
import Schedule from './sections/Schedule';
import Statistics from './sections/Statistics';
import Messages from './sections/Messages';
import Settings from './sections/Settings';

import {
  LayoutDashboard,
  Ticket,
  Users,
  UserCog,
  CalendarDays,
  BarChart2,
  MessageSquare,
  Settings as SettingsIcon
} from "lucide-react";


// Maestro de secciones
const ALL_SECTIONS = [
  { id: 'overview', name: 'Visión General', component: Overview, icon: <LayoutDashboard size={18} /> },
  { id: 'tickets', name: 'Entradas', component: Tickets, icon: <Ticket size={18} /> },
  { id: 'participants', name: 'Participantes', component: Participants, icon: <Users size={18} /> },
  { id: 'eventstaff', name: 'Personal', component: EventStaff, icon: <UserCog size={18} /> },
  { id: 'schedule', name: 'Horario', component: Schedule, icon: <CalendarDays size={18} /> },
  { id: 'statistics', name: 'Estadísticas', component: Statistics, icon: <BarChart2 size={18} /> },
  { id: 'messages', name: 'Mensajes', component: Messages, icon: <MessageSquare size={18} /> },
  { id: 'settings', name: 'Configuración', component: Settings, icon: <SettingsIcon size={18} /> },
];


export default function EventLayout() {
  const { id } = useParams();
  const { events } = useEvents();
  const { user } = useUser();
  const [currentEvent, setCurrentEvent] = useState<CustomEvent | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const myEntry = useMemo(
    () => currentEvent?.staff?.find(s => s.userId === user?.id) ?? null,
    [currentEvent?.staff, user?.id]
  );
  const myPerms = myEntry?.permissions || [];

  // Secciones permitidas
  const allowedSections = useMemo(() => {
    if (user?.roleId === "organizer") return ALL_SECTIONS;
    return ALL_SECTIONS.filter(sec =>
      sec.id === 'overview' || myPerms.includes(sec.id)
    );
  }, [user?.roleId, myPerms]);

  // Sección activa
  const [activeSection, setActiveSection] = useState<string | null>(null);
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
  const ActiveComponent = ALL_SECTIONS.find(s => s.id === activeSection)?.component || Overview;

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
            <ActiveComponent event={currentEvent} />
          </div>
        </main>
      </div>
    </div>
  );
}
