import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Plus, Trash2, BookOpen, User, Lock, CheckCircle2, Sparkles, X, ChevronRight } from 'lucide-react';

const DAYS = [
  { id: 'mon', name: 'Dushanba' },
  { id: 'tue', name: 'Seshanba' },
  { id: 'wed', name: 'Chorshanba' },
  { id: 'thu', name: 'Payshanba' },
  { id: 'fri', name: 'Juma' },
  { id: 'sat', name: 'Shanba' }
];

export default function Timetable() {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('edupulse_user') || '{}'));
  const [classesList] = useState(() => JSON.parse(localStorage.getItem('edupulse_classes') || '[]'));
  const [teachersList] = useState(() => JSON.parse(localStorage.getItem('edupulse_teachers') || '[]'));

  const [activeShift, setActiveShift] = useState(1); // 1 yoki 2
  const [activeDay, setActiveDay] = useState('mon');
  const [timetable, setTimetable] = useState(() => JSON.parse(localStorage.getItem('edupulse_timetable') || '[]'));

  // Tanlangan smenaga mos sinflarni saralash (Sinflar bo'limidan kelayotgan shift qiymati bo'yicha)
  const currentShiftClasses = classesList.filter(c => {
    const shiftStr = c.shift || '1-smena';
    return activeShift === 1 ? shiftStr.includes('1') : shiftStr.includes('2');
  });

  // Tanlangan sinf ID si
  const [selectedClassId, setSelectedClassId] = useState('');

  // ActiveShift yoki Sinflar ro'yxati o'zgarganda selectedClassId ni moslash
  useEffect(() => {
    if (currentShiftClasses.length > 0) {
      const existsInCurrentShift = currentShiftClasses.some(c => c.id === selectedClassId);
      if (!existsInCurrentShift) {
        setSelectedClassId(currentShiftClasses[0].id);
      }
    } else {
      setSelectedClassId('');
    }
  }, [activeShift, classesList]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const [formData, setFormData] = useState({
    lessonNumber: 1,
    subject: '',
    teacherName: '',
    startTime: '08:30',
    endTime: '09:15'
  });

  const isAdmin = user?.role === 'administrator';

  useEffect(() => {
    localStorage.setItem('edupulse_timetable', JSON.stringify(timetable));
  }, [timetable]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Smena o'zgarganda vaqt andozalarini o'zgartirish
  const handleShiftChange = (shift) => {
    setActiveShift(shift);
    setFormData(prev => ({
      ...prev,
      startTime: shift === 1 ? '08:30' : '13:30',
      endTime: shift === 1 ? '09:15' : '14:15'
    }));
  };

  // Fan tanlanganda avtomatik o'qituvchini tayinlash
  const handleSubjectChange = (subjectName) => {
    if (!subjectName) {
      setFormData(prev => ({ ...prev, subject: '', teacherName: '' }));
      return;
    }

    const foundTeacher = teachersList.find(t => {
      const teacherSubject = (t.subject || t.fan || '').toLowerCase().trim();
      const selectedSub = subjectName.toLowerCase().trim();
      return teacherSubject === selectedSub || teacherSubject.includes(selectedSub);
    });

    const teacherFullName = foundTeacher 
      ? (foundTeacher.full_name || foundTeacher.fullName || foundTeacher.name)
      : 'O\'qituvchi biriktirilmagan';

    setFormData(prev => ({
      ...prev,
      subject: subjectName,
      teacherName: teacherFullName
    }));
  };

  const handleAddLesson = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!selectedClassId) {
      alert("Iltimos, dars qo'shish uchun sinfni tanlang!");
      return;
    }
    if (!formData.subject) {
      alert("Iltimos, fanni tanlang!");
      return;
    }

    const newLesson = {
      id: `TT-${Date.now()}`,
      shift: activeShift,
      day: activeDay,
      classId: selectedClassId,
      lessonNumber: Number(formData.lessonNumber),
      subject: formData.subject,
      teacherName: formData.teacherName || 'Biriktirilmagan',
      startTime: formData.startTime,
      endTime: formData.endTime
    };

    setTimetable(prev => [
      ...prev.filter(item => !(item.shift === activeShift && item.day === activeDay && item.classId === selectedClassId && Number(item.lessonNumber) === Number(formData.lessonNumber))),
      newLesson
    ]);

    setIsAddModalOpen(false);
    setFormData({ lessonNumber: 1, subject: '', teacherName: '', startTime: activeShift === 1 ? '08:30' : '13:30', endTime: activeShift === 1 ? '09:15' : '14:15' });
    showToast("Dars jadvaliga muvaffaqiyatli qo'shildi!");
  };

  const handleDeleteLesson = (id, e) => {
    e.stopPropagation(); // Dars kartasini bosish hodisasini to'xtatadi
    if (!isAdmin) return;
    setTimetable(prev => prev.filter(item => item.id !== id));
    showToast("Dars jadvaldan o'chirildi!");
  };

  // Faol darsni bosganda Kitob/Daftar tekshirish sahifasiga yo'naltirish
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

  // Joriy smena, kun va sinf bo'yicha filtr
  const currentDaySchedule = timetable
    .filter(item => Number(item.shift || 1) === Number(activeShift) && item.day === activeDay && item.classId === selectedClassId)
    .sort((a, b) => a.lessonNumber - b.lessonNumber);

  const availableSubjects = Array.from(new Set(teachersList.map(t => t.subject || t.fan).filter(Boolean)));

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

        {/* Smena Almashtirish Tugmalari */}
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
              currentShiftClasses.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClassId(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                    selectedClassId === c.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))
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

        {/* Mobil uchun Dars qo'shish tugmasi */}
        {isAdmin && currentShiftClasses.length > 0 && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="sm:hidden w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Dars Qo'shish</span>
          </button>
        )}

        {/* Haftaning Kunlarini Tanlash */}
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
              // Kirgan foydalanuvchining o'qituvchi ekanligini tekshirish
              const isMyLesson = isAdmin || lesson.teacherName?.toLowerCase().includes((user?.fullName || user?.username || '').toLowerCase());

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
                      {lesson.lessonNumber}-dars
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                        <BookOpen className={`w-4 h-4 ${isMyLesson ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{lesson.subject}</span>
                        {isMyLesson && (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-md font-bold">
                            Sizning darsingiz
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center space-x-1 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>O'qituvchi: <strong className="text-slate-800 font-bold">{lesson.teacherName}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lesson.startTime} - {lesson.endTime}</span>
                    </div>

                    {/* Faol tugma yoki Qulf belgisi */}
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

                    {/* Admin uchun O'chirish tugmasi */}
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteLesson(lesson.id, e)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                  <label className="block font-bold text-slate-700 mb-1">Fanni Tanlang</label>
                  {availableSubjects.length > 0 ? (
                    <select
                      value={formData.subject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      className="w-full p-3 border rounded-xl font-bold bg-white outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">-- Fan tanlang --</option>
                      {availableSubjects.map((sub, idx) => (
                        <option key={idx} value={sub}>{sub}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Matematika"
                      value={formData.subject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biriktirilgan O'qituvchi</label>
                <input
                  type="text"
                  readOnly
                  placeholder="Fan tanlansa avtomatik chiqadi"
                  value={formData.teacherName}
                  className="w-full p-3 border rounded-xl bg-slate-100 text-blue-700 font-extrabold outline-none cursor-not-allowed"
                />
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition active:scale-95"
              >
                Darsni Saqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}