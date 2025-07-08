import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_DNI_KEY || "";

export async function encryptAllDnisIfNeeded() {
  const usersCol = collection(db, "users");
  const snapshot = await getDocs(usersCol);

  for (const userDoc of snapshot.docs) {
    const userData = userDoc.data();
    const dni = userData.dni;

    // Verifica que el DNI exista y no esté encriptado aún
    if (!dni || typeof dni !== "string" || dni.startsWith("U2FsdGVkX1")) {
      console.log(`ℹ️ Usuario ${userDoc.id}: DNI omitido (no válido o ya encriptado).`);
      continue;
    }

    try {
      const encryptedDni = CryptoJS.AES.encrypt(dni, SECRET_KEY).toString();
      const dniHash = CryptoJS.SHA256(dni).toString();

      await updateDoc(doc(db, "users", userDoc.id), {
        dni: encryptedDni,
        dniHash,
      });

      console.log(`✅ Usuario ${userDoc.id} → DNI encriptado: ${encryptedDni}`);
    } catch (err) {
      console.error(`❌ Error al encriptar o actualizar DNI de ${userDoc.id}:`, err);
    }
  }

  console.log("🔒 Todos los DNIs han sido encriptados si era necesario.");
}
