import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, query, onSnapshot } from "firebase/firestore";
import { User } from "../types/userType";

export default function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = () => {
      const q = query(collection(db, "users"));
      
      // Usar onSnapshot para escuchar cambios en tiempo real
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

      // Limpiar el listener cuando el componente se desmonte
      return () => unsubscribe();
    };

    fetchUsers();
  }, []); // Solo se ejecuta al montar el componente

  return { users, loadingUsers, error };
}
