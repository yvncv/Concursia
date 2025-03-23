import { User as FirebaseUser } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export type User = FirebaseUser & {
  id: string;
  roleId: string;
  dni: string;
  firstName: string;
  lastName: string;
  birthDate: Timestamp;
  gender: string;
  email: string[];
  phoneNumber: string[];
  category: string;
  attendedEvents?: string[];
  participatedEvents?: string[];
  level?: string;
  academyId?: string;
  academyName?: string;
  profileImage: string | File;
  createdAt: Timestamp;
};
