"use client";

import { useState, useEffect, useRef } from "react";
import { fetchUbigeoINEI, Ubigeo } from "@/app/ubigeo/ubigeoService";

declare global {
  interface Window {
    google: any;
  }
}

export default function EventLocation() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [ubigeoData, setUbigeoData] = useState<Ubigeo[]>([]);
  const [filteredProvinces, setFilteredProvinces] = useState<Ubigeo[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<Ubigeo[]>([]);

  // Estados separados
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [department, setDepartment] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

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
    if (department) {
      setFilteredProvinces(
        ubigeoData.filter(
          (item) => item.departamento === department && item.provincia !== "00" && item.distrito === "00"
        )
      );
      setProvince("");
      setDistrict("");
    } else {
      setFilteredProvinces([]);
    }
  }, [department, ubigeoData]);

  useEffect(() => {
    if (province) {
      setFilteredDistricts(
        ubigeoData.filter(
          (item) => item.departamento === department && item.provincia === province && item.distrito !== "00"
        )
      );
      setDistrict("");
    } else {
      setFilteredDistricts([]);
    }
  }, [province, department, ubigeoData]);

  function initMap() {
    const mapElement = document.getElementById("map");
    if (mapElement) {
      const newMap = new window.google.maps.Map(mapElement, {
        center: { lat: -12.046374, lng: -77.042793 },
        zoom: 10,
      });
      setMap(newMap);

      const input = searchInputRef.current;
      if (input) {
        const autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.bindTo("bounds", newMap);

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) return;

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          if (marker) marker.setMap(null);

          const newMarker = new window.google.maps.Marker({
            position: { lat, lng },
            map: newMap,
            title: place.name,
          });
          setMarker(newMarker);

          newMap.setCenter({ lat, lng });
          newMap.setZoom(15);

          setName(place.name || "");
          setStreet(place.formatted_address || "");
          setLat(lat);
          setLng(lng);
          setDepartment("");
          setProvince("");
          setDistrict("");
        });
      }
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        ref={searchInputRef}
        placeholder="Buscar ubicación"
        className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
      />
      <div id="map" style={{ width: "100%", height: "300px" }}></div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre del lugar</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
          readOnly
        />
      </div>
      <div className="flex gap-x-2 w-full">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Dirección</label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="w-full px-4 py-[4.9px] border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
            readOnly
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Departamento</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
            required
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
      </div>

      <div className="flex gap-x-2 w-full">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Provincia</label>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
          >
            <option value="">Selecciona provincia</option>
            {filteredProvinces.map((prov) => (
              <option key={prov.provincia} value={prov.provincia}>
                {prov.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Distrito</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
          >
            <option value="">Selecciona distrito</option>
            {filteredDistricts.map((dist) => (
              <option key={dist.distrito} value={dist.distrito}>
                {dist.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
