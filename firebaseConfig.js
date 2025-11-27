import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyABKI2SViwg2aT_hr2KHQoqfPEqqO3HDCw",
  authDomain: "meurenda-d52d9.firebaseapp.com",
  projectId: "meurenda-d52d9",
  storageBucket: "meurenda-d52d9.firebasestorage.app",
  messagingSenderId: "739380492360",
  appId: "1:739380492360:web:38e9fdd5eadc5337ca807d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);