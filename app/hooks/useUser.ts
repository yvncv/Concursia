// app/hooks/useUser.ts
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/app/firebase/config';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { User } from '@/app/types/userType';

export default function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoading] = useState(true);

  useEffect(() => {
    // Llamamos a getAuth() en el cliente
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() } as User);
          } else {
            setUser(firebaseUser as User);
          }
        } catch (error) {
          console.error('Error obteniendo datos de Firestore:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loadingUser };
}
