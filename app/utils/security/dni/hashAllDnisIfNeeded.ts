import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { decryptValue, hashValue } from "@/app/utils/security/securityHelpers";

export async function hashAllDnis() {
  const usersCol = collection(db, "users");
  const snapshot = await getDocs(usersCol);

  for (const userDoc of snapshot.docs) {
    const userData = userDoc.data();
    const encryptedDni = userData.dni;

    if (!encryptedDni || typeof encryptedDni !== "string" || !encryptedDni.startsWith("U2FsdGVkX1")) {
      console.log(`ℹ️ Usuario ${userDoc.id} no tiene DNI encriptado válido.`);
      continue;
    }

    try {
      const decrypted = decryptValue(encryptedDni);
      const dniHash = hashValue(decrypted);

      await updateDoc(doc(db, "users", userDoc.id), {
        dniHash: dniHash,
      });

      console.log(`✅ Usuario ${userDoc.id}: hash guardado`);
    } catch (err) {
      console.error(`❌ Error al hashear el DNI de ${userDoc.id}:`, err);
    }
  }

  console.log("🔐 Hasheo de DNIs completado.");
}
