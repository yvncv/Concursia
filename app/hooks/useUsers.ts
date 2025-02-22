import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { User } from "../types/userType";
import { getAuth } from "firebase/auth";

export default function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const fetchUsers = () => {
          const q = query(collection(db, "users"));

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const usersData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as User[];

            setUsers(usersData);
            setLoading(false);  // Datos cargados
          }, (err) => {
            console.error("Error fetching users", err);
            setError("Failed to fetch users");
            setLoading(false);
          });

          return () => unsubscribe();
        };

        fetchUsers();
      } else {
        setUsers([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();  // Limpiar el observador de autenticación
  }, []); // Solo se ejecuta al montar el componente

  const getUserById = async (userId: string): Promise<User | null> => {
    if (!userId) {
      console.error('Invalid userId:', userId);
      return null;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  };

  return { users, loadingUsers, error, getUserById };
}