import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { User } from "../types/userType";
import { decryptValue } from "../utils/encryption";
import useUser from "./useUser";

export default function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useUser();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, "users"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const usersData: User[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as User;
          const isOwner = currentUser.id === docSnap.id;
          const isOrganizer = currentUser.roleId === "organizer";

          usersData.push({
            ...data,
            id: docSnap.id,
            dni:
              isOwner || isOrganizer
                ? data.dni
                  ? decryptValue(data.dni)
                  : "usuario_sin_dni"
                : undefined,
          });
        });
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
  }, [currentUser]);

  const getUserById = async (userId: string): Promise<User | null> => {
    if (!userId) return null;

    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data() as User;
        const isOwner = currentUser?.id === userDoc.id;
        const isOrganizer = currentUser?.roleId === "organizer";

        return {
          ...data,
          id: userDoc.id,
          dni:
            isOwner || isOrganizer
              ? data.dni
                ? decryptValue(data.dni)
                : "usuario_sin_dni"
              : undefined,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting document:", error);
      return null;
    }
  };

  return { users, loadingUsers, error, getUserById };
}
