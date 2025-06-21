import { LiveCompetition } from '@/app/types/liveCompetitionType';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/config';

export default function useLiveCompetitions(eventId: string) {
  const [liveCompetitions, setLiveCompetitions] = useState<LiveCompetition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    const ref = collection(db, 'eventos', eventId, 'liveCompetition'); // ← Aquí corregido

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as LiveCompetition[];

      setLiveCompetitions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  return { liveCompetitions, loading };
}
