import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  PhoneCall, 
  UserCheck, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  X, 
  CheckCircle2,
  Users
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

export default function ClassDetail() {
  const { classId } = useParams(); // URL dagi sinf ID si (masalan: 9-A)
  const navigate = useNavigate();

  const [classesList] = useState(() => {
    const saved = localStorage.getItem('edupulse_classes');
    return saved ? JSON.parse(saved) : [];
  });

  const [studentsList, setStudentsList] = useState(() => {
    const saved = localStorage.getItem('edupulse_students');
    return saved ? JSON.parse(saved) : [];
  });

  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudentId, setDeletingStudentId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Ma'lumotlar o'zgarganda localStorage ga saqlash
  useEffect(() => {
    localStorage.setItem('edupulse_students', JSON.stringify(studentsList));
  }, [studentsList]);

  const currentClass = classesList.find(c => c.id === classId);
  const classStudents = studentsList.filter(s => s.grade === classId);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUpdateStudent = (e) => {
    e.preventDefault();
    setStudentsList(prev => prev.map(s => s.id === editingStudent.id ? editingStudent : s));
    setEditingStudent(null);
    showToast("O'quvchi ma'lumotlari yangilandi!");
  };

  const handleDeleteStudent = () => {
    setStudentsList(prev => prev.filter(s => s.id !== deletingStudentId));
    setDeletingStudentId(null);
    showToast("O'quvchi o'chirildi!");
  };

  if (!currentClass) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Sinf topilmadi!</h2>
        <button onClick={() => navigate('/students-management')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
          Boshqaruvga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 max-w-7xl mx-auto space-y-6 py-6">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Orqaga qaytish */}
      <button
        onClick={() => navigate('/students-management')}
        className="inline-flex items-center space-x-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>O'quvchilar Boshqaruviga qaytish</span>
      </button>

      {/* Sinf Ma'lumotlari Header */}
<div>
  <div className="flex items-center space-x-3">
    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
      {currentClass.name}
    </h2>
    <span className="bg-blue-100 text-blue-700 font-extrabold text-xs px-3 py-1 rounded-full">
      {classStudents.length} ta o'quvchi
    </span>
  </div>
  <p className="text-slate-500 text-xs sm:text-sm mt-1">
    Sinf rahbari: <strong className="text-slate-800">{currentClass.teacher}</strong> ({currentClass.teacherPhone})
  </p>
</div>

      {/* O'quvchilar Grid */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <h3 className="text-base font-extrabold text-slate-800">O'quvchilar Ro'yxati</h3>
        </div>

        {classStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classStudents.map((student) => (
              <div key={student.id} className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl space-y-3 relative group">
                <div className="flex justify-between items-start pr-16">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{student.fullName}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{student.id}</p>
                  </div>
                </div>

                <div className="absolute top-3 right-3 flex items-center space-x-1">
                  <button
                    onClick={() => setEditingStudent(student)}
                    className="p-2 bg-white text-slate-600 hover:text-blue-600 rounded-xl border border-slate-200 shadow-sm transition active:scale-95"
                    title="Tahrirlash"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingStudentId(student.id)}
                    className="p-2 bg-white text-slate-600 hover:text-rose-600 rounded-xl border border-slate-200 shadow-sm transition active:scale-95"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs space-y-1 text-slate-600 pt-1 border-t border-slate-200/50">
                  <p className="flex items-center space-x-2">
                    <PhoneCall className="w-3.5 h-3.5 text-blue-500" />
                    <span>O'quvchi: <strong>{student.studentPhone}</strong></span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Ota-onasi: <strong>{student.parentName} ({student.parentPhone})</strong></span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-12">Ushbu sinfda hozircha o'quvchilar mavjud emas.</p>
        )}
      </div>

      {/* Tahrirlash Modali */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setEditingStudent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-900">O'quvchi Ma'lumotlarini Tahrirlash</h3>

            <form onSubmit={handleUpdateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ism va Familiya</label>
                <input 
                  type="text" 
                  required
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">O'quvchi Telefoni</label>
                <input 
                  type="text" 
                  value={editingStudent.studentPhone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, studentPhone: formatPhoneNumber(e.target.value) })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ota-onasi Ismi</label>
                  <input 
                    type="text" 
                    value={editingStudent.parentName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ota-onasi Telefoni</label>
                  <input 
                    type="text" 
                    value={editingStudent.parentPhone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: formatPhoneNumber(e.target.value) })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition">
                O'zgarishlarni Saqlash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* O'chirish Tasdiqlash Modali */}
      {deletingStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">O'quvchini o'chirasizmi?</h3>
              <p className="text-xs text-slate-500 mt-1">Ushbu harakatni ortga qaytarib bo'lmaydi.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setDeletingStudentId(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition">
                Bekor qilish
              </button>
              <button onClick={handleDeleteStudent} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md shadow-rose-500/20">
                Ha, O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}