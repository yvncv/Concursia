"use client";

import { useState } from "react";
import { db } from "@/app/firebase/config";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { fakerES as faker } from "@faker-js/faker";

const generarAcademiaAleatoria = (organizerId: string) => {
  const now = Timestamp.now();
  const id = uuidv4();

  return {
    id,
    organizerId, // ahora viene del parámetro
    name: `Academia ${faker.person.lastName()}`,
    email: faker.internet.email(),
    phoneNumber: faker.phone.number(),
    profileImage: `https://source.unsplash.com/random/400x400/?academy,${faker.number.int(1000)}`,
    coverImage: `https://source.unsplash.com/random/800x200/?dance,${faker.number.int(1000)}`,
    description: faker.lorem.sentence(),
    website: faker.internet.url(),
    socialMedia: {
      facebook: `https://facebook.com/${faker.internet.userName()}`,
      instagram: `https://instagram.com/${faker.internet.userName()}`,
      tiktok: `https://tiktok.com/@${faker.internet.userName()}`,
      youtube: `https://youtube.com/${faker.internet.userName()}`,
      whatsapp: `https://wa.me/${faker.phone.number()}`,
      twitter: `https://twitter.com/${faker.internet.userName()}`,
    },
    location: {
      street: faker.location.street(),
      district: faker.location.city(),
      province: faker.location.state(),
      department: faker.location.state(),
      placeName: faker.company.name(),
      coordinates: {
        latitude: faker.location.latitude().toString(),
        longitude: faker.location.longitude().toString(),
      },
    },
    createdAt: now,
    updatedAt: now,
  };
};

const GeneradorAcademias = () => {
  const [cantidad, setCantidad] = useState<number>(1);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreate = async () => {
    setLoading(true);
    setSuccessCount(0);

    try {
      // 🔍 Buscar usuarios con rol "organizer"
      const q = query(collection(db, "users"), where("roleId", "==", "organizer"));
      const querySnapshot = await getDocs(q);
      const organizers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (organizers.length === 0) {
        alert("❌ No hay usuarios con rol 'organizer' disponibles.");
        setLoading(false);
        return;
      }

      for (let i = 0; i < cantidad; i++) {
        const randomOrganizer =
          organizers[Math.floor(Math.random() * organizers.length)];
        const academia = generarAcademiaAleatoria(randomOrganizer.id);

        await setDoc(doc(db, "academias", academia.id), academia);
        setSuccessCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error generando academias:", error);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Generación Masiva de Academias
      </h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Cantidad de academias
        </label>
        <input
          type="number"
          min={1}
          max={3}
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-gray-700 transition-all duration-200"
        />
      </div>

      <button
        onClick={handleCreate}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg"
        disabled={loading}
      >
        {loading ? "Creando..." : "Crear Academias"}
      </button>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-700">
          <span className="font-medium">Academias creadas:</span>
          <span className="text-blue-600 font-bold text-lg ml-2">
            {successCount}
          </span>
        </p>
      </div>
    </div>
  );
};

export default GeneradorAcademias;
