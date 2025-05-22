import { db } from "../firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { User } from "../types/userType";

const afiliateAcademy = async (
    academyId: string,
    academyName: string,
    user: User | null,
    loadingUser: boolean
) => {
    if (loadingUser) {
        throw new Error("El usuario aún se está cargando.");
    }

    if (!user) {
        throw new Error("No hay un usuario autenticado.");
    }

    try {
        const userRef = doc(db, "users", user.uid);

        // Actualizar en Firestore
        await updateDoc(userRef, {
            "marinera.academyId": academyId,
            "marinera.academyName": academyName,
        });

        console.log("Academia afiliada exitosamente.");
    } catch (error) {
        console.error("Error al afiliar la academia:", error);
        throw error;
    }
};

export default afiliateAcademy;