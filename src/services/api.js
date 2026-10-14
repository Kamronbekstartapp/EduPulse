const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Ma'muriyat
export async function getAdmins() {
  const res = await fetch(`${API_URL}/admins`);
  return res.json();
}
export async function saveAdmin(data) {
  const res = await fetch(`${API_URL}/admins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function removeAdmin(id) {
  const res = await fetch(`${API_URL}/admins/${id}`, { method: 'DELETE' });
  return res.json();
}

// O'qituvchilar
export async function getTeachers() {
  const res = await fetch(`${API_URL}/teachers`);
  return res.json();
}
export async function saveTeacher(data) {
  const res = await fetch(`${API_URL}/teachers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function removeTeacher(id) {
  const res = await fetch(`${API_URL}/teachers/${id}`, { method: 'DELETE' });
  return res.json();
}

// O'qituvchi akkauntlari
export async function getTeacherAccounts() {
  const res = await fetch(`${API_URL}/teacher-accounts`);
  return res.json();
}
export async function saveTeacherAccount(data) {
  const res = await fetch(`${API_URL}/teacher-accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function removeTeacherAccount(id) {
  const res = await fetch(`${API_URL}/teacher-accounts/${id}`, { method: 'DELETE' });
  return res.json();
}