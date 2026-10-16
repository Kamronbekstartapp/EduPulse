import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxIeJtkNYd54oSqdys_95BaEnoNvgDrjg",
  authDomain: "edupulse-a2c89.firebaseapp.com",
  projectId: "edupulse-a2c89",
  storageBucket: "edupulse-a2c89.firebasestorage.app",
  messagingSenderId: "127030288763",
  appId: "1:127030288763:web:364fd4b20e245b6f00ddde"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);