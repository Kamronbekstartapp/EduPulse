import { db } from './firebase'; // Firebase sozlama faylingiz manzili
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

// --- Ma'muriyat (school_admins) ---
export async function getAdmins() {
  try {
    const querySnapshot = await getDocs(collection(db, 'school_admins'));
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (err) {
    console.error("Adminlarni olishda xatolik:", err);
    return [];
  }
}

export async function saveAdmin(data) {
  try {
    const id = data.id || `ADM-${Date.now()}`;
    await setDoc(doc(db, 'school_admins', id), data, { merge: true });
    return { success: true, id, ...data };
  } catch (err) {
    console.error("Adminni saqlashda xatolik:", err);
    return { success: false, error: err.message };
  }
}

export async function removeAdmin(id) {
  try {
    await deleteDoc(doc(db, 'school_admins', id));
    return { success: true, id };
  } catch (err) {
    console.error("Adminni o'chirishda xatolik:", err);
    return { success: false, error: err.message };
  }
}

// --- O'qituvchilar (teachers) ---
export async function getTeachers() {
  try {
    const querySnapshot = await getDocs(collection(db, 'teachers'));
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (err) {
    console.error("O'qituvchilarni olishda xatolik:", err);
    return [];
  }
}

export async function saveTeacher(data) {
  try {
    const id = data.id || `TCH-${Date.now()}`;
    await setDoc(doc(db, 'teachers', id), data, { merge: true });
    return { success: true, id, ...data };
  } catch (err) {
    console.error("O'qituvchini saqlashda xatolik:", err);
    return { success: false, error: err.message };
  }
}

export async function removeTeacher(id) {
  try {
    await deleteDoc(doc(db, 'teachers', id));
    return { success: true, id };
  } catch (err) {
    console.error("O'qituvchini o'chirishda xatolik:", err);
    return { success: false, error: err.message };
  }
}

// --- O'qituvchi akkauntlari (teacher_accounts) ---
export async function getTeacherAccounts() {
  try {
    const querySnapshot = await getDocs(collection(db, 'teacher_accounts'));
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (err) {
    console.error("Akkauntlarni olishda xatolik:", err);
    return [];
  }
}

export async function saveTeacherAccount(data) {
  try {
    const id = data.id || `USR-${Date.now()}`;
    await setDoc(doc(db, 'teacher_accounts', id), data, { merge: true });
    return { success: true, id, ...data };
  } catch (err) {
    console.error("Akkauntni saqlashda xatolik:", err);
    return { success: false, error: err.message };
  }
}

export async function removeTeacherAccount(id) {
  try {
    await deleteDoc(doc(db, 'teacher_accounts', id));
    return { success: true, id };
  } catch (err) {
    console.error("Akkauntni o'chirishda xatolik:", err);
    return { success: false, error: err.message };
  }
}

// --- Dars jadvali (timetable) ---
export async function getTimetable() {
  try {
    const querySnapshot = await getDocs(collection(db, 'timetable'));
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (err) {
    console.error("Dars jadvalini olishda xatolik:", err);
    return [];
  }
}

export async function saveTimetable(data) {
  try {
    const id = data.id || `TT-${Date.now()}`;
    await setDoc(doc(db, 'timetable', id), data, { merge: true });
    return { success: true, id, ...data };
  } catch (err) {
    console.error("Dars jadvalini saqlashda xatolik:", err);
    return { success: false, error: err.message };
  }
}

export async function removeTimetable(id) {
  try {
    await deleteDoc(doc(db, 'timetable', id));
    return { success: true, id };
  } catch (err) {
    console.error("Dars jadvalini o'chirishda xatolik:", err);
    return { success: false, error: err.message };
  }
}