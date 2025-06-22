"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/app/firebase/config";
import { User } from "@/app/types/userType";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";

type Academy = {
  id: string;
  name: string;
};

function generateRandomUser(
  index: number,
  academy?: Academy,
  role: "user" | "organizer" = "user"
): Partial<User> {
  const firstNames = ["Luis", "Ana", "Carlos", "María", "Pedro", "Lucía"];
  const lastNames = ["Gómez", "Pérez", "Ramírez", "Torres", "Díaz"];
  const genders = ["Masculino", "Femenino"];
  const levels = ["Seriado"];
  const categories = ["Junior", "Juvenil", "Adulto"];
  const departments = ["Lima", "Arequipa", "Cusco", "Piura", "Trujillo"];

  const firstName =
    firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const gender = genders[Math.floor(Math.random() * genders.length)];
  const level = levels[Math.floor(Math.random() * levels.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const department =
    departments[Math.floor(Math.random() * departments.length)];

  const emailLocal = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}`;
  const email = `${emailLocal}@test.com`;
  const dni = `${Math.floor(10000000 + Math.random() * 90000000)}`;
  const dniHash = CryptoJS.SHA256(dni).toString();

  return {
    id: uuidv4(),
    roleId: role,
    dni,
    dniHash,
    firstName,
    lastName,
    birthDate: Timestamp.fromDate(
      new Date(
        2000 + Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      )
    ),
    gender,
    // email: email,
    // phoneNumber: [
    //   "9" + Math.floor(10000000 + Math.random() * 90000000).toString(),
    // ],
    profileImage: "",
    coverImage: "",
    marinera: academy
      ? {
        participant: {
          level,
          category,
          participatedEvents: [],
        },
        academyId: academy.id,
        academyName: academy.name,
        attendedEvents: [],
      }
      : undefined,
    staffOf: [],
    location: {
      department,
      province: department,
      district: "Centro",
    },
    socialMedia: {},
    createdAt: Timestamp.now(),
  };
}

export default function CreacionMasivaDeUsuarios() {
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [academies, setAcademies] = useState<Academy[]>([]);

  useEffect(() => {
    const fetchAcademies = async () => {
      const querySnapshot = await getDocs(collection(db, "academias"));
      const loadedAcademies: Academy[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setAcademies(loadedAcademies);
    };

    fetchAcademies();
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    setSuccessCount(0);

    // Guardamos el usuario actual para restaurarlo luego
    const currentUser = auth.currentUser;
    const adminEmail = currentUser?.email || "";
    const adminPassword = prompt("Ingresa tu contraseña de administrador para mantener la sesión:");

    const numOrganizers = Math.floor(cantidad / 4);
    const mitadConAcademia = Math.floor(cantidad / 2);

    for (let i = 0; i < cantidad; i++) {
      const isOrganizer = i < numOrganizers;
      const role: "user" | "organizer" = isOrganizer ? "organizer" : "user";

      const shouldAssignAcademy = i < mitadConAcademia && academies.length > 0;
      const randomAcademy = shouldAssignAcademy
        ? academies[Math.floor(Math.random() * academies.length)]
        : undefined;

      const newUser = generateRandomUser(i, randomAcademy, role);
      const email = newUser.email?.[0] || "";
      const password = email.split("@")[0];

      try {
        await createUserWithEmailAndPassword(auth, email, password);
        const uid = auth.currentUser?.uid;

        if (uid) {
          await setDoc(doc(db, "users", uid), {
            ...newUser,
            id: uid,
          });
        }

        // Restaurar sesión del admin después de cada usuario creado
        if (adminEmail && adminPassword) {
          await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        }

        setSuccessCount((prev) => prev + 1);
      } catch (error) {
        console.error(`❌ Error al crear usuario ${email}:`, error);
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Creación Masiva de Usuarios
      </h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Cantidad de usuarios
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
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition duration-200"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Creando...</span>
          </div>
        ) : (
          "Crear Usuarios"
        )}
      </button>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-700">
          <span className="font-medium">Usuarios creados:</span>
          <span className="text-blue-600 font-bold text-lg ml-2">
            {successCount}
          </span>
        </p>
      </div>
    </div>
  );
}
