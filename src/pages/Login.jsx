import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';
import { db } from '../firebase'; // Firebase sozlama faylingiz manzili
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const inputUser = username.trim().toLowerCase();
    const inputPass = password.trim();

    if (!inputUser || !inputPass) {
      setError('Iltimos, login va parolni kiriting!');
      setLoading(false);
      return;
    }

    try {
      // 1. Admin tekshiruvi (rahbar / admin)
      if (inputUser === 'rahbar' || inputUser === 'admin') {
        if (inputPass === 'admin123') {
          onLogin({
            username: 'Admin',
            role: 'administrator',
            position: 'Bosh Admin'
          });
          return;
        } else {
          setError('Login yoki parol xato!');
          setLoading(false);
          return;
        }
      }

      // 2. Firebase Firestore'dan o'qituvchi akkauntlarini tekshirish
      const q = query(collection(db, 'teacher_accounts'), where('username', '==', inputUser));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();

        if (userDoc.password === inputPass) {
          onLogin({
            username: userDoc.full_name || userDoc.fullName,
            role: 'teacher',
            position: userDoc.position || "O'qituvchi"
          });
        } else {
          setError("Ushbu o'qituvchi tizimda mavjud, lekin kiritilgan parol xato!");
        }
      } else {
        setError('Bunday loginli foydalanuvchi topilmadi!');
      }
    } catch (err) {
      console.error("Kirishda xatolik:", err);
      setError("Tizimga kirishda xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">EduPulse Tizimi</h1>
          <p className="text-xs text-slate-500 font-medium">Kirish uchun login va parolingizni kiriting</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center space-x-2 font-bold animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Foydalanuvchi Logini</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text" 
                required
                placeholder="Login"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Parol</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="password" 
                required
                placeholder="Parol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-95 text-sm"
          >
            {loading ? "Tekshirilmoqda..." : "Tizimga Kirish"}
          </button>
        </form>
      </div>
    </div>
  );
}