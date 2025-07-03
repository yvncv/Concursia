// app/firebase/config.ts

import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, Timestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { Auth } from "firebase/auth"; // Importa solo el tipo

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_appId,
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Auth sin require y sin await
let auth: Auth | null = null;

if (typeof window !== "undefined") {
  import("firebase/auth").then((mod) => {
    auth = mod.getAuth(app);
  });
}

export { setDoc, doc, Timestamp, auth };
