import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookMarked, Calendar, BookOpen, ChevronRight, User, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { db } from '../firebase'; // Firebase sozlama faylingiz manzili
import { collection, getDocs } from 'firebase/firestore';

export default function MyClass() {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('edupulse_user') || '{}'));
  
  const [classesList, setClassesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [timetable, setTimetable] = useState([]);

  // Firebase'dan ma'lumotlarni yuklab olish
  useEffect(() => {
    loadDataFromFirebase();
  }, []);

  const loadDataFromFirebase = async () => {
    try {
      // 1. Sinflarni yuklash
      const classesSnap = await getDocs(collection(db, 'classes'));
      setClassesList(classesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 2. O'qituvchilarni yuklash
      const teachersSnap = await getDocs(collection(db, 'teachers'));
      setTeachersList(teachersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 3. Dars jadvalini yuklash
      const timetableSnap = await getDocs(collection(db, 'timetable'));
      setTimetable(timetableSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Firebase'dan ma'lumotlarni olishda xatolik:", err);
    }
  };

  const isAdmin = user?.role === 'administrator';

  // Sinf rahbariga biriktirilgan sinfni izlash
  const teacherObj = teachersList.find(t => 
    (t.full_name || t.fullName || t.name || '').toLowerCase().trim() === (user?.fullName || user?.username || '').toLowerCase().trim()
  );

  const assignedClass = classesList.find(c => {
    const assigned = teacherObj?.assigned_class || teacherObj?.assignedClass;
    const cId = c.id || c.class_id;
    if (assigned) {
      return cId === assigned;
    }
    const cTeacher = c.teacher || c.teacher_name || '';
    return cTeacher.toLowerCase().includes((user?.fullName || user?.username || '').toLowerCase());
  });

  // Admin uchun tanlangan sinf (boshida birinchi sinf tanlanadi)
  const [selectedAdminClassId, setSelectedAdminClassId] = useState('');

  // Ekranda ko'rsatiladigan sinf obyekti
  const activeClassObj = isAdmin 
    ? classesList.find(c => (c.id || c.class_id) === (selectedAdminClassId || classesList[0]?.id || classesList[0]?.class_id)) || classesList[0]
    : assignedClass || classesList[0];

  // Bugungi sana va hafta kunlarini hisoblash
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const getWeekDates = () => {
    const current = new Date(today);
    const dayOfWeek = current.getDay();
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
        isToday: dateStr === todayStr
      };
    });
  };

  const weekDays = getWeekDates();
  const [selectedDay, setSelectedDay] = useState(() => weekDays.find(d => d.isToday) || weekDays[0]);

  if (!isAdmin && !assignedClass && classesList.length > 0) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200/80 shadow-lg">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-black text-slate-800">Sizga sinf biriktirilmagan!</h3>
        <p className="text-xs text-slate-500 font-medium">Ushbu bo'lim faqat sinf rahbarlari va adminlar uchun mo'ljallangan.</p>
      </div>
    );
  }

  // Tanlangan kun va faol sinf uchun dars jadvali
  const activeClassId = activeClassObj?.id || activeClassObj?.class_id;
  const dayLessons = activeClassObj 
    ? timetable.filter(item => {
        const itemDay = item.day || item.day_of_week;
        const itemClassId = item.classId || item.class_id;
        return itemDay === selectedDay.id && String(itemClassId) === String(activeClassId);
      }).sort((a, b) => (a.lessonNumber || a.lesson_number || 0) - (b.lessonNumber || b.lesson_number || 0))
    : [];

  return (
    <div className="px-4 py-6 sm:px-8 max-w-7xl mx-auto space-y-6">
      {/* Sarlavha va Admin uchun sinf tanlash */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isAdmin ? "Sinflar Nazorati (Admin)" : `Mening Sinfim — ${activeClassObj?.name || activeClassId}`}
            </h2>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {isAdmin ? "Barcha sinflarning dars jadvali va kitob/daftar natijalari" : `Sinf rahbari: ${activeClassObj?.teacher || activeClassObj?.teacher_name || user?.fullName}`}
          </p>
        </div>

        {/* AGAR ADMIN BO'LSA - BARCHA SINFLARNI TANLASH SELECT'I */}
        {isAdmin && (
          <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-black text-slate-500 uppercase px-2">Sinfni tanlang:</span>
            <select
              value={selectedAdminClassId || activeClassId}
              onChange={(e) => setSelectedAdminClassId(e.target.value)}
              className="p-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold outline-none cursor-pointer"
            >
              {classesList.map(c => {
                const cId = c.id || c.class_id;
                return (
                  <option key={cId} value={cId}>{c.name || cId} ({c.shift || '1-smena'})</option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* HAFTA KUNLARI VA SANALARI */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-black text-slate-500 uppercase flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Hafta kunini tanlang:</span>
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

      {/* TANLANGAN KUNLIK DARS JADVALI (FANLAR) */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm">
            {activeClassObj?.name || activeClassId} — {selectedDay.name} ({selectedDay.formattedDate}) Darslari
          </h3>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
            Natijalarni ko'rish uchun fan ustiga bosing
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {dayLessons.length > 0 ? (
            dayLessons.map((lesson) => {
              const lNumber = lesson.lessonNumber || lesson.lesson_number;
              const tName = lesson.teacherName || lesson.teacher_name;
              const sTime = lesson.startTime || lesson.start_time;
              const eTime = lesson.endTime || lesson.end_time;

              return (
                <div
                  key={lesson.id || lesson.schedule_id}
                  onClick={() => navigate('/my-class/subject-status', {
                    state: {
                      classId: activeClassId,
                      className: activeClassObj?.name || activeClassId,
                      subject: lesson.subject,
                      teacherName: tName,
                      dateStr: selectedDay.dateStr,
                      dayName: selectedDay.name,
                      formattedDate: selectedDay.formattedDate
                    }
                  })}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-blue-50/50 cursor-pointer transition group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition flex items-center justify-center font-black text-xs flex-shrink-0">
                      {lNumber}-dars
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>{lesson.subject}</span>
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center space-x-1 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Fan o'qituvchisi: <strong className="text-slate-800 font-bold">{tName}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sTime} - {eTime}</span>
                    </div>

                    <div className="flex items-center space-x-1 text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                      <span>Natijalar</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-xs text-slate-400 font-bold">
              Ushbu sinfga ushbu kunga dars jadvali kiritilmagan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}