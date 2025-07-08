import { db } from "@/app/firebase/config"
import { collection, query, where, getDocs } from "firebase/firestore"
import { hashValue } from "@/app/utils/security/securityHelpers";

export async function findUserByDni(dni: string) {
  const hashed = hashValue(dni)
  const q = query(collection(db, "users"), where("dniHash", "==", hashed))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    console.log("No se encontró ningún usuario con ese DNI")
    return null
  }

  const userDoc = snapshot.docs[0]
  const userData = userDoc.data()
  return { id: userDoc.id, ...userData }
}
