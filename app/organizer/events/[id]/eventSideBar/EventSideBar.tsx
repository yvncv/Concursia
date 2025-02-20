// app/events/[id]/eventSidebar/EventSidebar.tsx
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  Settings,
  ChartBar,
  MessageSquare
} from 'lucide-react';

interface EventSideBarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const EventSideBar: React.FC<EventSideBarProps> = ({ 
  activeSection, 
  setActiveSection 
}) => {
  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
    { id: 'tickets', label: 'Tickets', icon: Users },
    { id: 'participants', label: 'Participantes', icon: Users },
    { id: 'schedule', label: 'Horarios', icon: Calendar },
    { id: 'statistics', label: 'Estadísticas', icon: ChartBar },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-red-100 text-red-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default EventSideBar;