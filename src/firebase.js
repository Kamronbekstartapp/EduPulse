import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase konsolidan olingan o'zingizning ma'lumotlaringizni kiriting
const firebaseConfig = {
  apiKey: "SIZNING_API_KEY",
  authDomain: "SIZNING_AUTH_DOMAIN",
  projectId: "SIZNING_PROJECT_ID",
  storageBucket: "SIZNING_STORAGE_BUCKET",
  messagingSenderId: "SIZNING_MESSAGING_SENDER_ID",
  appId: "SIZNING_APP_ID"
};

// Firebase'ni ishga tushirish
const app = initializeApp(firebaseConfig);

// Firestore ma'lumotlar bazasini ulash
export const db = getFirestore(app);