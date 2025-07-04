// app/firebase/config.ts

import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, setDoc, doc, Timestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import type { FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_apiKey!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_authDomain!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_projectId!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_storageBucket!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_messagingSenderId!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_appId!,
};

// Declaramos variables nulas por defecto
let app: FirebaseApp | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

// Solo inicializamos Firebase cuando estamos en el cliente
if (typeof window !== "undefined") {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
}

// Exportamos, sabiendo que en SSR serán null y no causarán errores
export { app, db, storage, auth, setDoc, doc, Timestamp };
