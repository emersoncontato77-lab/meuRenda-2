// database.js

import { db } from "./firebase";
import { 
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

// -----------------------------
// SALVAR VENDA
// -----------------------------
export async function saveSale(userId, saleData) {
  try {
    const docRef = await addDoc(collection(db, "sales"), {
      ...saleData,
      userId,
      createdAt: Date.now()
    });
    return { ok: true, id: docRef.id };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// LISTAR VENDAS DO USUÁRIO
export async function getSales(userId) {
  try {
    const q = query(collection(db, "sales"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return [];
  }
}

// APAGAR UMA VENDA
export async function deleteSale(id) {
  try {
    await deleteDoc(doc(db, "sales", id));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// ----------------------------------
// SALVAR META
// ----------------------------------
export async function saveGoal(userId, goalData) {
  try {
    const docRef = await addDoc(collection(db, "goals"), {
      ...goalData,
      userId,
      createdAt: Date.now()
    });
    return { ok: true, id: docRef.id };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// LISTAR METAS DO USUÁRIO
export async function getGoals(userId) {
  try {
    const q = query(collection(db, "goals"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return [];
  }
}

// ATUALIZAR META
export async function updateGoal(id, data) {
  try {
    await updateDoc(doc(db, "goals", id), data);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// EXCLUIR META
export async function deleteGoal(id) {
  try {
    await deleteDoc(doc(db, "goals", id));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// -----------------------------
// SALVAR GASTOS
// -----------------------------
export async function saveExpense(userId, expense) {
  try {
    const docRef = await addDoc(collection(db, "expenses"), {
      ...expense,
      userId,
      createdAt: Date.now()
    });
    return { ok: true, id: docRef.id };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// LISTAR GASTOS
export async function getExpenses(userId) {
  try {
    const q = query(collection(db, "expenses"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return [];
  }
}

// APAGAR GASTO
export async function deleteExpense(id) {
  try {
    await deleteDoc(doc(db, "expenses", id));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// -----------------------------
// SALVAR INVESTIMENTOS
// -----------------------------
export async function saveInvestment(userId, investment) {
  try {
    const docRef = await addDoc(collection(db, "investments"), {
      ...investment,
      userId,
      createdAt: Date.now()
    });
    return { ok: true, id: docRef.id };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// LISTAR INVESTIMENTOS
export async function getInvestments(userId) {
  try {
    const q = query(collection(db, "investments"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return [];
  }
}

// APAGAR INVESTIMENTO
export async function deleteInvestment(id) {
  try {
    await deleteDoc(doc(db, "investments", id));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}