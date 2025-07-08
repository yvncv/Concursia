import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_DNI_KEY;

export async function decryptAllDnis() {
  const usersCol = collection(db, "users");
  const snapshot = await getDocs(usersCol);

  for (const userDoc of snapshot.docs) {
    const userData = userDoc.data();
    const dni = userData.dni;

    if (!dni || typeof dni !== "string" || !dni.startsWith("U2FsdGVkX1")) {
      console.log(`ℹ️ Usuario ${userDoc.id} no tiene DNI válido para desencriptar.`);
      continue;
    }

    try {
      const decryptedDni = CryptoJS.AES.decrypt(dni, SECRET_KEY).toString(CryptoJS.enc.Utf8);

      if (!decryptedDni) {
        console.warn(`⚠️ Usuario ${userDoc.id}: DNI vacío tras desencriptar.`);
        continue;
      }

      await updateDoc(doc(db, "users", userDoc.id), {
        dni: decryptedDni,
      });

      console.log(`✅ Usuario ${userDoc.id} → DNI desencriptado y actualizado: ${decryptedDni}`);
    } catch (err) {
      console.error(`❌ Error al desencriptar o actualizar DNI de ${userDoc.id}:`, err);
    }
  }

  console.log("✅ Todos los DNIs desencriptados y actualizados en Firebase.");
}
