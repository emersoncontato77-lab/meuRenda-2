import { initializeApp, getApps, getApp } from 'firebase/app';
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

const firebaseConfig = {
  apiKey: "AIzaSyABKI2SViwg2aT_hr2KHQoqfPEqqO3HDCw",
  authDomain: "meurenda-d52d9.firebaseapp.com",
  projectId: "meurenda-d52d9",
  storageBucket: "meurenda-d52d9.firebasestorage.app",
  messagingSenderId: "739380492360",
  appId: "1:739380492360:web:38e9fdd5eadc5337ca807d"
};

// Singleton pattern para evitar inicialização dupla
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
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