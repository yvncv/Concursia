import React from "react";
import { Event } from "../../types/eventType";

const Map = ({ event }: { event: Event }) => {
  // Extrae las coordenadas del event
  const [latitude, longitude] = event.lugar.coordenadas.split(',').map(coord => parseFloat(coord));

  return (
    <div className="map-container">
      <iframe
        src={`https://www.google.com/maps?q=${latitude},${longitude}&hl=es-419&z=16&output=embed`}  // Ajusta z para el nivel de zoom
        width="100%"  // Para que ocupe todo el ancho disponible
        height="400"  // Altura fija
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Mapa del event"  // Añadido por accesibilidad
      ></iframe>
    </div>
  );
};

export default Map;
