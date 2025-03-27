import { ArrowLeft, Undo, Redo, Cloud, BarChart2, Printer, Plus } from "lucide-react";
import Link from "next/link";
import { CustomEvent } from '@/app/types/eventType';
import { useState, useRef, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config"; // Adjust this import based on your Firebase config path

interface EventHeaderProps {
  event: CustomEvent;
  onEventNameChange?: (newName: string) => void;
}

const EventHeader: React.FC<EventHeaderProps> = ({ event, onEventNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [eventName, setEventName] = useState(event.name);
  const [isHovering, setIsHovering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState('auto');

  useEffect(() => {
    // Calculate width based on content
    if (spanRef.current) {
      const width = spanRef.current.offsetWidth + 20;
      setInputWidth(`${Math.max(width, 100)}px`);
    }
  }, [eventName, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      
      // Don't select text when entering edit mode - place cursor at end instead
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const updateEventNameInFirebase = async (newName: string) => {
    if (!event.id || newName === event.name) return;
    
    setIsSaving(true);
    try {
      const eventRef = doc(db, "eventos", event.id);
      await updateDoc(eventRef, {
        name: newName
      });
      
      // Call the optional callback if provided
      if (onEventNameChange) {
        onEventNameChange(newName);
      }
    } catch (error) {
      console.error("Error updating event name:", error);
      // Revert to original name on error
      setEventName(event.name);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    setIsHovering(false);
    if (eventName !== event.name) {
      updateEventNameInFirebase(eventName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (eventName !== event.name) {
        updateEventNameInFirebase(eventName);
      }
    } else if (e.key === 'Escape') {
      setEventName(event.name);
      setIsEditing(false);
    }
  };

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
            {/* Hidden span to measure text width */}
            <span 
              ref={spanRef} 
              className="absolute opacity-0 text-sm whitespace-nowrap"
              aria-hidden="true"
            >
              {eventName}
            </span>
            
            <div 
              className="relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => !isEditing && setIsHovering(false)}
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  style={{ width: inputWidth }}
                  className="bg-transparent text-white text-sm focus:outline-none px-0 py-0"
                  disabled={isSaving}
                />
              ) : (
                <span 
                  className={`text-white text-sm inline-block cursor-text whitespace-nowrap ${isHovering ? 'border-b border-dashed border-white/50' : ''}`}
                  onClick={() => setIsEditing(true)}
                >
                  {isSaving ? (
                    <span className="opacity-70">Guardando...</span>
                  ) : (
                    eventName
                  )}
                </span>
              )}
            </div>
            
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