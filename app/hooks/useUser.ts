// useUser.ts
'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { User } from '../types/userType';

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() } as User);
          } else {
            setUser(firebaseUser as User);
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
