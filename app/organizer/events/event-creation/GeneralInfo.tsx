export default function GeneralInfo() {
  return (
    <div className="space-y-10">
      <div>
        <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-4">
          Nombre del evento
        </label>
        <input
          type="text"
          id="eventName"
          className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all"
          placeholder="Ingresa el nombre del evento"
        />

      </div>
      <div>
        <label htmlFor="smallImage" className="block text-sm font-medium text-gray-700 mb-4">
          Imagen de vista previa
        </label>
        <input
          type="file"
          id="smallImage"
          accept="image/*"
          className="mt-1 block w-full text-sm text-[var(--gris-oscuro)]
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-green-100 file:text-green-700
            hover:file:bg-green-200"
        />
      </div>
      <div>
        <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700 mb-4">
          Imagen de portada
        </label>
        <input
          type="file"
          id="bannerImage"
          accept="image/*"
          className="mt-1 block w-full text-sm text-[var(--gris-oscuro)]
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-green-100 file:text-green-700
            hover:file:bg-green-200"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-4">
          Descripción
        </label>
        <textarea
          id="description"
          rows={4}
          className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
          placeholder="Ingresa la descripción del evento"
        ></textarea>
      </div>
    </div>
  )
}

