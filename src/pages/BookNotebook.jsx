import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Save, Lock, ArrowLeft, AlertCircle, Calendar, Sparkles } from 'lucide-react';

export default function BookNotebook() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user] = useState(() => JSON.parse(localStorage.getItem('edupulse_user') || '{}'));
  const [studentsList, setStudentsList] = useState([]);
  const [records, setRecords] = useState({});

  const { classId, subject, teacherName } = location.state || {};

  // Bugungi sanani aniqlash (YYYY-MM-DD)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Serverdan o'quvchilar va saqlangan natijalarni yuklab olish
  useEffect(() => {
    // 1. O'quvchilarni serverdan olish
    fetch('http://localhost:5000/api/students')
      .then(res => res.json())
      .then(data => setStudentsList(data))
      .catch(err => console.error("O'quvchilarni olishda xatolik:", err));

    // 2. Kitob-daftar yozuvlarini serverdan olish
    fetch('http://localhost:5000/api/book-records')
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(err => console.error("Yozuvlarni olishda xatolik:", err));
  }, []);

  // Joriy haftaning kunlari va sanalarini hisoblash (Dushanbadan Shanbagacha)
  const getWeekDates = () => {
    const current = new Date(today);
    const dayOfWeek = current.getDay(); // 0: Yakshanba, 1: Dushanba ...
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(current);
    monday.setDate(current.getDate() + distanceToMonday);

    const days = [
      { id: 'mon', name: 'Dushanba', offset: 0 },
      { id: 'tue', name: 'Seshanba', offset: 1 },
      { id: 'wed', name: 'Chorshanba', offset: 2 },
      { id: 'thu', name: 'Payshanba', offset: 3 },
      { id: 'fri', name: 'Juma', offset: 4 },
      { id: 'sat', name: 'Shanba', offset: 5 }
    ];

    return days.map(day => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + day.offset);
      const dateStr = d.toISOString().split('T')[0];
      const formattedDate = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
      
      return {
        ...day,
        dateStr,
        formattedDate,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isFuture: dateStr > todayStr
      };
    });
  };

  const weekDays = getWeekDates();
  const [selectedDay, setSelectedDay] = useState(() => weekDays.find(d => d.isToday) || weekDays[0]);

  const recordKey = `${classId}_${subject}_${selectedDay.dateStr}`;

  const [toastMsg, setToastMsg] = useState(null);
  const isAdmin = user?.role === 'administrator';

  const isLocked = !isAdmin && (selectedDay.isPast || selectedDay.isFuture || !!records[recordKey]?.locked);

  // Faqat shu sinf o'quvchilarini filtrlash
  const classStudents = studentsList.filter(s => 
    String(s.grade) === String(classId) || 
    String(s.class_id) === String(classId)
  );

  const [studentStates, setStudentStates] = useState([]);

  useEffect(() => {
    const savedForThisDay = records[recordKey]?.students;

    if (savedForThisDay && Array.isArray(savedForThisDay) && savedForThisDay.length > 0) {
      setStudentStates(savedForThisDay);
    } else {
      const freshStates = classStudents.map(s => ({
        id: s.student_id || s.id,
        fullName: s.full_name || s.name,
        booksReady: true,
        notebooksReady: true
      }));
      setStudentStates(freshStates);
    }
  }, [selectedDay.dateStr, recordKey, classId, studentsList, records]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggle = (studentId, field) => {
    if (isLocked) return;

    setStudentStates(prev =>
      prev.map(s => String(s.id) === String(studentId) ? { ...s, [field]: !s[field] } : s)
    );
  };

  // 💾 Natijani serverga (PostgreSQL bazasiga) saqlash
  const handleSaveDay = async () => {
    if (isLocked) return;

    const payloadData = {
      locked: true,
      students: studentStates,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const response = await fetch('http://localhost:5000/api/book-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record_key: recordKey, data: payloadData })
      });

      if (response.ok) {
        setRecords(prev => ({ ...prev, [recordKey]: payloadData }));
        showToast(`${selectedDay.name} kunlik natijalar bazaga saqlandi!`);
      } else {
        alert("Saqlashda xatolik yuz berdi!");
      }
    } catch (err) {
      console.error("Serverga ulanish xatosi:", err);
      alert("Server bilan aloqa yo'q!");
    }
  };

  if (!classId || !subject) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200/80 shadow-lg">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-black text-slate-800">Dars tanlanmagan!</h3>
        <p className="text-xs text-slate-500 font-medium">Iltimos, avval Dars Jadvali bo'limiga kirib o'z fangingizni tanlang.</p>
        <button onClick={() => navigate('/timetable')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition">
          Dars Jadvaliga Qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-8 max-w-7xl mx-auto space-y-6">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/timetable')} 
            className="text-xs font-bold text-blue-600 hover:underline mb-1 inline-flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dars Jadvaliga qaytish</span>
          </button>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {classId} sinf — {subject}
            </h2>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            O'qituvchi: <strong className="text-slate-800">{teacherName}</strong>
          </p>
        </div>

        {!isLocked && selectedDay.isToday && (
          <button
            onClick={handleSaveDay}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95 self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>Kunlik Natijani Saqlash (DB)</span>
          </button>
        )}
      </div>

      {/* HAFTA KUNLARI PANELI */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-black text-slate-500 uppercase flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Haftalik Sana Va Kunlar:</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {weekDays.map((day) => {
            const isSelected = selectedDay.id === day.id;

            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day)}
                className={`p-3 rounded-2xl text-center transition relative border ${
                  isSelected 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                    : day.isPast || day.isFuture
                    ? 'bg-slate-50 text-slate-400 border-slate-200/60'
                    : 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <p className="text-xs font-extrabold">{day.name}</p>
                <p className={`text-[11px] font-bold mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                  {day.formattedDate}
                </p>

                {day.isToday && (
                  <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-blue-600'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Qulflanganlik haqida ogohlantirish */}
      {isLocked && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold">
          <Lock className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <span>
            {selectedDay.isPast 
              ? "Ushbu kun o'tib ketgani sababli faqat ko'rish rejimi."
              : selectedDay.isFuture
              ? "Ushbu kun kelgusi kun bo'lgani uchun hali natija kiritib bo'lmaydi."
              : "Bugungi kunlik natijalar saqlangan va qulflangan."}
          </span>
        </div>
      )}

      {/* O'quvchilar Ro'yxati */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm">
            {selectedDay.name} ({selectedDay.formattedDate}) — O'quvchilar Tayyorgarligi
          </h3>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
            Jami: {studentStates.length} nafar
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {studentStates.length > 0 ? (
            studentStates.map((student) => (
              <div key={student.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{student.fullName}</h4>
                  <p className="text-[10px] text-slate-400">ID: {student.id}</p>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <button
                    disabled={isLocked}
                    onClick={() => handleToggle(student.id, 'booksReady')}
                    className={`px-3 py-2 rounded-xl font-bold text-[11px] transition ${
                      student.booksReady 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    } ${isLocked ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                  >
                    Kitob: {student.booksReady ? 'Bor' : "Yo'q"}
                  </button>

                  <button
                    disabled={isLocked}
                    onClick={() => handleToggle(student.id, 'notebooksReady')}
                    className={`px-3 py-2 rounded-xl font-bold text-[11px] transition ${
                      student.notebooksReady 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    } ${isLocked ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                  >
                    Daftar: {student.notebooksReady ? 'Bor' : "Yo'q"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-xs text-slate-400 font-bold">
              Ushbu sinfda o'quvchilar topilmadi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}