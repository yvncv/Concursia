
import React from "react";

const Map = ({ latitude, longitude }: { latitude: string, longitude: string }) => {
  return (
      <iframe
          src={`https://www.google.com/maps?q=${latitude},${longitude}&hl=es-419&z=15&output=embed`}  // Ajusta z para el nivel de zoom
          width="100%"  // Para que ocupe todo el ancho disponible
          height="100%" // Altura fija
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa del evento"  // Añadido por accesibilidad
      ></iframe>
  );
};

export default Map;