import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { BlockInTanda } from "@/app/types/blockInTandaType";

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
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Tanda actualizada con jurados");
  } catch (error) {
    console.error("❌ Error actualizando tanda en Firestore:", error);
    throw error;
  }
}
