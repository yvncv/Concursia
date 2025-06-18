import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_DNI_KEY;

export async function encryptAllDnisIfNeeded() {
  const usersCol = collection(db, "users");
  const snapshot = await getDocs(usersCol);

  for (const userDoc of snapshot.docs) {
    const userData = userDoc.data();
    const dni = userData.dni;

    // Saltar si no hay DNI
    if (!dni) {
      console.log(`⚠️ Usuario ${userDoc.id} no tiene DNI, saltando...`);
      continue;
    }

    // Saltar si ya está encriptado (prefijo típico de CryptoJS AES)
    const isEncrypted = typeof dni === 'string' && dni.startsWith('U2FsdGVkX1');
    if (isEncrypted) {
      console.log(`✅ Usuario ${userDoc.id} ya tiene DNI encriptado, saltando...`);
      continue;
    }

    // Encriptar y actualizar
    const encryptedDni = CryptoJS.AES.encrypt(dni, SECRET_KEY).toString();
    await updateDoc(doc(usersCol, userDoc.id), { dni: encryptedDni });

    console.log(`🔐 DNI de usuario ${userDoc.id} encriptado correctamente.`);
  }

  console.log("🎉 Proceso de encriptación finalizado.");
}
