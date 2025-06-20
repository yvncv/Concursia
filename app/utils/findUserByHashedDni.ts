import { db } from "@/app/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { hashDni } from "./hash";
import { User } from "@/app/types/userType";

export async function findUserByHashedDni(dni: string): Promise<User | null> {
  const hashed = hashDni(dni);
  const q = query(collection(db, "users"), where("dniHash", "==", hashed));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
}
