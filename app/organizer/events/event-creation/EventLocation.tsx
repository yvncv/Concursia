import { useState, useEffect, useRef } from "react";
import { fetchUbigeoINEI, Ubigeo } from "@/app/ubigeo/ubigeoService";

interface EventLocationProps {
  data: {
    latitude: string;
    longitude: string;
    department: string;
    district: string;
    placeName: string;
    province: string;
    street: string;
  };
  updateData: (data: any) => void;
  isOnlyRead: boolean; // 🔹 Agregado para solo lectura
}

declare global {
  interface Window {
    google: any;
  }
}

export default function EventLocation({ data, updateData, isOnlyRead }: EventLocationProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [ubigeoData, setUbigeoData] = useState<Ubigeo[]>([]);
  const [filteredProvinces, setFilteredProvinces] = useState<Ubigeo[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<Ubigeo[]>([]);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBsEk80W9glHRTOpG8QSneexy8Zwrvkcrs&libraries=places`;
    script.async = true;
    script.onload = initMap;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: Ubigeo[] = await fetchUbigeoINEI();
        setUbigeoData(data);
      } catch (error) {
        console.error("Error al cargar los datos de Ubigeo:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data.department) {
      setFilteredProvinces(
        ubigeoData.filter(
          (item) => item.departamento === data.department && item.provincia !== "00" && item.distrito === "00"
        )
      );
    } else {
      setFilteredProvinces([]);
    }
  }, [data.department, ubigeoData]);

  useEffect(() => {
    if (data.province) {
      setFilteredDistricts(
        ubigeoData.filter(
          (item) =>
            item.departamento === data.department &&
            item.provincia === data.province &&
            item.distrito !== "00"
        )
      );
    } else {
      setFilteredDistricts([]);
    }
  }, [data.province, data.department, ubigeoData]);

  // Efecto para actualizar el marcador cuando cambian las coordenadas
  useEffect(() => {
    if (map && data.latitude && data.longitude) {
      const position = {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude)
      };

      // Eliminar marcador anterior si existe
      if (marker) {
        marker.setMap(null);
      }

      // Crear nuevo marcador
      const newMarker = new window.google.maps.Marker({
        position,
        map,
        title: data.placeName
      });

      setMarker(newMarker);
      map.setCenter(position);
      map.setZoom(15);
    }
  }, [map, data.latitude, data.longitude]);

  function initMap() {
    if (!mapRef.current) return;

    // Establecer la posición inicial
    const initialPosition = data.latitude && data.longitude
      ? {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude)
      }
      : { lat: -12.046374, lng: -77.042793 }; // Default position

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: initialPosition,
      zoom: data.latitude && data.longitude ? 15 : 10,
    });
    setMap(newMap);

    // Si hay coordenadas guardadas, crear el marcador inicial
    if (data.latitude && data.longitude) {
      const newMarker = new window.google.maps.Marker({
        position: initialPosition,
        map: newMap,
        title: data.placeName
      });
      setMarker(newMarker);
    }

    const input = searchInputRef.current;
    if (input) {
      const autocomplete = new window.google.maps.places.Autocomplete(input);
      autocomplete.bindTo("bounds", newMap);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        if (marker) {
          marker.setMap(null);
        }

        const newMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: newMap,
          title: place.name,
        });
        setMarker(newMarker);

        newMap.setCenter({ lat, lng });
        newMap.setZoom(15);

        updateData({
          ...data,
          placeName: place.name || "",
          street: place.formatted_address || "",
          latitude: lat.toString(),
          longitude: lng.toString(),
          department: "",
          province: "",
          district: ""
        });
      });
    }
  }

  return (
    <div className="space-y-4">
      {!isOnlyRead && (
        <input
          type="text"
          ref={searchInputRef}
          placeholder="Buscar ubicación"
          className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
        />
      )}
      <div
        ref={mapRef}
        id="map"
        style={{ width: "100%", height: "300px" }}
      ></div>

      <div className="flex gap-x-2 w-full">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Departamento</label>
          <select
            value={data.department}
            onChange={(e) => {
              console.log("Departamento seleccionado:", e.target.value);
              updateData({ ...data, department: e.target.value, province: "", district: "" });
            }}
            className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
            disabled={isOnlyRead} // 🔹 Deshabilitado si es solo lectura
          >
            <option value="">Selecciona departamento</option>
            {ubigeoData
              .filter((item) => item.provincia === "00" && item.distrito === "00")
              .map((dep) => (
                <option key={dep.departamento} value={dep.departamento}>
                  {dep.nombre}
                </option>
              ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Provincia</label>
          <select
            value={data.province}
            onChange={(e) => updateData({ ...data, province: e.target.value, district: "" })}
            className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
            disabled={isOnlyRead} // 🔹 Deshabilitado si es solo lectura
          >
            <option value="">Selecciona provincia</option>
            {filteredProvinces.map((prov) => (
              <option key={prov.provincia} value={prov.provincia}>
                {prov.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-x-2 w-full">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Distrito</label>
          <select
            value={data.district}
            onChange={(e) => updateData({ ...data, district: e.target.value })}
            className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
            disabled={isOnlyRead} // 🔹 Deshabilitado si es solo lectura
          >
            <option value="">Selecciona distrito</option>
            {filteredDistricts.map((dist) => (
              <option key={dist.distrito} value={dist.distrito}>
                {dist.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Dirección</label>
          <input
            type="text"
            value={data.street}
            readOnly={isOnlyRead} // 🔹 Solo lectura si es solo lectura
            className="w-full px-4 py-[4.9px] border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre del lugar</label>
        <input
          type="text"
          value={data.placeName}
          readOnly={isOnlyRead} // 🔹 Solo lectura si es solo lectura
          className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
        />
      </div>
    </div>
  );
}
