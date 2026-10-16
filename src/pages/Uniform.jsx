import React, { useState, useEffect } from 'react';
import { Shirt, BookOpen, CheckCircle2, AlertTriangle, Sparkles, GraduationCap, ChevronRight, Lock, Save } from 'lucide-react';
import { db } from '../firebase'; // Firebase sozlama faylingiz manzili
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

export default function Uniform() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('edupulse_user') || '{}'));
  const [classesList, setClassesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [records, setRecords] = useState({});

  const [selectedClass, setSelectedClass] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [isSavedToday, setIsSavedToday] = useState(false);

  // Bugungi sana (YYYY-MM-DD formatida)
  const todayStr = new Date().toISOString().split('T')[0];

  // Firestore'dan ma'lumotlarni yuklab olish
  useEffect(() => {
    loadDataFromFirebase();
  }, []);

  const loadDataFromFirebase = async () => {
    try {
      // 1. Sinflarni yuklash
      const classesSnap = await getDocs(collection(db, 'classes'));
      setClassesList(classesSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));

      // 2. O'quvchilarni yuklash
      const studentsSnap = await getDocs(collection(db, 'students'));
      setStudentsList(studentsSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));

      // 3. Forma va kitob yozuvlarini yuklash
      const recordsSnap = await getDocs(collection(db, 'uniform_records'));
      const recObj = {};
      recordsSnap.docs.forEach(docSnap => {
        recObj[docSnap.id] = docSnap.data();
      });
      setRecords(recObj);
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
    }
  };

  const isAdmin = user?.role === 'administrator';
  const cTeacher = selectedClass ? (selectedClass.teacher || selectedClass.teacher_name || '') : '';
  const isAssignedTeacher = !isAdmin && classesList.some(c => {
    const cId = c.id || c.class_id;
    const selId = selectedClass ? (selectedClass.id || selectedClass.class_id) : '';
    const tName = c.teacher || c.teacher_name || '';
    return cId === selId && tName.toLowerCase().includes((user?.fullName || user?.username || '').toLowerCase());
  });
  
  const canEdit = isAdmin || isAssignedTeacher;
  const isLockedForUser = !isAdmin && isSavedToday;

  useEffect(() => {
    if (selectedClass) {
      const clsId = selectedClass.id || selectedClass.class_id;
      const recordKey = `${clsId}_${todayStr}`;
      setIsSavedToday(!!records[recordKey]?.locked);
    }
  }, [selectedClass, todayStr, records]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggle = async (studentId, field) => {
    if (!canEdit || isLockedForUser) return;

    const clsId = selectedClass.id || selectedClass.class_id;
    const recordKey = `${clsId}_${todayStr}`;
    
    const currentClassStudents = records[recordKey]?.students || studentsList.filter(s => s.grade === clsId || s.grade === selectedClass.name).map(s => ({
      ...s,
      uniformReady: true,
      booksReady: true,
      notebooksReady: true
    }));

    const updatedStudents = currentClassStudents.map(s => 
      (s.id === studentId || s.student_id === studentId) ? { ...s, [field]: !s[field] } : s
    );

    const recordPayload = {
      locked: isSavedToday,
      students: updatedStudents
    };

    try {
      await setDoc(doc(db, 'uniform_records', recordKey), recordPayload);
      setRecords(prev => ({
        ...prev,
        [recordKey]: recordPayload
      }));
    } catch (err) {
      console.error("Holatni yangilashda xatolik:", err);
    }
  };

  const handleSaveDay = async () => {
    if (!canEdit) return;

    const clsId = selectedClass.id || selectedClass.class_id;
    const recordKey = `${clsId}_${todayStr}`;
    
    const currentClassStudents = records[recordKey]?.students || studentsList.filter(s => s.grade === clsId || s.grade === selectedClass.name).map(s => ({
      ...s,
      uniformReady: true,
      booksReady: true,
      notebooksReady: true
    }));

    const recordPayload = {
      locked: true,
      students: currentClassStudents
    };

    try {
      await setDoc(doc(db, 'uniform_records', recordKey), recordPayload);
      setRecords(prev => ({
        ...prev,
        [recordKey]: recordPayload
      }));
      setIsSavedToday(true);
      showToast(isAdmin ? "Admin tomonidan ma'lumotlar saqlandi!" : "Bugungi ma'lumotlar muvaffaqiyatli saqlandi va qulflandi!");
    } catch (err) {
      console.error("Saqlashda xatolik:", err);
      showToast("Saqlashda xatolik yuz berdi!");
    }
  };

  // Agar sinf tanlanmagan bo'lsa - Sinflar ro'yxatini ko'rsatish
  if (!selectedClass) {
    return (
      <div className="px-4 py-6 sm:px-8 max-w-7xl mx-auto space-y-6">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Forma & Kitob</h2>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Nazorat qilish uchun sinfni tanlang</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classesList.map((cls) => {
            const clsId = cls.id || cls.class_id;
            const count = studentsList.filter(s => s.grade === clsId || s.grade === cls.name).length;
            const tName = cls.teacher || cls.teacher_name || 'Tayinlanmagan';
            return (
              <div
                key={clsId}
                onClick={() => setSelectedClass(cls)}
                className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition space-y-3 cursor-pointer group hover:border-blue-300"
              >
                <div className="flex justify-between items-center">
                  <span className="bg-blue-50 text-blue-700 font-black text-sm px-3 py-1 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                    {cls.name || clsId}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>O'quvchilar: <strong className="text-slate-900">{count} nafar</strong></p>
                  <p>Sinf rahbari: <strong className="text-slate-900">{tName}</strong></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Tanlangan sinf o'quvchilari
  const clsId = selectedClass.id || selectedClass.class_id;
  const recordKey = `${clsId}_${todayStr}`;
  const activeStudents = records[recordKey]?.students || studentsList.filter(s => s.grade === clsId || s.grade === selectedClass.name).map(s => ({
    ...s,
    uniformReady: true,
    booksReady: true,
    notebooksReady: true
  }));

  return (
    <div className="px-4 py-6 sm:px-8 max-w-7xl mx-auto space-y-6">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => setSelectedClass(null)}
            className="text-xs font-bold text-blue-600 hover:underline mb-1 inline-block"
          >
            ← Barcha sinflarga qaytish
          </button>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {selectedClass.name || clsId} — Forma & Kitob Nazorati
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Sana: {todayStr} {isAdmin && <span className="text-blue-600 font-bold">(Admin rejimi)</span>}</p>
        </div>

        {canEdit && (
          <button
            onClick={handleSaveDay}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isAdmin ? "Admin sifatida saqlash" : "Kunlik Natijani Saqlash"}</span>
          </button>
        )}
      </div>

      {!canEdit && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold">
          <Lock className="w-5 h-5 flex-shrink-0" />
          <span>Sizda ushbu sinf ma'lumotlarini o'zgartirish huquqi yo'q (Faqat ko'rish rejimi).</span>
        </div>
      )}

      {isSavedToday && !isAdmin && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Bugungi kunlik ma'lumotlar saqlangan va qulflangan.</span>
        </div>
      )}

      {/* Ro'yxat */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm">O'quvchilar Ro'yxati</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {activeStudents.length > 0 ? (
            activeStudents.map((student) => {
              const stId = student.id || student.student_id;
              const stName = student.fullName || student.full_name || student.name || '';
              return (
                <div key={stId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                      {stName ? stName.slice(0, 2).toUpperCase() : 'ST'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{stName}</h4>
                      <p className="text-[10px] text-slate-400">ID: {stId}</p>
                    </div>
                  </div>

                  {/* Status tugmalari (Forma, Kitob, Daftar) */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      disabled={!canEdit || isLockedForUser}
                      onClick={() => handleToggle(stId, 'uniformReady')}
                      className={`px-3 py-2 rounded-xl font-bold text-[11px] transition ${
                        student.uniformReady ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      } ${(!canEdit || isLockedForUser) ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                    >
                      Forma: {student.uniformReady ? 'Bor' : 'Yo\'q'}
                    </button>

                    <button
                      disabled={!canEdit || isLockedForUser}
                      onClick={() => handleToggle(stId, 'booksReady')}
                      className={`px-3 py-2 rounded-xl font-bold text-[11px] transition ${
                        student.booksReady ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      } ${(!canEdit || isLockedForUser) ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                    >
                      Kitob: {student.booksReady ? 'Bor' : 'Yo\'q'}
                    </button>

                    <button
                      disabled={!canEdit || isLockedForUser}
                      onClick={() => handleToggle(stId, 'notebooksReady')}
                      className={`px-3 py-2 rounded-xl font-bold text-[11px] transition ${
                        student.notebooksReady ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      } ${(!canEdit || isLockedForUser) ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                    >
                      Daftar: {student.notebooksReady ? 'Bor' : 'Yo\'q'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-xs text-slate-400 font-bold">Bu sinfda hali o'quvchilar mavjud emas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}