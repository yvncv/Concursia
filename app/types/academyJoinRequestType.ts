import { Timestamp, FieldValue } from "firebase/firestore";

export type AcademyJoinRequest = {
  id?: string;
  userId: string;
  academyId: string;
  status: "pending" | "accepted" | "rejected";
  requestDate: Timestamp | FieldValue;
  responseDate?: Timestamp | FieldValue;
  message?: string;
};