// auth.js

import { auth } from "./firebase";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

// Função de cadastro
export async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { ok: true, user: userCredential.user };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// Função de login
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { ok: true, user: userCredential.user };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// Função de logout
export async function logoutUser() {
  try {
    await signOut(auth);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}