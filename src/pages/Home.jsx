import React, { useState, useEffect } from 'react';
import { Phone, Award } from 'lucide-react';
import { db } from '../firebase'; // Firebase sozlama faylingiz manzili
import { collection, getDocs } from 'firebase/firestore';

export default function Home() {
  const [adminList, setAdminList] = useState([]);

  // Sahifa ochilganda Firebase Firestore bazasidan ma'muriyat xodimlarini tortib kelish
  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'school_admins'));
      const admins = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAdminList(admins);
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
    }
  };

  return (
    <div className="px-4 sm:px-8 max-w-7xl mx-auto space-y-6 py-4">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
            EduPulse Boshqaruv Tizimi
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Maktab Intizomi va Raqamli Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
            O'quvchilar keldi-ketdisi, forma nazorati hamda o'quv qurollari intizomini yagona platformada boshqaring.
          </p>
        </div>
      </div>

      {/* MAKTAB MA'MURIYATI RO'YXATI */}
      <div className="space-y-4">
        <div className="flex justify-between items-end border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Maktab Ma'muriyati
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              O'quv dargohining rahbar va mas'ul xodimlari ro'yxati
            </p>
          </div>
          <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-xl hidden sm:inline-block">
            Rasmiy Tarkib
          </span>
        </div>

        {adminList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminList.map((item) => (
              <div key={item.admin_id || item.id} className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm uppercase shadow-md shadow-blue-500/20">
                      {item.name ? item.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'AD'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{item.name}</h3>
                      <p className="text-xs text-blue-600 font-semibold">{item.title}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {item.category || 'RAHBAR'}
                  </span>
                </div>

                <div className="text-xs space-y-2 text-slate-600 pt-3 border-t border-slate-100 font-medium">
                  <p className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.phone}</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{item.experience}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200/80 rounded-3xl p-6">
            <p className="text-sm font-bold text-slate-500">Hozircha ma'muriyat xodimlari kiritilmagan.</p>
          </div>
        )}
      </div>
    </div>
  );
}