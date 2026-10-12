import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  FolderPlus, 
  ChevronRight, 
  X, 
  CheckCircle2,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';

const formatPhoneNumber = (value) => {
  if (!value) return '+998 ';
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  }
  digits = digits.slice(0, 9);
  let result = '+998 ';
  if (digits.length > 0) result += digits.slice(0, 2);
  if (digits.length >= 3) result += ' ' + digits.slice(2, 5);
  if (digits.length >= 6) result += ' ' + digits.slice(5, 7);
  if (digits.length >= 8) result += ' ' + digits.slice(7, 9);
  return result;
};

const defaultClasses = [
  { id: '9-A', name: '9-A sinf', teacher: 'Azizov Murod', teacherPhone: '+998 90 111 22 33' },
  { id: '9-B', name: '9-B sinf', teacher: 'Karimova Zilola', teacherPhone: '+998 91 222 33 44' },
  { id: '10-A', name: '10-A sinf', teacher: 'Tursunov Dilshod', teacherPhone: '+998 93 333 44 55' },
];

const defaultStudents = [
  {
    id: 'STU-01',
    fullName: 'Aliyev Samar Botirovich',
    grade: '9-A',
    studentPhone: '+998 90 888 77 66',
    parentName: 'Aliyev Botir',
    parentPhone: '+998 90 123 45 67'
  },
  {
    id: 'STU-02',
    fullName: 'Karimova Zilola Rustamovna',
    grade: '9-A',
    studentPhone: '+998 91 777 66 55',
    parentName: 'Karimova Umida',
    parentPhone: '+998 91 234 56 78'
  }
];

