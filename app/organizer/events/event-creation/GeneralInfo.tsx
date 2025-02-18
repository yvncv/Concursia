interface GeneralInfoProps {
  data: {
    name: string;
    description: string;
  };
  updateData: (data: any) => void;
  isOnlyRead: boolean; // 🔹 Agregar la prop isOnlyRead
}

export default function GeneralInfo({ data, updateData, isOnlyRead }: GeneralInfoProps) {
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
          disabled={isOnlyRead} // 🔹 Ahora sí funciona correctamente
          className={`w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] 
            placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:outline-none 
            transition-all ${isOnlyRead ? 'bg-gray-200 cursor-not-allowed' : 'focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)]'}`}
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
          disabled={isOnlyRead} // 🔹 Ahora sí funciona correctamente
          className={`w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] 
            placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:outline-none 
            transition-all resize-none ${isOnlyRead ? 'bg-gray-200 cursor-not-allowed' : 'focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)]'}`}
          placeholder="Ingresa la descripción del evento"
        ></textarea>
      </div>
    </div>
  );
}
