"use client";
import React from "react";
import { CustomEvent } from "@/app/types/eventType";
import { Timestamp } from "firebase/firestore"; // Import Timestamp if using Firebase

interface EventModalProps {
  event: CustomEvent;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  const renderFieldValue = (value: string | Timestamp | object | null | undefined) => {
    if (value instanceof Timestamp) {
      return value.toDate().toString();
    } else if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    } else {
      return value || "N/A";
    }
  };

  return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto transform transition-all ease-in-out duration-300">
          {/* Cabecera del Modal */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex justify-between items-center rounded-t-xl z-10">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{event.name}</h2>
            <button
                onClick={onClose}
                className="text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 text-3xl font-light transition-colors"
            >
              &times;
            </button>
          </div>

          {/* Contenido del Modal */}
          <div className="p-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(event).map((key, index) => (
                  <div key={index} className="md:col-span-2">
                    <strong className="block mb-1 text-gray-600 dark:text-gray-400">{key}:</strong>
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      {renderFieldValue(event[key as keyof CustomEvent])}
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default EventModal;