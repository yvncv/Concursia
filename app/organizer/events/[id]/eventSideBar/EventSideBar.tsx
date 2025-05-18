import React, { useEffect, Dispatch, SetStateAction } from 'react';
import {
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Section {
  id: string;
  name: string;
  icon: React.ReactNode; // si quieres recibir también el icono
}

interface EventSideBarProps {
  sections: Section[];
  activeSection: string;
  setActiveSection: (section: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

const EventSideBar: React.FC<EventSideBarProps> = ({
  sections,
  activeSection,
  setActiveSection,
  isCollapsed,
  setIsCollapsed
}) => {

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsCollapsed]);

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-md min-h-screen transition-all duration-300 relative`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white rounded-full p-1 shadow-md text-gray-600 hover:text-red-600 transition-colors z-10"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <nav className="p-4">
        <ul className="space-y-2">
          {sections.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center' : 'justify-start'
                } px-4 py-2 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-red-100 text-red-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                <div className="flex-shrink-0">
                  {item.icon /* recibe el icono por prop */}
                </div>
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default EventSideBar;
