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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* Spinner animado */}
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>

          {/* Texto principal */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Preparando Panel de Jurado
          </h2>

          {/* Texto secundario */}
          <p className="text-gray-600 mb-6">
            Cargando competencias, participantes y configuración...
          </p>

          {/* Indicadores de progreso */}
          <div className="space-y-2 max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Verificando permisos</span>
              <span className="w-4 h-4 border-2 border-green-300 border-t-green-400 rounded-full animate-spin"></span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Cargando competencia</span>
              <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Sincronizando datos</span>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-400 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )

  return (
    <JudgeView
      currentTanda={tanda}
      liveCompetitionId={competition.id}
      allParticipants={participants}
    />
  );
};

export default Judge;
