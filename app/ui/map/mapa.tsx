import React from "react";

const Map = ({ latitude, longitude }: { latitude:string, longitude:string }) => {
  // Extrae las coordenadas del event
  const { lat, long } = { lat: latitude, long: longitude };

  return (
    <iframe
      src={`https://www.google.com/maps?q=${lat},${long}&hl=es-419&z=15&output=embed`}  // Ajusta z para el nivel de zoom
      width="100%"  // Para que ocupe todo el ancho disponible
      height="100%" // Altura fija
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Mapa del event"  // Añadido por accesibilidad
    ></iframe>
  );
};


export default Map;
