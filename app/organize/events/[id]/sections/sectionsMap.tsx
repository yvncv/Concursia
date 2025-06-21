
import Overview from './Overview';
import Live from './Live';
import Tickets from './Tickets';
import Participants from './Participants';
import EventStaff from './EventStaff';
import Schedule from './Schedule';
import Statistics from './Statistics';
import Messages from './Messages';
import Settings from './Settings';
import Judge from './Judge';

import {
  LayoutDashboard,
  CircleDot,
  Ticket,
  Users,
  UserCog,
  CalendarDays,
  BarChart2,
  MessageSquare,
  Settings as SettingsIcon,
  Trophy
} from "lucide-react";

// Maestro de secciones
export const ALL_SECTIONS_COMPONENT = [
  { id: 'overview', name: 'Visión General', component: Overview, icon: <LayoutDashboard size={18} /> },
  { id: 'live', name: 'En vivo', component: Live, icon: <CircleDot size={18} /> },
  { id: 'tickets', name: 'Entradas', component: Tickets, icon: <Ticket size={18} /> },
  { id: 'participants', name: 'Participantes', component: Participants, icon: <Users size={18} /> },
  { id: 'eventstaff', name: 'Staff', component: EventStaff, icon: <UserCog size={18} /> },
  { id: 'schedule', name: 'Horario', component: Schedule, icon: <CalendarDays size={18} /> },
  { id: 'statistics', name: 'Estadísticas', component: Statistics, icon: <BarChart2 size={18} /> },
  { id: 'messages', name: 'Mensajes', component: Messages, icon: <MessageSquare size={18} /> },
  { id: 'judge', name: 'Jurado', component: Judge, icon: <Trophy size={18} /> },
  { id: 'settings', name: 'Configuración', component: Settings, icon: <SettingsIcon size={18} /> },
];
