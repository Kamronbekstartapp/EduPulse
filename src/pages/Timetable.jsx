import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  BookOpen, 
  User, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ChevronRight,
  Pencil
} from 'lucide-react';
import { db } from '../firebase'; // Firebase sozlama faylingiz manzili
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const DAYS = [
  { id: 'mon', name: 'Dushanba' },
  { id: 'tue', name: 'Seshanba' },
  { id: 'wed', name: 'Chorshanba' },
  { id: 'thu', name: 'Payshanba' },
  { id: 'fri', name: 'Juma' },
  { id: 'sat', name: 'Shanba' }
];

// Fanlar uchun rangli dizaynlar palitrasi
const getSubjectBadgeStyle = (subjectName) => {
  if (!subjectName) return 'bg-slate-100 text-slate-700 border-slate-200';
  const sub = subjectName.toLowerCase().trim();

  if (sub.includes('matematika') || sub.includes('algebra') || sub.includes('geometriya')) {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (sub.includes('fizika') || sub.includes('astronomiya')) {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (sub.includes('kimyo') || sub.includes('biologiya')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (sub.includes('tarix') || sub.includes('huquq') || sub.includes('geografiya')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (sub.includes('ingliz') || sub.includes('rus') || sub.includes('til') || sub.includes('adabiyot')) {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (sub.includes('jismoniy') || sub.includes('sport')) {
    return 'bg-teal-50 text-teal-700 border-teal-200';
  } else if (sub.includes('informatika') || sub.includes('texnologiya')) {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export default function Timetable() {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('edupulse_user') || '{}'));
  
  const [classesList, setClassesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [timetable, setTimetable] = useState([]);

  const [activeShift, setActiveShift] = useState(1); // 1 yoki 2
  const [activeDay, setActiveDay] = useState('mon');

  // Firestore'dan ma'lumotlarni yuklab olish
  useEffect(() => {
    loadDataFromFirebase();
  }, []);

  const loadDataFromFirebase = async () => {
    try {
      // 1. Sinflarni yuklash
      const classesSnap = await getDocs(collection(db, 'classes'));
      setClassesList(classesSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));

      // 2. O'qituvchilarni yuklash
      const teachersSnap = await getDocs(collection(db, 'teachers'));
      setTeachersList(teachersSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));

      // 3. Dars jadvalini yuklash
      const timetableSnap = await getDocs(collection(db, 'timetable'));
      setTimetable(timetableSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
    }
  };

  // Tanlangan smenaga mos sinflarni saralash
  const currentShiftClasses = classesList.filter(c => {
    const shiftStr = c.shift || '1-smena';
    return activeShift === 1 ? shiftStr.includes('1') : shiftStr.includes('2');
  });

  // Tanlangan sinf ID si
  const [selectedClassId, setSelectedClassId] = useState('');

  // ActiveShift yoki Sinflar ro'yxati o'zgarganda selectedClassId ni moslash
  useEffect(() => {
    if (currentShiftClasses.length > 0) {
      const existsInCurrentShift = currentShiftClasses.some(c => (c.id || c.class_id) === selectedClassId);
      if (!existsInCurrentShift) {
        setSelectedClassId(currentShiftClasses[0].id || currentShiftClasses[0].class_id);
      }
    } else {
      setSelectedClassId('');
    }
  }, [activeShift, classesList]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null); // Tahrirlanayotgan dars
  const [toastMsg, setToastMsg] = useState(null);

  const [formData, setFormData] = useState({
    lessonNumber: 1,
    subject: '',
    teacherName: '',
    startTime: '08:30',
    endTime: '09:15'
  });

  const isAdmin = user?.role === 'administrator';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleShiftChange = (shift) => {
    setActiveShift(shift);
    setFormData(prev => ({
      ...prev,
      startTime: shift === 1 ? '08:30' : '13:30',
      endTime: shift === 1 ? '09:15' : '14:15'
    }));
  };

  const handleTeacherSelect = (teacherFullName) => {
    if (!teacherFullName) {
      setFormData(prev => ({ ...prev, teacherName: '', subject: '' }));
      return;
    }

    const selectedTeacher = teachersList.find(t => {
      const tName = t.fullName || t.full_name || t.name;
      return tName === teacherFullName;
    });

    const teacherSub = selectedTeacher ? (selectedTeacher.subject || selectedTeacher.fan || '') : '';

    setFormData(prev => ({
      ...prev,
      teacherName: teacherFullName,
      subject: prev.subject || teacherSub
    }));
  };

  const handleEditTeacherSelect = (teacherFullName) => {
    if (!teacherFullName) {
      setEditingLesson(prev => ({ ...prev, teacherName: '', subject: '' }));
      return;
    }

    const selectedTeacher = teachersList.find(t => {
      const tName = t.fullName || t.full_name || t.name;
      return tName === teacherFullName;
    });

    const teacherSub = selectedTeacher ? (selectedTeacher.subject || selectedTeacher.fan || '') : '';

    setEditingLesson(prev => ({
      ...prev,
      teacherName: teacherFullName,
      subject: prev.subject || teacherSub
    }));
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!selectedClassId) {
      alert("Iltimos, dars qo'shish uchun sinfni tanlang!");
      return;
    }
    if (!formData.teacherName) {
      alert("Iltimos, o'qituvchini tanlang!");
      return;
    }
    if (!formData.subject) {
      alert("Iltimos, fanni kiriting!");
      return;
    }

    const lessonId = `TT-${Date.now()}`;
    const newLesson = {
      shift: activeShift,
      day: activeDay,
      classId: selectedClassId,
      lessonNumber: Number(formData.lessonNumber),
      subject: formData.subject,
      teacherName: formData.teacherName || 'Biriktirilmagan',
      startTime: formData.startTime,
      endTime: formData.endTime
    };

    try {
      await setDoc(doc(db, 'timetable', lessonId), newLesson);
      setTimetable(prev => [
        ...prev.filter(item => !(Number(item.shift || 1) === Number(activeShift) && item.day === activeDay && item.classId === selectedClassId && Number(item.lessonNumber) === Number(formData.lessonNumber))),
        { id: lessonId, ...newLesson }
      ]);

      setIsAddModalOpen(false);
      setFormData({ lessonNumber: 1, subject: '', teacherName: '', startTime: activeShift === 1 ? '08:30' : '13:30', endTime: activeShift === 1 ? '09:15' : '14:15' });
      showToast("Dars jadvaliga muvaffaqiyatli qo'shildi!");
    } catch (err) {
      console.error("Dars qo'shishda xatolik:", err);
      showToast("Xatolik yuz berdi!");
    }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    if (!isAdmin || !editingLesson) return;

    try {
      const lessonId = editingLesson.id;
      const payload = {
        shift: Number(editingLesson.shift || activeShift),
        day: editingLesson.day,
        classId: editingLesson.classId,
        lessonNumber: Number(editingLesson.lessonNumber),
        subject: editingLesson.subject,
        teacherName: editingLesson.teacherName,
        startTime: editingLesson.startTime,
        endTime: editingLesson.endTime
      };

      await setDoc(doc(db, 'timetable', lessonId), payload, { merge: true });
      setTimetable(prev => prev.map(item => item.id === lessonId ? { ...item, ...payload } : item));
      setEditingLesson(null);
      showToast("Dars ma'lumotlari yangilandi!");
    } catch (err) {
      console.error("Darsni yangilashda xatolik:", err);
      showToast("Xatolik yuz berdi!");
    }
  };

  const handleDeleteLesson = async (id, e) => {
    e.stopPropagation();
    if (!isAdmin) return;

    try {
      await deleteDoc(doc(db, 'timetable', id));
      setTimetable(prev => prev.filter(item => item.id !== id));
      showToast("Dars jadvaldan o'chirildi!");
    } catch (err) {
      console.error("Darsni o'chirishda xatolik:", err);
      showToast("O'chirishda xatolik yuz berdi!");
    }
  };

  const handleLessonClick = (lesson) => {
    const isMyLesson = isAdmin || lesson.teacherName?.toLowerCase().includes((user?.fullName || user?.username || '').toLowerCase());
    
    if (isMyLesson) {
      navigate('/book-notebook', { 
        state: { 
          classId: selectedClassId, 
          subject: lesson.subject,
          teacherName: lesson.teacherName
        } 
      });
    }
  };

  const currentDaySchedule = timetable
    .filter(item => Number(item.shift || 1) === Number(activeShift) && item.day === activeDay && String(item.classId) === String(selectedClassId))
    .sort((a, b) => Number(a.lessonNumber || a.lesson_number || 0) - Number(b.lessonNumber || b.lesson_number || 0));

  return (
    <div className="px-4 py-6 sm:px-8 max-w-7xl mx-auto space-y-6">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sarlavha va Smena Tanlash */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Haftalik Dars Jadvali</h2>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Kitob va daftarni tekshirish uchun o'z darsingiz ustiga bosing</p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => handleShiftChange(1)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              activeShift === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1-Smena
          </button>
          <button
            onClick={() => handleShiftChange(2)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              activeShift === 2 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2-Smena
          </button>
        </div>
      </div>

      {/* Sinf va Kunlarni Tanlash Paneli */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 custom-scrollbar w-full">
            <span className="text-xs font-black text-slate-500 uppercase flex-shrink-0">SINF:</span>
            {currentShiftClasses.length > 0 ? (
              currentShiftClasses.map(c => {
                const cId = c.id || c.class_id;
                return (
                  <button
                    key={cId}
                    onClick={() => setSelectedClassId(cId)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                      selectedClassId === cId ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.name || cId}
                  </button>
                );
              })
            ) : (
              <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl">
                Ushbu smenada hali sinflar yo'q
              </span>
            )}
          </div>

          {isAdmin && currentShiftClasses.length > 0 && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="hidden sm:inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-2xl text-xs font-bold transition shadow-lg shadow-blue-500/20 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Dars Qo'shish</span>
            </button>
          )}
        </div>

        {isAdmin && currentShiftClasses.length > 0 && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="sm:hidden w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Dars Qo'shish</span>
          </button>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 border-t border-slate-100 pt-3">
          {DAYS.map(day => (
            <button
              key={day.id}
              onClick={() => setActiveDay(day.id)}
              className={`py-2.5 rounded-xl text-xs font-bold transition text-center ${
                activeDay === day.id ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {day.name}
            </button>
          ))}
        </div>
      </div>

      {/* Darslar Jadvali */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm">
            {DAYS.find(d => d.id === activeDay)?.name} kunlik darslar
          </h3>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-xl ${activeShift === 1 ? 'text-blue-600 bg-blue-50' : 'text-indigo-600 bg-indigo-50'}`}>
            {activeShift}-Smena
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {currentDaySchedule.length > 0 ? (
            currentDaySchedule.map((lesson) => {
              const isMyLesson = isAdmin || lesson.teacherName?.toLowerCase().includes((user?.fullName || user?.username || '').toLowerCase());
              const badgeStyle = getSubjectBadgeStyle(lesson.subject);
              const lNumber = lesson.lessonNumber || lesson.lesson_number;
              const sTime = lesson.startTime || lesson.start_time;
              const eTime = lesson.endTime || lesson.end_time;

              return (
                <div 
                  key={lesson.id} 
                  onClick={() => isMyLesson && handleLessonClick(lesson)}
                  className={`p-4 flex items-center justify-between gap-4 transition ${
                    isMyLesson 
                      ? 'bg-blue-50/40 hover:bg-blue-100/60 cursor-pointer border-l-4 border-blue-600' 
                      : 'opacity-40 bg-slate-50 cursor-not-allowed select-none'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                      isMyLesson ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {lNumber}-dars
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-black border shadow-sm ${badgeStyle}`}>
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{lesson.subject}</span>
                        </span>

                        {isMyLesson && (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-md font-bold">
                            Sizning darsingiz
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 flex items-center space-x-1 font-medium pl-0.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>O'qituvchi: <strong className="text-slate-800 font-bold">{lesson.teacherName}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="text-right text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sTime} - {eTime}</span>
                    </div>

                    {isMyLesson ? (
                      <div className="flex items-center text-blue-600 font-bold text-xs bg-blue-100/60 px-3 py-1.5 rounded-xl hover:bg-blue-200 transition">
                        <span>Tekshirish</span>
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                      </div>
                    ) : (
                      <div className="p-2 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}

                    {isAdmin && (
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setEditingLesson(lesson)}
                          className="p-2 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl transition shadow-sm"
                          title="Tahrirlash"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteLesson(lesson.id, e)}
                          className="p-2 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-xl transition shadow-sm"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-xs text-slate-400 font-bold">Ushbu smena, sinf va kunga hali dars rejalashtirilmagan.</p>
            </div>
          )}
        </div>
      </div>

      {/* ADMIN UCHUN DARS QO'SHISH MODALI */}
      {isAdmin && isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900">Yangi Dars Qo'shish ({activeShift}-Smena)</h3>

            <form onSubmit={handleAddLesson} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dars Soati</label>
                  <select
                    value={formData.lessonNumber}
                    onChange={(e) => setFormData({ ...formData, lessonNumber: e.target.value })}
                    className="w-full p-3 border rounded-xl font-bold bg-white outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(num => (
                      <option key={num} value={num}>{num}-dars</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fanni Kiriting/Tanlang</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Matematika"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biriktirilgan O'qituvchi</label>
                <select
                  required
                  value={formData.teacherName}
                  onChange={(e) => handleTeacherSelect(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-white text-slate-900 font-extrabold outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {teachersList.length === 0 ? (
                    <option value="" disabled>Saytda hali fan o'qituvchisi yo'q</option>
                  ) : (
                    <>
                      <option value="">-- O'qituvchini tanlang --</option>
                      {teachersList.map((t) => {
                        const name = t.fullName || t.full_name || t.name;
                        const sub = t.subject || t.fan ? `(${t.subject || t.fan})` : '(Fan ko\'rsatilmagan)';
                        return (
                          <option key={t.id || name} value={name}>
                            {name} {sub}
                          </option>
                        );
                      })}
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Boshlanish Vaqti</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full p-3 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tugash Vaqti</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full p-3 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={teachersList.length === 0}
                className={`w-full font-bold py-3 rounded-xl shadow-md transition active:scale-95 text-white ${
                  teachersList.length === 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Darsni Saqlash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN UCHUN DARSNI TAHRIRLASH MODALI */}
      {isAdmin && editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setEditingLesson(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900">Dars Ma'lumotlarini Tahrirlash</h3>

            <form onSubmit={handleUpdateLesson} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dars Soati</label>
                  <select
                    value={editingLesson.lessonNumber}
                    onChange={(e) => setEditingLesson({ ...editingLesson, lessonNumber: Number(e.target.value) })}
                    className="w-full p-3 border rounded-xl font-bold bg-white outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(num => (
                      <option key={num} value={num}>{num}-dars</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fanni O'zgartirish</label>
                  <input
                    type="text"
                    required
                    value={editingLesson.subject}
                    onChange={(e) => setEditingLesson({ ...editingLesson, subject: e.target.value })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biriktirilgan O'qituvchi</label>
                <select
                  required
                  value={editingLesson.teacherName}
                  onChange={(e) => handleEditTeacherSelect(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-white text-slate-900 font-extrabold outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">-- O'qituvchini tanlang --</option>
                  {teachersList.map((t) => {
                    const name = t.fullName || t.full_name || t.name;
                    const sub = t.subject || t.fan ? `(${t.subject || t.fan})` : '(Fan ko\'rsatilmagan)';
                    return (
                      <option key={t.id || name} value={name}>
                        {name} {sub}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Boshlanish Vaqti</label>
                  <input
                    type="time"
                    required
                    value={editingLesson.startTime}
                    onChange={(e) => setEditingLesson({ ...editingLesson, startTime: e.target.value })}
                    className="w-full p-3 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tugash Vaqti</label>
                  <input
                    type="time"
                    required
                    value={editingLesson.endTime}
                    onChange={(e) => setEditingLesson({ ...editingLesson, endTime: e.target.value })}
                    className="w-full p-3 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition active:scale-95"
              >
                O'zgarishlarni Saqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}