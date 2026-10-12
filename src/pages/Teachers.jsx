import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Phone, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Trash2
} from 'lucide-react';

const formatPhoneNumber = (value) => {
  if (!value) return '+998 ';
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('998')) digits = digits.slice(3);
  digits = digits.slice(0, 9);
  let result = '+998 ';
  if (digits.length > 0) result += digits.slice(0, 2);
  if (digits.length >= 3) result += ' ' + digits.slice(2, 5);
  if (digits.length >= 6) result += ' ' + digits.slice(5, 7);
  if (digits.length >= 8) result += ' ' + digits.slice(7, 9);
  return result;
};

const defaultTeachers = [
  { id: 'TCH-1', fullName: 'Azizov Murod', phone: '+998 90 111 22 33', teacherType: 'both', assignedClass: '9-A', subject: 'Matematika' },
  { id: 'TCH-2', fullName: 'Karimova Zilola', phone: '+998 91 222 33 44', teacherType: 'class_head', assignedClass: '9-B', subject: '' },
  { id: 'TCH-3', fullName: 'Tursunov Dilshod', phone: '+998 93 333 44 55', teacherType: 'subject_teacher', assignedClass: '', subject: 'Fizika' }
];

export default function Teachers() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('edupulse_user') || '{}'));

  const [teachersList, setTeachersList] = useState(() => {
    const saved = localStorage.getItem('edupulse_teachers');
    return saved ? JSON.parse(saved) : defaultTeachers;
  });

  const [classesList] = useState(() => {
    const saved = localStorage.getItem('edupulse_classes');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [classError, setClassError] = useState('');

  const [newTeacher, setNewTeacher] = useState({
    fullName: '',
    phone: '+998 ',
    teacherType: 'class_head',
    assignedClass: '',
    subject: ''
  });

  useEffect(() => {
    localStorage.setItem('edupulse_teachers', JSON.stringify(teachersList));
  }, [teachersList]);

  // Faqat Admin ekanligini tekshirish
  const isAdmin = user?.role === 'administrator';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddTeacher = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setClassError('');

    const needsClass = newTeacher.teacherType === 'class_head' || newTeacher.teacherType === 'both';
    const needsSubject = newTeacher.teacherType === 'subject_teacher' || newTeacher.teacherType === 'both';

    if (needsClass && !newTeacher.assignedClass) {
      setClassError("Iltimos, biriktiriladigan sinfni tanlang!");
      return;
    }

    if (needsSubject && !newTeacher.subject.trim()) {
      setClassError("Iltimos, o'qitiladigan fanni yozing!");
      return;
    }

    if (needsClass) {
      const existing = teachersList.find(t => t.assignedClass === newTeacher.assignedClass);
      if (existing) {
        setClassError(`Ushbu ${newTeacher.assignedClass} sinfi allaqachon band! (${existing.fullName} rahbar)`);
        return;
      }
    }

    const teacherObj = {
      id: `TCH-${Date.now().toString().slice(-4)}`,
      fullName: newTeacher.fullName,
      phone: newTeacher.phone.length > 5 ? newTeacher.phone : 'Kiritilmagan',
      teacherType: newTeacher.teacherType,
      assignedClass: needsClass ? newTeacher.assignedClass : '',
      subject: needsSubject ? newTeacher.subject : ''
    };

    setTeachersList(prev => [...prev, teacherObj]);

    if (needsClass) {
      const savedClasses = JSON.parse(localStorage.getItem('edupulse_classes') || '[]');
      const updatedClasses = savedClasses.map(c => 
        c.id === newTeacher.assignedClass 
          ? { ...c, teacher: newTeacher.fullName, teacherPhone: newTeacher.phone }
          : c
      );
      localStorage.setItem('edupulse_classes', JSON.stringify(updatedClasses));
    }

    setNewTeacher({ fullName: '', phone: '+998 ', teacherType: 'class_head', assignedClass: '', subject: '' });
    setIsAddOpen(false);
    showToast("Yangi o'qituvchi muvaffaqiyatli qo'shildi!");
  };

  const handleDeleteTeacher = (id) => {
    if (!isAdmin) return;
    setTeachersList(prev => prev.filter(t => t.id !== id));
    showToast("O'qituvchi ro'yxatdan o'chirildi!");
  };

  return (
    <div className="px-4 sm:px-8 max-w-7xl mx-auto space-y-6 py-4">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            O'qituvchilar Boshqaruvi
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            O'qituvchilar ro'yxati, sinf va fan biriktirmalari
          </p>
        </div>

        {/* FAQAT ADMIN UCHUN "O'QITUVCHI QO'SHISH" TUGMASI */}
        {isAdmin && (
          <button
            onClick={() => { setIsAddOpen(true); setClassError(''); }}
            className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>O'qituvchi Qo'shish</span>
          </button>
        )}
      </div>

      {/* O'qituvchilar Ro'yxati (Barchada ko'rinadi) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachersList.map((tch) => (
          <div key={tch.id} className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-3 relative group">
            <div className="flex justify-between items-start pr-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                  {tch.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{tch.fullName}</h3>
                  <p className="text-[10px] text-slate-400 font-medium">{tch.id}</p>
                </div>
              </div>
            </div>

            {/* FAQAT ADMIN UCHUN "O'CHIRISH" TUGMASI */}
            {isAdmin && (
              <button
                onClick={() => handleDeleteTeacher(tch.id)}
                className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition"
                title="O'chirish"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <div className="text-xs space-y-1.5 text-slate-600 pt-2 border-t border-slate-100">
              <p className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span>Tel: <strong>{tch.phone}</strong></span>
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {(tch.teacherType === 'class_head' || tch.teacherType === 'both') && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    Sinf rahbari: {tch.assignedClass || 'Biriktirilmagan'}
                  </span>
                )}
                {(tch.teacherType === 'subject_teacher' || tch.teacherType === 'both') && (
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    Fan: {tch.subject || 'Biriktirilmagan'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQAT ADMIN UCHUN QO'SHISH MODALI */}
      {isAdmin && isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setIsAddOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-900">Yangi O'qituvchi Qo'shish</h3>

            {classError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center space-x-2 font-semibold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{classError}</span>
              </div>
            )}

            <form onSubmit={handleAddTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ismi va Familiyasi</label>
                <input 
                  type="text" 
                  required
                  placeholder="Masalan: Karimova Zilola"
                  value={newTeacher.fullName}
                  onChange={(e) => setNewTeacher({ ...newTeacher, fullName: e.target.value })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefon Raqami</label>
                <input 
                  type="text" 
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher({ ...newTeacher, phone: formatPhoneNumber(e.target.value) })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">O'qituvchi Maqomi</label>
                <select 
                  value={newTeacher.teacherType}
                  onChange={(e) => {
                    setNewTeacher({ ...newTeacher, teacherType: e.target.value });
                    setClassError('');
                  }}
                  className="w-full p-3 border rounded-xl outline-none font-bold text-slate-700"
                >
                  <option value="class_head">Sinf rahbari</option>
                  <option value="subject_teacher">Fan o'qituvchisi</option>
                  <option value="both">Ikkalasi ham</option>
                </select>
              </div>

              {(newTeacher.teacherType === 'class_head' || newTeacher.teacherType === 'both') && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Biriktiriladigan Sinf</label>
                  <select 
                    value={newTeacher.assignedClass}
                    onChange={(e) => {
                      setNewTeacher({ ...newTeacher, assignedClass: e.target.value });
                      setClassError('');
                    }}
                    className="w-full p-3 border rounded-xl outline-none font-bold text-slate-700"
                  >
                    <option value="">Sinfni tanlang...</option>
                    {classesList.map(c => {
                      const isTaken = teachersList.some(t => t.assignedClass === c.id);
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name} {isTaken ? '(Banda)' : '(Bosh)'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {(newTeacher.teacherType === 'subject_teacher' || newTeacher.teacherType === 'both') && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dars Beradigan Fani</label>
                  <input 
                    type="text" 
                    placeholder="Masalan: Matematika, Fizika"
                    value={newTeacher.subject}
                    onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition">
                O'qituvchini Saqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}