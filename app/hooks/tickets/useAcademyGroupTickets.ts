// src/app/hooks/tickets/useAcademyGroupTickets.ts
import { useEffect, useState, useCallback } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit as fbLimit,
  onSnapshot,
  getDocs,
  DocumentData,
  QuerySnapshot
} from "firebase/firestore";

/** Tipos */
export interface TicketEntry {
  academiesId: string[];
  academiesName: string[];
  amount: number;
  category: string;
  level: string;
  usersId: string[];
}

export type TicketStatus = "Pendiente" | "Pagado" | "Cancelado" | "Expirado";

export interface GroupTicket {
  id: string;
  createdBy?: string;
  entries: TicketEntry[];
  eventId?: string;
  expirationDate?: Date | null;
  inscriptionType?: string;
  registrationDate?: Date | null;
  status?: TicketStatus;
  totalAmount?: number;
}

/**
 * Hook para obtener tickets de la colección `tickets` filtrados por academyId.
 *
 * @param academyId id de la academia (required para filtrar)
 * @param options.realtime boolean (default true)
 * @param options.limit máximo docs a traer (default 500)
 */
export function useAcademyGroupTickets(
  academyId: string | null | undefined,
  options?: { realtime?: boolean; limit?: number }
) {
  const [tickets, setTickets] = useState<GroupTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const realtime = options?.realtime ?? true;
  const limit = options?.limit ?? 500;
  const db = getFirestore();

  const toDateSafe = (v: any): Date | null => {
    if (!v) return null;
    if (typeof v.toDate === "function") return v.toDate();
    if (v instanceof Date) return v;
    try {
      return new Date(v);
    } catch {
      return null;
    }
  };

  const mapDoc = (id: string, data: DocumentData): GroupTicket => ({
    id,
    createdBy: data.createdBy,
    entries: Array.isArray(data.entries) ? data.entries.map((e: any) => ({
      academiesId: Array.isArray(e.academiesId) ? e.academiesId : [],
      academiesName: Array.isArray(e.academiesName) ? e.academiesName : [],
      amount: typeof e.amount === "number" ? e.amount : Number(e.amount) || 0,
      category: e.category || "",
      level: e.level || "",
      usersId: Array.isArray(e.usersId) ? e.usersId : []
    })) : [],
    eventId: data.eventId,
    expirationDate: toDateSafe(data.expirationDate),
    inscriptionType: data.inscriptionType,
    registrationDate: toDateSafe(data.registrationDate),
    status: data.status,
    totalAmount: typeof data.totalAmount === "number" ? data.totalAmount : Number(data.totalAmount) || 0
  });

  const filterSnapshotByAcademy = (snap: QuerySnapshot<DocumentData>) => {
    const list: GroupTicket[] = [];
    snap.forEach(doc => {
      const data = doc.data();
      const entries = Array.isArray(data.entries) ? data.entries : [];
      const includes = entries.some((entry: any) =>
        Array.isArray(entry.academiesId) && entry.academiesId.includes(academyId as string)
      );
      if (includes) list.push(mapDoc(doc.id, data));
    });
    return list;
  };

  useEffect(() => {
    if (!academyId) {
      setTickets([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    let unsub: (() => void) | undefined;

    const q = query(
      collection(db, "tickets"),
      orderBy("registrationDate", "desc"),
      fbLimit(limit)
    );

    if (realtime) {
      unsub = onSnapshot(q, (snap) => {
        try {
          const filtered = filterSnapshotByAcademy(snap);
          setTickets(filtered);
        } catch (err: any) {
          console.error("useAcademyGroupTickets - snapshot mapping error", err);
          setError(err);
        } finally {
          setLoading(false);
        }
      }, (err) => {
        console.error("useAcademyGroupTickets - snapshot error", err);
        setError(err);
        setLoading(false);
      });
    } else {
      (async () => {
        try {
          const snap = await getDocs(q);
          const filtered = filterSnapshotByAcademy(snap);
          setTickets(filtered);
        } catch (err: any) {
          console.error("useAcademyGroupTickets - getDocs error", err);
          setError(err);
        } finally {
          setLoading(false);
        }
      })();
    }

    return () => {
      if (unsub) unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, academyId, realtime, limit]);

  const refetch = useCallback(() => {
    // For simplicity: toggle loading to trigger consumers to re-evaluate.
    setLoading(true);
    setTimeout(() => setLoading(false), 200);
  }, []);

  return { tickets, loading, error, refetch };
}
