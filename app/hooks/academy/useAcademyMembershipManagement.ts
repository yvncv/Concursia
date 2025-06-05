import { useState } from "react";
import { 
  getFirestore, 
  doc, 
  updateDoc, 
  query,
  collection,
  where,
  getDocs,
  serverTimestamp,
  FirestoreError,
  runTransaction
} from "firebase/firestore";

interface UseAcademyMembershipManagementResult {
  // Para que el organizador expulse a un estudiante
  removeStudent: (
    studentId: string, 
    academyId: string, 
    organizerId: string,
    reason?: string
  ) => Promise<void>;
  
  // Para que el usuario se retire voluntariamente
  leaveAcademy: (
    userId: string, 
    academyId: string, 
    reason?: string
  ) => Promise<void>;
  
  loading: boolean;
  error: Error | null;
}

export function useAcademyMembershipManagement(): UseAcademyMembershipManagementResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Función auxiliar para encontrar el registro de membresía activo
  const findActiveMembershipRecord = async (
    db: any, 
    userId: string, 
    academyId: string
  ) => {
    try {
      console.log("🔍 Buscando registro de membresía activo:");
      console.log("- userId:", userId);
      console.log("- academyId:", academyId);
      
      // Buscar TODOS los registros de este usuario en esta academia
      const membershipQuery = query(
        collection(db, "academyMembershipHistory"),
        where("userId", "==", userId),
        where("academyId", "==", academyId)
      );
      
      const snapshot = await getDocs(membershipQuery);
      
      console.log("📊 Resultados de la búsqueda:");
      console.log("- Documentos encontrados:", snapshot.size);
      
      if (snapshot.empty) {
        console.log("⚠️ No se encontró registro de membresía");
        return null;
      }
      
      // Buscar el registro que NO tenga leftAt (registro activo)
      let activeRecord = null;
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log("📄 Registro encontrado:", doc.id, data);
        
        // Si no tiene leftAt o es null, es el registro activo
        if (!data.leftAt || data.leftAt === null) {
          activeRecord = {
            id: doc.id,
            ...data
          };
          console.log("✅ Este es el registro activo");
        }
      });
      
      if (!activeRecord) {
        console.log("⚠️ No se encontró registro activo (todos tienen leftAt)");
      }
      
      return activeRecord;
    } catch (error) {
      console.error("❌ Error buscando registro de membresía:", error);
      return null;
    }
  };

  // Función para que el organizador expulse a un estudiante
  const removeStudent = async (
    studentId: string, 
    academyId: string, 
    organizerId: string,
    reason: string = "Removido por el organizador"
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    console.log("🔄 Iniciando proceso de expulsión:");
    console.log("- studentId:", studentId);
    console.log("- academyId:", academyId);
    console.log("- organizerId:", organizerId);
    console.log("- reason:", reason);

    try {
      const db = getFirestore();
      
      await runTransaction(db, async (transaction) => {
        console.log("📝 Iniciando transacción...");
        
        // 1. Limpiar afiliación del usuario
        console.log("🧹 Limpiando afiliación del usuario...");
        const userRef = doc(db, "users", studentId);
        transaction.update(userRef, {
          "marinera.academyId": null,
          "marinera.academyName": null
        });
        console.log("✅ Afiliación del usuario limpiada");

        // 2. Buscar y actualizar el registro de membresía activo
        console.log("🔍 Buscando registro de membresía activo...");
        const activeMembership = await findActiveMembershipRecord(db, studentId, academyId);
        
        if (activeMembership && activeMembership.id) {
          console.log("✅ Registro activo encontrado, actualizando...");
          console.log("- ID del registro:", activeMembership.id);
          
          const membershipRef = doc(db, "academyMembershipHistory", activeMembership.id);
          const updateData = {
            leftAt: serverTimestamp(),
            removedBy: organizerId,
            reason: reason
          };
          
          console.log("📝 Datos a actualizar:", updateData);
          
          transaction.update(membershipRef, updateData);
          console.log("✅ Transacción de actualización de membresía preparada");
        } else {
          console.log("⚠️ No se encontró registro de membresía para actualizar");
          console.log("- studentId:", studentId);
          console.log("- academyId:", academyId);
        }
      });

      console.log("✅ Estudiante expulsado exitosamente");
    } catch (err: any) {
      console.error("❌ Error al expulsar estudiante:", err);
      
      if (err instanceof FirestoreError) {
        switch (err.code) {
          case 'permission-denied':
            setError(new Error("No tienes permisos para expulsar este estudiante"));
            break;
          case 'not-found':
            setError(new Error("Estudiante o academia no encontrada"));
            break;
          default:
            setError(new Error(`Error del servidor: ${err.message}`));
        }
      } else {
        setError(err instanceof Error ? err : new Error("Error desconocido"));
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para que el usuario se retire voluntariamente
  const leaveAcademy = async (
    userId: string, 
    academyId: string, 
    reason: string = "Salida voluntaria"
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    console.log("🔄 Iniciando proceso de salida voluntaria:");
    console.log("- userId:", userId);
    console.log("- academyId:", academyId);
    console.log("- reason:", reason);

    try {
      const db = getFirestore();
      
      await runTransaction(db, async (transaction) => {
        // 1. Limpiar afiliación del usuario
        const userRef = doc(db, "users", userId);
        transaction.update(userRef, {
          "marinera.academyId": null,
          "marinera.academyName": null
        });

        console.log("✅ Afiliación del usuario limpiada");

        // 2. Buscar y actualizar el registro de membresía activo
        const activeMembership = await findActiveMembershipRecord(db, userId, academyId);
        
        if (activeMembership && activeMembership.id) {
          const membershipRef = doc(db, "academyMembershipHistory", activeMembership.id);
          transaction.update(membershipRef, {
            leftAt: serverTimestamp(),
            reason: reason
            // removedBy se queda undefined (salida voluntaria)
          });
          console.log("✅ Registro de membresía actualizado");
        } else {
          console.log("⚠️ No se encontró registro de membresía para actualizar");
        }
      });

      console.log("✅ Usuario se retiró exitosamente");
    } catch (err: any) {
      console.error("❌ Error al retirarse de la academia:", err);
      
      if (err instanceof FirestoreError) {
        switch (err.code) {
          case 'permission-denied':
            setError(new Error("No tienes permisos para realizar esta acción"));
            break;
          case 'not-found':
            setError(new Error("Usuario o academia no encontrada"));
            break;
          default:
            setError(new Error(`Error del servidor: ${err.message}`));
        }
      } else {
        setError(err instanceof Error ? err : new Error("Error desconocido"));
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    removeStudent,
    leaveAcademy,
    loading,
    error
  };
}