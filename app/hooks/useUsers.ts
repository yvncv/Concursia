import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import {
  collection,
  query,
  onSnapshot,
  doc,
  getDoc,
  where,
} from "firebase/firestore";
import { User } from "../types/userType";
import { getAuth } from "firebase/auth";

export default function useUsers(userIds?: string[]) {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let auth;
    if (typeof window !== 'undefined') {
      auth = getAuth(); // ✅ Solo en el cliente
    }

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const fetchUsers = () => {
        let q;

        // Si se pasan IDs específicos, hacer query con where
        if (userIds && userIds.length > 0) {
          const chunks = splitArrayIntoChunks(userIds, 10); // Firestore limita `in` a 10
          const unsubscribers: (() => void)[] = [];

          chunks.forEach((chunk) => {
            const chunkQuery = query(
              collection(db, "users"),
              where("__name__", "in", chunk)
            );

            const unsubscribe = onSnapshot(
              chunkQuery,
              (querySnapshot) => {
                const chunkData = querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                })) as User[];

                setUsers((prev) => {
                  const merged = [...prev];
                  chunkData.forEach((user) => {
                    const exists = merged.find((u) => u.id === user.id);
                    if (!exists) merged.push(user);
                  });
                  return merged;
                });

                setLoading(false);
              },
              (err) => {
                console.error("Error fetching chunked users:", err);
                setError("Error al obtener usuarios");
                setLoading(false);
              }
            );

            unsubscribers.push(unsubscribe);
          });

          // Combina todos los unsubscribes
          return () => unsubscribers.forEach((fn) => fn());
        } else {
          // Si no hay IDs, obtenemos todos los usuarios
          q = query(collection(db, "users"));

          const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
              const usersData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as User[];

              setUsers(usersData);
              setLoading(false);
            },
            (err) => {
              console.error("Error fetching users", err);
              setError("Failed to fetch users");
              setLoading(false);
            }
          );

          return () => unsubscribe();
        }
      };

      fetchUsers();
    });

    return () => unsubscribeAuth();
  }, [JSON.stringify(userIds)]); // para que vuelva a ejecutar si cambia el array

  const getUserById = async (userId: string): Promise<User | null> => {
    if (!userId) {
      console.error("Invalid userId:", userId);
      return null;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error getting document:", error);
      return null;
    }
  };

  // También devolvemos usersMap para acceso directo por ID
  const usersMap: Record<string, User> = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<string, User>);

  return { users, usersMap, loadingUsers, error, getUserById };
}

// Helper para dividir un array en partes de máximo 10 elementos
function splitArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