export default function StudentsManagement() {
  const navigate = useNavigate();

  const [classesList, setClassesList] = useState(() => {
    const saved = localStorage.getItem('edupulse_classes');
    return saved ? JSON.parse(saved) : defaultClasses;
  });

  const [studentsList, setStudentsList] = useState(() => {
    const saved = localStorage.getItem('edupulse_students');
    return saved ? JSON.parse(saved) : defaultStudents;
  });

  useEffect(() => {
    localStorage.setItem('edupulse_classes', JSON.stringify(classesList));
  }, [classesList]);

  useEffect(() => {
    localStorage.setItem('edupulse_students', JSON.stringify(studentsList));
  }, [studentsList]);

  // Modal oynalar holati
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null); // Tahrirlanayotgan sinf
  const [deletingClassId, setDeletingClassId] = useState(null); // O'chirilayotgan sinf ID si
  const [toastMsg, setToastMsg] = useState(null);

  const [newStudent, setNewStudent] = useState({
    fullName: '',
    studentPhone: '+998 ',
    parentName: '',
    parentPhone: '+998 ',
    grade: classesList[0]?.id || ''
  });

  const [newClass, setNewClass] = useState({
    gradeNumber: '',
    gradeLetter: '',
    teacherName: '',
    teacherPhone: '+998 '
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.fullName || !newStudent.grade) return;

    const studentObj = {
      id: `STU-${Date.now().toString().slice(-4)}`,
      fullName: newStudent.fullName,
      grade: newStudent.grade,
      studentPhone: newStudent.studentPhone.length > 5 ? newStudent.studentPhone : 'Kiritilmagan',
      parentName: newStudent.parentName || 'Ota-onasi',
      parentPhone: newStudent.parentPhone.length > 5 ? newStudent.parentPhone : 'Kiritilmagan'
    };

    setStudentsList(prev => [...prev, studentObj]);
    setNewStudent({ fullName: '', studentPhone: '+998 ', parentName: '', parentPhone: '+998 ', grade: classesList[0]?.id || '' });
    setIsAddStudentOpen(false);
    showToast("Yangi o'quvchi muvaffaqiyatli qo'shildi!");
  };

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClass.gradeNumber || !newClass.gradeLetter) return;

    const classId = `${newClass.gradeNumber}-${newClass.gradeLetter.toUpperCase()}`;
    const classObj = {
      id: classId,
      name: `${classId} sinf`,
      teacher: newClass.teacherName || 'Tayinlanmagan',
      teacherPhone: newClass.teacherPhone.length > 5 ? newClass.teacherPhone : 'Kiritilmagan'
    };

    setClassesList(prev => [...prev, classObj]);
    setNewClass({ gradeNumber: '', gradeLetter: '', teacherName: '', teacherPhone: '+998 ' });
    setIsAddClassOpen(false);
    showToast("Yangi sinf muvaffaqiyatli qo'shildi!");
  };

  // Sinfni Tahrirlash (Edit)
  const handleUpdateClass = (e) => {
    e.preventDefault();
    setClassesList(prev => prev.map(c => c.id === editingClass.id ? editingClass : c));
    setEditingClass(null);
    showToast("Sinf ma'lumotlari yangilandi!");
  };

  // Sinfni O'chirish (Delete)
  const handleDeleteClass = () => {
    // Sinfni o'chiramiz
    setClassesList(prev => prev.filter(c => c.id !== deletingClassId));
    // Shu sinfdagi o'quvchilarni ham tozalab yuboramiz
    setStudentsList(prev => prev.filter(s => s.grade !== deletingClassId));
    setDeletingClassId(null);
    showToast("Sinf va uning o'quvchilari o'chirildi!");
  };

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
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            O'quvchilar Boshqaruvi
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Sinflar ro'yxati va ularni boshqarish
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddClassOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shadow-sm active:scale-95"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Sinf Qo'shish</span>
          </button>

          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>O'quvchi Qo'shish</span>
          </button>
        </div>
      </div>

      {/* Sinflar Kartochkalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classesList.map((cls) => {
          const count = studentsList.filter(s => s.grade === cls.id).length;
          return (
            <div 
              key={cls.id}
              className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition space-y-3 relative group"
            >
              {/* Kartochkani bosganda o'sha sinf sahifasiga o'tadi */}
              <div 
                onClick={() => navigate(`/students-management/${cls.id}`)}
                className="cursor-pointer space-y-3"
              >
                <div className="flex justify-between items-center pr-16">
                  <span className="bg-blue-50 text-blue-700 font-black text-sm px-3 py-1 rounded-xl">
                    {cls.name}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>O'quvchilar: <strong className="text-slate-900">{count} ta</strong></p>
                  <p>Sinf rahbari: <strong className="text-slate-900">{cls.teacher}</strong></p>
                  <p className="text-slate-400 text-[11px]">{cls.teacherPhone}</p>
                </div>
              </div>

              {/* Sinfni Tahrirlash va O'chirish Tugmalari */}
              <div className="absolute top-4 right-4 flex items-center space-x-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingClass(cls); }}
                  className="p-2 bg-slate-50 text-slate-600 hover:text-blue-600 rounded-xl border border-slate-200 shadow-sm transition active:scale-95"
                  title="Sinfni tahrirlash"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeletingClassId(cls.id); }}
                  className="p-2 bg-slate-50 text-slate-600 hover:text-rose-600 rounded-xl border border-slate-200 shadow-sm transition active:scale-95"
                  title="Sinfni o'chirish"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* O'quvchi Qo'shish Modali */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setIsAddStudentOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-900">Yangi O'quvchi Qo'shish</h3>

            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ism va Familiya</label>
                <input 
                  type="text" 
                  required
                  placeholder="Masalan: Aliyev Samar Botirovich"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">O'quvchi Telefoni</label>
                <input 
                  type="text" 
                  value={newStudent.studentPhone}
                  onChange={(e) => setNewStudent({ ...newStudent, studentPhone: formatPhoneNumber(e.target.value) })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ota-onasi Ismi</label>
                  <input 
                    type="text" 
                    placeholder="Aliyev Botir"
                    value={newStudent.parentName}
                    onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ota-onasi Telefoni</label>
                  <input 
                    type="text" 
                    value={newStudent.parentPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, parentPhone: formatPhoneNumber(e.target.value) })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sinfni Tanlang</label>
                <select 
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  className="w-full p-3 border rounded-xl outline-none font-bold text-slate-700"
                >
                  {classesList.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition">
                O'quvchini Saqlash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sinf Qo'shish Modali */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setIsAddClassOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-900">Yangi Sinf Qo'shish</h3>

            <form onSubmit={handleAddClass} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sinf Raqami</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Masalan: 11"
                    value={newClass.gradeNumber}
                    onChange={(e) => setNewClass({ ...newClass, gradeNumber: e.target.value })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sinf Harfi</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Masalan: B"
                    value={newClass.gradeLetter}
                    onChange={(e) => setNewClass({ ...newClass, gradeLetter: e.target.value })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sinf Rahbari Ismi-Sharifi</label>
                <input 
                  type="text" 
                  placeholder="Masalan: Murodov Aziz"
                  value={newClass.teacherName}
                  onChange={(e) => setNewClass({ ...newClass, teacherName: e.target.value })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sinf Rahbari Telefoni</label>
                <input 
                  type="text" 
                  value={newClass.teacherPhone}
                  onChange={(e) => setNewClass({ ...newClass, teacherPhone: formatPhoneNumber(e.target.value) })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md transition">
                Sinfni Saqlash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sinfni Tahrirlash (Edit) Modali */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setEditingClass(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-900">Sinf Ma'lumotlarini Tahrirlash</h3>

            <form onSubmit={handleUpdateClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sinf Nomi</label>
                <input 
                  type="text" 
                  required
                  value={editingClass.name}
                  onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sinf Rahbari Ismi-Sharifi</label>
                <input 
                  type="text" 
                  required
                  value={editingClass.teacher}
                  onChange={(e) => setEditingClass({ ...editingClass, teacher: e.target.value })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sinf Rahbari Telefoni</label>
                <input 
                  type="text" 
                  value={editingClass.teacherPhone}
                  onChange={(e) => setEditingClass({ ...editingClass, teacherPhone: formatPhoneNumber(e.target.value) })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition">
                O'zgarishlarni Saqlash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sinfni O'chirish Tasdiqlash Modali */}
      {deletingClassId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Sinfni o'chirasizmi?</h3>
              <p className="text-xs text-slate-500 mt-1">Bu sinfga tegishli barcha o'quvchilar ham ro'yxatdan o'chib ketadi.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setDeletingClassId(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition">
                Bekor qilish
              </button>
              <button onClick={handleDeleteClass} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md shadow-rose-500/20">
                Ha, O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}