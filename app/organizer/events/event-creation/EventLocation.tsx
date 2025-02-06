"use client"

import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export default function EventLocation() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [location, setLocation] = useState({
    name: "",
    street: "",
    lat: 0,
    lng: 0,
    department: "",
    province: "",
    district: "",
  });
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

          const addressComponents = place.address_components || [];
          let department = "", province = "", district = "";

          addressComponents.forEach((component: any) => {
            if (component.types.includes("administrative_area_level_1")) {
              department = component.long_name;
            } else if (component.types.includes("administrative_area_level_2")) {
              province = component.long_name;
            } else if (component.types.includes("administrative_area_level_3")) {
              district = component.long_name;
            }
          });

          setLocation({
            name: place.name || "",
            street: place.formatted_address || "",
            lat,
            lng,
            department,
            province,
            district,
          });
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
        className="w-full p-2 border rounded"
      />
      <div id="map" style={{ width: "100%", height: "300px" }}></div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre</label>
        <input type="text" value={location.name} readOnly className="w-full p-2 border rounded bg-gray-100" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Dirección</label>
        <input type="text" value={location.street} readOnly className="w-full p-2 border rounded bg-gray-100" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Latitud</label>
          <input type="text" value={location.lat} readOnly className="w-full p-2 border rounded bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Longitud</label>
          <input type="text" value={location.lng} readOnly className="w-full p-2 border rounded bg-gray-100" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Departamento</label>
        <input type="text" value={location.department} readOnly className="w-full p-2 border rounded bg-gray-100" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Provincia</label>
        <input type="text" value={location.province} readOnly className="w-full p-2 border rounded bg-gray-100" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Distrito</label>
        <input type="text" value={location.district} readOnly className="w-full p-2 border rounded bg-gray-100" />
      </div>
    </div>
  );
}
