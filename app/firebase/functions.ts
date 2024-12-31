"use client"

import { useState, useEffect } from 'react';
import { auth, db } from './config'; // Asegúrate de usar la versión correcta de Firebase
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getDoc, doc, Timestamp } from 'firebase/firestore';

interface UserWithProps extends FirebaseUser {
  id: string; // Identificador único del usuario
    name: string; // Nombre del usuario
    email: string; // Correo electrónico del usuario
    contacto: number; // Número de contacto del usuario
    role: "user" | "organizador" | "admin"; // Rol del usuario en el sistema
    idAcademia?: string; // ID de la academia asociada al usuario (opcional)
    eventos: {
      espectados: string[]; // IDs de eventos que el usuario ha presenciado
      participados: string[]; // IDs de eventos en los que el usuario ha participado
    }; // Relación con eventos
    createdAt: Timestamp; // Fecha de creación del usuario
}

const useUser = () => {
  const [user, setUser] = useState<UserWithProps | null>(null);
  const [loadingUser, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() } as UserWithProps);
          } else {
            setUser(firebaseUser as UserWithProps);
          }
        } catch (error) {
          console.error("Error obteniendo datos de Firestore:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loadingUser };
};
export default useUser;
