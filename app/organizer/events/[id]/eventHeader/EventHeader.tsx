import { ArrowLeft, Undo, Redo, Cloud, BarChart2, Printer, Plus } from "lucide-react";
import Link from "next/link";
import { CustomEvent } from '@/app/types/eventType';

interface EventHeaderProps {
  event: CustomEvent;
}

const EventHeader: React.FC<EventHeaderProps> = ({ event }) => {
  return (
    <header className="bg-gradient-to-r from-red-500 via-rose-500 to-rose-400 shadow-md">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <Link href="/organizer/events" className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">Archivo</span>
            </div>
          </div>

          {/* Center section */}
          <div className="flex items-center space-x-2">
            <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
              <Undo className="h-4 w-4" />
            </button>
            <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
              <Redo className="h-4 w-4" />
            </button>
            <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
              <Cloud className="h-4 w-4" />
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            <span className="text-white text-sm">{event.name}</span>
            <div className="flex items-center space-x-2">
              <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                <BarChart2 className="h-4 w-4" />
              </button>
              <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                <Plus className="h-4 w-4" />
              </button>
              <button className="text-white hover:bg-white/20 hidden sm:flex items-center space-x-2 px-3 py-2 rounded-md transition-colors">
                <Printer className="h-4 w-4" />
                <span className="text-sm">Imprimir con Canva</span>
              </button>
              <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                >
                  <path
                    d="M5 7.5C5 8.32843 4.32843 9 3.5 9C2.67157 9 2 8.32843 2 7.5C2 6.67157 2.67157 6 3.5 6C4.32843 6 5 6.67157 5 7.5ZM13 7.5C13 8.32843 12.3284 9 11.5 9C10.6716 9 10 8.32843 10 7.5C10 6.67157 10.6716 6 11.5 6C12.3284 6 13 6.67157 13 7.5ZM7.5 9C8.32843 9 9 8.32843 9 7.5C9 6.67157 8.32843 6 7.5 6C6.67157 6 6 6.67157 6 7.5C6 8.32843 6.67157 9 7.5 9Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default EventHeader;

