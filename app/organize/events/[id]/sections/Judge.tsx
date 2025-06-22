import React from "react";
import { useParams } from "next/navigation";
import useLiveCompetitions from "@/app/hooks/useLiveCompetition";
import { useCurrentTanda } from "@/app/hooks/useCurrentTanda"; // nuevo
import useUser from "@/app/hooks/useUser";
import JudgeView from "./JudgeModules/JudgeParticipants";
import { Participant } from "@/app/types/participantType";
import { User } from "@/app/types/userType";
import { getDocs, collection, getFirestore } from "firebase/firestore";

const Judge = () => {
  const { id: eventId } = useParams() as { id: string };
  const { user, loadingUser: userLoading } = useUser();
  const { liveCompetitions, loading: compsLoading } = useLiveCompetitions(eventId);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [usersMap, setUsersMap] = React.useState<{ [id: string]: User }>({});

  // Tomar la primera competencia activa
  const competition = liveCompetitions[0]; // O puedes buscar por modalidad/categoría

  const { tanda, loading: tandaLoading } = useCurrentTanda(
    eventId,
    competition?.id ?? "",
    competition?.currentTandaIndex ?? 0
  );

  // Cargar participantes y usuarios cuando haya user
  React.useEffect(() => {
    if (!user) return;
    const db = getFirestore();

    const fetchData = async () => {
      const pSnap = await getDocs(collection(db, "participants"));
      const uSnap = await getDocs(collection(db, "users"));

      const filtered = pSnap.docs
      .map(doc => ({ id: doc.id, ...(doc.data() as Participant) }))
      .filter(p => p.eventId === eventId);
      setParticipants(filtered);

      const map: { [id: string]: User } = {};
      uSnap.docs.forEach(doc => {
        const u = doc.data() as User;
        map[u.id] = u;
      });
      setUsersMap(map);
    };

    fetchData();
  }, [user, eventId]);

  if (userLoading || compsLoading || tandaLoading || !tanda)
    return <div className="text-center mt-10">Cargando datos...</div>;

  return (
    <JudgeView
      currentTanda={tanda}
      liveCompetitionId={competition.id}
      allParticipants={participants}
    />
  );
};

export default Judge;
