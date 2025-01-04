import { User as FirebaseUser } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export type User = FirebaseUser & {
  roleId: string;
  dni: string;
  fullName: string;
  firstName: string;
  lastName: string;
  birthDate: Timestamp;
  gender: string;
  email: string[];
  phoneNumber: string[];
  attendedEvents?: string[];
  participatedEvents?: string[];
  level?: string;
  academyId?: string;
  createdAt: Timestamp;
  socials?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
};
