import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";


L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const Map = ({ eventId }: { eventId: string }) => {
  const [eventLocation, setEventLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eventDetails, setEventDetails] = useState<{
    nombre: string;
    lugar: string;
    descripcion: string;
  } | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      const eventDoc = await getDoc(doc(db, "eventos", eventId));
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        const [lat, lng] = eventData.ubicacion.split(", ").map((coord: string) => parseFloat(coord));
        setEventLocation({ lat, lng });
        setEventDetails({
          nombre: eventData.nombre,
          lugar: eventData.lugar,
          descripcion: eventData.descripcion,
        });
      } else {
        console.error("Evento no encontrado en la base de datos.");
      }
    };

    fetchEventData();
  }, [eventId]);

  if (!eventLocation || !eventDetails) {
    return <p>Cargando mapa...</p>;
  }

  return (
    <MapContainer
      center={[eventLocation.lat, eventLocation.lng]}
      zoom={16}
      style={{ height: "500px", width: "100%" }}
    >
      {/* TileLayer utiliza OpenStreetMap como proveedor gratuito */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Marcador para la ubicación del evento */}
      <Marker position={[eventLocation.lat, eventLocation.lng]}>
        <Popup>
          <strong>{eventDetails.nombre}</strong>
          <br />
          {eventDetails.lugar}
          <br />
          {eventDetails.descripcion}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
