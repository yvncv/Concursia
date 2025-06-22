import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { Tanda } from "@/app/types/tandaType";

export function useCurrentTanda(eventId: string, liveCompetitionId: string, currentIndex: number) {
  const [tanda, setTanda] = useState<Tanda | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId || !liveCompetitionId) return;

    const fetchTanda = async () => {
      setLoading(true);
      try {
        const ref = doc(
          db,
          "eventos",
          eventId,
          "liveCompetition",
          liveCompetitionId,
          "tandas",
          `tanda_${currentIndex}`
        );
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setTanda({ id: snap.id, ...snap.data() } as Tanda);
        }
      } catch (error) {
        console.error("Error al obtener la tanda actual:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTanda();
  }, [eventId, liveCompetitionId, currentIndex]);

  return { tanda, loading };
}
