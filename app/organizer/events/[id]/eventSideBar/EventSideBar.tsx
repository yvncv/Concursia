import React, {  useEffect, Dispatch, SetStateAction } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  BarChart,
  MessageSquare,
  Ticket,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface EventSideBarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

const EventSideBar: React.FC<EventSideBarProps> = ({
  activeSection,
  setActiveSection,
  isCollapsed,
  setIsCollapsed
}) => {

  // Add window resize handler to collapse sidebar on mobile automatically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define menu items directly with JSX for the icons
  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: <LayoutDashboard size={20} /> },
    { id: 'tickets', label: 'Tickets', icon: <Ticket size={20} /> },
    { id: 'participants', label: 'Participantes', icon: <Users size={20} /> },
    { id: 'schedule', label: 'Horarios', icon: <Calendar size={20} /> },
    { id: 'statistics', label: 'Estadísticas', icon: <BarChart size={20} /> },
    { id: 'messages', label: 'Mensajes', icon: <MessageSquare size={20} /> },
    { id: 'settings', label: 'Configuración', icon: <Settings size={20} /> },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-md min-h-screen transition-all duration-300 relative`}>
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-6 bg-white rounded-full p-1 shadow-md text-gray-600 hover:text-red-600 transition-colors z-10" >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveSection(item.id)} // Actualiza la sección activa
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} px-4 py-2 rounded-lg transition-colors ${activeSection === item.id
                    ? 'bg-red-100 text-red-600'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                title={isCollapsed ? item.label : ''}
              >
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default EventSideBar;