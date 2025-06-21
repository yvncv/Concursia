import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { BlockInTanda } from "@/app/types/blockInTandaType";

/**
 * Actualiza los bloques de una tanda dentro de una competencia en vivo.
 * 
 * @param eventId ID del evento
 * @param liveCompetitionId ID de la competencia en vivo (ej. "Seriado_Juvenil_Varones")
 * @param tandaId ID de la tanda específica
 * @param updatedBlocks Lista de bloques con jurados asignados
 */
export async function updateTandaBlocks(
  eventId: string,
  liveCompetitionId: string,
  tandaId: string,
  updatedBlocks: BlockInTanda[]
) {
  if (!eventId || !liveCompetitionId || !tandaId) {
    throw new Error(
      `Faltan parámetros en updateTandaBlocks: ${JSON.stringify({
        eventId,
        liveCompetitionId,
        tandaId,
      })}`
    );
  }
  const tandaRef = doc(
    db,
    "eventos",
    eventId,
    "liveCompetition",
    liveCompetitionId,
    "tandas",
    tandaId
  );

  try {
    await updateDoc(tandaRef, {
      blocks: updatedBlocks,
      updatedAt: new Date(), // puedes usar serverTimestamp si prefieres
    });
    console.log("Tanda actualizada con jurados");
  } catch (error) {
    console.error("Error actualizando tanda en Firestore:", error);
    throw error;
  }
}
