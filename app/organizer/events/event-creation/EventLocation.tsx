import { useState, useEffect, useRef } from "react";
import { fetchUbigeoINEI, Ubigeo } from "@/app/ubigeo/ubigeoService";

interface EventLocationProps {
  data: {
    latitude: string;
    longitude: string;
    department: string;
    province: string;
    district: string;
    placeName: string;
    street: string;
  };
  updateData: (data: EventLocationProps['data']) => void;
  isOnlyRead: boolean;
}

interface CommonLocation {
  name: string;
  data: EventLocationProps['data'];
}

const commonLocations: CommonLocation[] = [
  {
    name: "Plaza de Armas de Lima",
    data: {
      latitude: "-12.045988",
      longitude: "-77.030545",
      department: "14",
      province: "01",
      district: "01",
      placeName: "Plaza Mayor de Lima",
      street: "Jirón de la Unión, Lima",
    },
  },
  {
    name: "Parque Kennedy - Miraflores",
    data: {
      latitude: "-12.121627",
      longitude: "-77.029700",
      department: "14",
      province: "01",
      district: "15",
      placeName: "Parque Central de Miraflores",
      street: "Av. José Larco, Miraflores",
    },
  },
  {
    name: "Estadio Nacional",
    data: {
      latitude: "-12.067748",
      longitude: "-77.033354",
      department: "14",
      province: "01",
      district: "01",
      placeName: "Estadio Nacional de Perú",
      street: "Jr. José Díaz s/n, Lima",
    },
  },
];

declare global {
  interface Window {
    google: typeof google;
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
    fetchUbigeoINEI().then(setUbigeoData).catch(console.error);
  }, []);

  useEffect(() => {
    const depObj = ubigeoData.find(u => u.nombre === data.department && u.provincia === "00" && u.distrito === "00");
    if (depObj) {
      const provinces = ubigeoData.filter(u => u.departamento === depObj.departamento && u.provincia !== "00" && u.distrito === "00");
      setFilteredProvinces(provinces);

      const provObj = provinces.find(p => p.nombre === data.province);
      if (provObj) {
        const districts = ubigeoData.filter(u => u.departamento === depObj.departamento && u.provincia === provObj.provincia && u.distrito !== "00");
        setFilteredDistricts(districts);
      } else {
        setFilteredDistricts([]);
        updateData({ ...data, province: "", district: "" });
      }
    } else {
      setFilteredProvinces([]);
      setFilteredDistricts([]);
    }
  }, [data.department, data.province, ubigeoData]);

  useEffect(() => {
    if (!window.google?.maps || !mapRef.current) return;
    const pos = data.latitude && data.longitude
      ? { lat: +data.latitude, lng: +data.longitude }
      : { lat: -12.046374, lng: -77.042793 };

    const m = new window.google.maps.Map(mapRef.current, { center: pos, zoom: data.latitude ? 15 : 10 });
    setMap(m);

    if (data.latitude && data.longitude) {
      const mk = new window.google.maps.Marker({ position: pos, map: m, title: data.placeName });
      setMarker(mk);
    }

    if (searchInputRef.current) {
      const ac = new window.google.maps.places.Autocomplete(searchInputRef.current);
      ac.bindTo("bounds", m);
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        marker?.setMap(null);
        const mk2 = new window.google.maps.Marker({ position: { lat, lng }, map: m, title: place.name });
        setMarker(mk2);
        m.setCenter({ lat, lng });
        m.setZoom(15);
        updateData({
          ...data,
          latitude: String(lat),
          longitude: String(lng),
          placeName: place.name || "",
          street: place.formatted_address || "",
        });
      });
    }
  }, [data.latitude, data.longitude, data.placeName, ubigeoData]);

  useEffect(() => {
    if (!map || !data.latitude || !data.longitude) return;
    const pos = { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) };
    marker?.setMap(null);
    const mk = new window.google.maps.Marker({ position: pos, map, title: data.placeName });
    setMarker(mk);
    map.setCenter(pos);
    map.setZoom(15);
  }, [map, data.latitude, data.longitude]);

  const selectCommonLocation = (loc: CommonLocation) => {
    const dep = ubigeoData.find(u => u.departamento === loc.data.department && u.provincia === "00" && u.distrito === "00");
    const prov = ubigeoData.find(u => u.departamento === loc.data.department && u.provincia === loc.data.province && u.distrito === "00");
    const dist = ubigeoData.find(u => u.departamento === loc.data.department && u.provincia === loc.data.province && u.distrito === loc.data.district);
    updateData({
      ...loc.data,
      department: dep?.nombre || "",
      province: prov?.nombre || "",
      district: dist?.nombre || "",
    });
  };

  return (
    <div className="space-y-4">
      {!isOnlyRead && (
        <>
          <input
            type="text"
            ref={searchInputRef}
            placeholder="Buscar ubicación"
            className="w-full px-4 py-2 border-b-2 border-gray-200"
          />
          <div className="flex flex-wrap gap-2 my-2">
            <span className="text-sm text-gray-500">Ubicaciones frecuentes:</span>
            {commonLocations.map((loc, i) => (
              <button
                key={i}
                onClick={() => selectCommonLocation(loc)}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full"
              >
                {loc.name}
              </button>
            ))}
          </div>
        </>
      )}

      <div ref={mapRef} style={{ width: '100%', height: 300 }} />

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Departamento</label>
          <select
            value={data.department}
            onChange={e => updateData({ ...data, department: e.target.value })}
            disabled={isOnlyRead}
            className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
          >
            <option value="">Selecciona departamento</option>
            {ubigeoData.filter(u => u.provincia === "00" && u.distrito === "00").map(dep => (
              <option key={dep.departamento} value={dep.nombre}>{dep.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Provincia</label>
          <select
            value={data.province}
            onChange={e => updateData({ ...data, province: e.target.value })}
            disabled={isOnlyRead}
            className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
          >
            <option value="">Selecciona provincia</option>
            {filteredProvinces.map(prov => (
              <option key={prov.provincia} value={prov.nombre}>{prov.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Distrito</label>
          <select
            value={data.district}
            onChange={e => updateData({ ...data, district: e.target.value })}
            disabled={isOnlyRead}
            className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
          >
            <option value="">Selecciona distrito</option>
            {filteredDistricts.map(dist => (
              <option key={dist.distrito} value={dist.nombre}>{dist.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Dirección</label>
          <input
            type="text"
            value={data.street}
            onChange={e => updateData({ ...data, street: e.target.value })}
            readOnly={isOnlyRead}
            className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Nombre del lugar</label>
          <input
            type="text"
            value={data.placeName}
            onChange={e => updateData({ ...data, placeName: e.target.value })}
            readOnly={isOnlyRead}
            className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}
