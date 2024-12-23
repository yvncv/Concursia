import React, { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";

const Map = ({ eventId }: { eventId: string }) => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Función para generar el src del iframe con las coordenadas y el marcador
  const generateMapSrc = (lat: number, lng: number) => {
    // URL para incrustar el mapa sin API key (solo usa el marcador)
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.0176088561384!2d${lat}!3d${lng}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c7e665e59b87%3A0x244b829fd959fdc!2sColiseo%20Eduardo%20Dib%C3%B3s!5e0!3m2!1ses-419!2spe!4v1734985557905!5m2!1ses-419!2spe`;
  };

  // Obtener la latitud y longitud del evento desde Firestore
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const docRef = doc(db, "eventos", eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const eventData = docSnap.data();
          if (eventData?.ubicacion) {
            const [lat, lng] = eventData.ubicacion.split(",").map((coord: string) => parseFloat(coord));
            setLatitude(lat);
            setLongitude(lng);
          }
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error getting document: ", error);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  // Si las coordenadas no están disponibles, mostrar un mensaje
  if (latitude === null || longitude === null) {
    return <p>Cargando ubicación...</p>;
  }

  return (
    <div>
      <h1>Mapa del Evento</h1>
      <iframe
        src={generateMapSrc(latitude, longitude)}
        width="600"
        height="450"
        style={{ border: "0" }}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};

export default Map;
