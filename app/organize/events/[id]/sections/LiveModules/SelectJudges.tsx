"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { CustomEvent } from "@/app/types/eventType";
import { BlockInTanda } from "@/app/types/blockInTandaType";
import { Tanda } from "@/app/types/tandaType";
import { User } from "@/app/types/userType";
import Image from "next/image";
import clsx from "clsx";

interface Props {
  event: CustomEvent;
  tanda: Tanda;
  eventId: string;
  liveCompetitionId: string;
  onUpdate?: () => void;
}

export default function AsignarJurados({
  event,
  tanda,
  eventId,
  liveCompetitionId,
  onUpdate,
}: Props) {
  const [bloques, setBloques] = useState<BlockInTanda[]>(tanda.blocks || []);
  const [jurados, setJurados] = useState<User[]>([]);

  // 1. Cargar jurados con datos reales
  useEffect(() => {
    const cargarJurados = async () => {
      const conPermisoLive = event.staff?.filter((s) =>
        s.permissions.includes("live")
      ) || [];

      const juradosConDatos: User[] = [];

      for (const s of conPermisoLive) {
        const docRef = doc(db, "users", s.userId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          juradosConDatos.push({ ...(snap.data() as User), id: s.userId });
        }
      }

      setJurados(juradosConDatos);
    };

    cargarJurados();
  }, [event.staff]);

  // 2. Asignar o desasignar jurado a bloque
  const handleToggleJurado = (blockIndex: number, userId: string) => {
    setBloques((prev) =>
      prev.map((block) => {
        if (block.blockIndex !== blockIndex) return block;
        const judgeIds = block.judgeIds || [];
        const updatedIds = judgeIds.includes(userId)
          ? judgeIds.filter((id) => id !== userId)
          : [...judgeIds, userId];
        return { ...block, judgeIds: updatedIds };
      })
    );
  };

  // 3. Guardar cambios
  const handleGuardar = async () => {
    try {
      const tandaRef = doc(
        db,
        "eventos",
        eventId,
        "liveCompetition",
        liveCompetitionId,
        "tandas",
        tanda.id
      );
      await updateDoc(tandaRef, {
        blocks: bloques,
      });
      console.log("✅ Jurados asignados exitosamente");
      onUpdate?.();
    } catch (error) {
      console.error("❌ Error al asignar jurados:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        Asignar Jurados a la Tanda #{tanda.index + 1}
      </h2>

      {bloques.map((block) => (
        <div
          key={block.blockIndex}
          className="border p-4 rounded shadow space-y-2"
        >
          <p className="font-medium mb-2">Bloque #{block.blockIndex + 1}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {jurados.map((j) => {
              const selected = block.judgeIds?.includes(j.id);
              return (
                <button
                  key={j.id}
                  onClick={() => handleToggleJurado(block.blockIndex, j.id)}
                  className={clsx(
                    "flex flex-col items-center p-3 rounded border cursor-pointer transition hover:shadow",
                    selected
                      ? "border-blue-600 bg-blue-100"
                      : "border-gray-300 bg-white"
                  )}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
                    <Image
                      src={
                        typeof j.profileImage === "string"
                          ? j.profileImage
                          : "/avatar-placeholder.png"
                      }
                      alt={j.firstName || j.id}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm text-center font-medium">
                    {j.firstName} {j.lastName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        onClick={handleGuardar}
      >
        Guardar Asignaciones
      </button>
    </div>
  );
}
