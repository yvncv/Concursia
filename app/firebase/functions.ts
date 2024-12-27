"use client"

import { useState, useEffect } from 'react';
import { auth, db } from './config'; // Asegúrate de usar la versión correcta de Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';

interface UserWithRole extends FirebaseUser {
  role?: string;
  name?: string;
  contacto?: number;
}

const useUser = () => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() } as UserWithRole);
          } else {
            setUser(firebaseUser as UserWithRole);
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

  return { user, loading };
};
export default useUser;
