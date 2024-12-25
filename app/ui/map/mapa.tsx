import React from "react";
import { Evento } from "../evento/eventoType";

const Map = ({ evento }: { evento: Evento }) => {
  // Extrae las coordenadas del evento
  const [latitude, longitude] = evento.ubicacion.split(',').map(coord => parseFloat(coord));

  return (
    <div className="map-container">
      <iframe
        src={`https://www.google.com/maps?q=${latitude},${longitude}&hl=es-419&z=16&output=embed`}  // Ajusta z para el nivel de zoom
        width="100%"  // Para que ocupe todo el ancho disponible
        height="400"  // Altura fija
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Mapa del evento"  // Añadido por accesibilidad
      ></iframe>
    </div>
  );
};

export default Map;
