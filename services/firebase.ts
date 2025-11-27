import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  deleteDoc, 
  doc,
  getDocs,
  writeBatch
} from 'firebase/firestore';

// REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDummyKey-REPLACE_ME",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "meurenda-plus.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "meurenda-plus",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
};

// Data Helpers
export const TRANSACTIONS_COLLECTION = 'transactions';
export const GOALS_COLLECTION = 'goals';

export const clearUserData = async (userId: string) => {
  const batch = writeBatch(db);
  
  // Get all transactions
  const qTrans = query(collection(db, TRANSACTIONS_COLLECTION), where("userId", "==", userId));
  const transSnapshot = await getDocs(qTrans);
  transSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Get all goals
  const qGoals = query(collection(db, GOALS_COLLECTION), where("userId", "==", userId));
  const goalsSnapshot = await getDocs(qGoals);
  goalsSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};
