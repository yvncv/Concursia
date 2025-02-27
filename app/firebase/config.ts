// Import the functions you need from the SDKs you need
import { getApp, initializeApp, getApps } from "firebase/app";
import { getFirestore, setDoc, doc, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";   
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrWTuIbOLOomuuUkVl7VHzHaK58isVBSo",
  authDomain: "next-proj-216fd.firebaseapp.com",
  projectId: "next-proj-216fd",
  storageBucket: "next-proj-216fd.firebasestorage.app",
  messagingSenderId: "465667546272",
  appId: "1:465667546272:web:50beb0bbf0e39c8a2cfdc5"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// También puedes exportar las funciones de Firestore directamente si lo prefieres
export { setDoc, doc, Timestamp };