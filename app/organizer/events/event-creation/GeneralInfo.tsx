import { useState } from 'react';

interface GeneralInfoProps {
  data: {
    name: string;
    description: string;
  };
  updateData: (data: any) => void;
}

export default function GeneralInfo({ data, updateData }: GeneralInfoProps) {
  return (
    <div className="space-y-10">
      <div>
        <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-4">
          Nombre del evento
        </label>
        <input
          type="text"
          id="eventName"
          value={data.name}
          onChange={(e) => updateData({ ...data, name: e.target.value })}
          className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all"
          placeholder="Ingresa el nombre del evento"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-4">
          Descripción
        </label>
        <textarea
          id="description"
          rows={4}
          value={data.description}
          onChange={(e) => updateData({ ...data, description: e.target.value })}
          className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
          placeholder="Ingresa la descripción del evento"
        ></textarea>
      </div>
    </div>
  );
}