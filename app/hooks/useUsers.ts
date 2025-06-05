import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, query, onSnapshot, doc, getDoc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
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

  const updateUserById = async (user: Partial<User>): Promise<void> => {
    if (!user.id) {
      console.error('Invalid user id:', user.id);
      return;
    }

    try {
      const docRef = doc(db, 'users', user.id);
      await updateDoc(docRef, user);
      console.log('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  const deleteUserById = async (userId: string): Promise<void> => {
    if (!userId) {
      console.error('Invalid userId:', userId);
      return;
    }
    try {
      const docRef = doc(db, 'users', userId);
      await deleteDoc(docRef);
      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }

  const saveUser = async (userData: Omit<User, 'id'>): Promise<void> => {
    try {
      const docRef = await addDoc(collection(db, "users"), userData);
      console.log('User saved successfully with ID:', docRef.id);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user.');
    }
  }



  return { users, loadingUsers, error, getUserById, updateUserById, deleteUserById, saveUser };
}