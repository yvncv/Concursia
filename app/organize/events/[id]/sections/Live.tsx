'use client';

import React, { useState } from 'react';
import { LiveContestRunning } from './LiveModules/LiveContestRunning';
import LiveSchedule from './LiveModules/LiveSchedule';

const Live = ({ event, onBack }) => {
  const [viewState, setViewState] = useState('schedule');
  const [contestStarted, setContestStarted] = useState(false);

  return (
    <div className="w-full">
      {/* Tabs de navegación */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setViewState('schedule')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewState === 'schedule'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Cronograma
        </button>

        <button
          onClick={() => setViewState('execution')}
          disabled={!contestStarted} // 👈 evita acceso si no ha iniciado
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewState === 'execution'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          } ${!contestStarted ? 'opacity-50 cursor-not-allowed' : ''}`} // 👈 estilizado cuando está deshabilitado
        >
          Ejecución
        </button>
      </div>

      {/* Contenido según tab seleccionado */}
      <div className="w-full">
        {viewState === 'schedule' && (
          <LiveSchedule
            event={event}
            onContestStart={(started) => {
              setContestStarted(started);
              if (started) setViewState('execution'); // 👈 cambia al tab automáticamente si inició
            }}
          />
        )}
        {viewState === 'execution' && (
          <LiveContestRunning event={event} onBack={onBack} />
        )}
      </div>
    </div>
  );
};

export default Live;
