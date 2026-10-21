import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  UserCheck, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  X, 
  CheckCircle2,
  UserPlus,
  Users
} from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

export default function ClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [user] = useState(() => JSON.parse(localStorage.getItem('edupulse_user') || '{}'));
  const isAdmin = user?.role === 'administrator' || user?.role === 'admin';

  const [classesList, setClassesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal va form holatlari
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  
  // O'quvchi qo'shish formasi
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    parentFirstName: '',
    parentLastName: ''
  });

  // O'chirish va sabab bildirish holatlari
  const [deletingStudentId, setDeletingStudentId] = useState(null);
  const [deleteReasonType, setDeleteReasonType] = useState('xatolik'); // 'xatolik' yoki 'boshqa'
  const [deleteReasonText, setDeleteReasonText] = useState('');

  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    loadDataFromFirebase();
  }, []);

  const loadDataFromFirebase = async () => {
    try {
      const classesSnap = await getDocs(collection(db, 'classes'));
      const classes = classesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClassesList(classes);

      const teachersSnap = await getDocs(collection(db, 'teachers'));
      const teachers = teachersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachersList(teachers);

      const studentsSnap = await getDocs(collection(db, 'students'));
      setStudentsList(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      setLoading(false);
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Hozirgi sinfni va ustoz biriktiruvini aniqlash
  const currentClass = classesList.find(c => (c.id || c.class_id) === classId || c.name === classId);

  const teacherObj = teachersList.find(t => 
    (t.full_name || t.fullName || t.name || '').toLowerCase().trim() === (user?.fullName || user?.username || '').toLowerCase().trim()
  );

  const assignedClass = classesList.find(c => {
    const assigned = teacherObj?.assigned_class || teacherObj?.assignedClass;
    const cId = c.id || c.class_id;
    if (assigned) return cId === assigned;
    const cTeacher = c.teacher || c.teacher_name || '';
    return cTeacher.toLowerCase().includes((user?.fullName || user?.username || '').toLowerCase());
  });

  const assignedClassId = assignedClass?.id || assignedClass?.class_id;

  // XAVFSIZLIK TEKSHIRUVI: Agar ustoz biriktirilmagan sinfga kirmoqchi bo'lsa
  useEffect(() => {
    if (!loading && !isAdmin) {
      if (!assignedClassId || String(assignedClassId) !== String(classId)) {
        navigate('/my-class');
      }
    }
  }, [loading, isAdmin, assignedClassId, classId, navigate]);

  // Faqat shu sinfning o'quvchilarini saralab olish
  const classStudents = studentsList.filter(s => 
    String(s.grade || s.class_id || s.classId) === String(classId)
  );

  // 1. Yangi o'quvchi qo'shish (Faqat shu sinfga)
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.firstName.trim() || !newStudent.lastName.trim()) return;

    try {
      const studentId = `STU-${Date.now()}`;
      const fullName = `${newStudent.lastName.trim()} ${newStudent.firstName.trim()}`;
      const parentName = `${newStudent.parentLastName.trim()} ${newStudent.parentFirstName.trim()}`.trim();

      const payload = {
        student_id: studentId,
        full_name: fullName,
        fullName: fullName,
        grade: classId,
        class_id: classId,
        parentName: parentName || "Kiritilmagan",
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'students', studentId), payload);
      setStudentsList(prev => [...prev, { id: studentId, ...payload }]);

      setNewStudent({ firstName: '', lastName: '', parentFirstName: '', parentLastName: '' });
      setIsAddModalOpen(false);
      showToast("O'quvchi sinfga muvaffaqiyatli qo'shildi!");
    } catch (err) {
      console.error("O'quvchi qo'shishda xatolik:", err);
      showToast("Xatolik yuz berdi!");
    }
  };

  // 2. O'quvchi ma'lumotlarini tahrirlash
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const studentId = editingStudent.id || editingStudent.student_id;
      const payload = {
        full_name: editingStudent.fullName,
        fullName: editingStudent.fullName,
        parentName: editingStudent.parentName || ''
      };

      await setDoc(doc(db, 'students', studentId), payload, { merge: true });
      
      setStudentsList(prev => prev.map(s => (s.id === studentId || s.student_id === studentId) ? { ...s, ...payload } : s));
      setEditingStudent(null);
      showToast("O'quvchi ma'lumotlari yangilandi!");
    } catch (err) {
      console.error("O'quvchini yangilashda xatolik:", err);
      showToast("Xatolik yuz berdi!");
    }
  };

  // 3. O'quvchini sabab bilan o'chirish
  const handleDeleteStudent = async () => {
    try {
      await deleteDoc(doc(db, 'students', deletingStudentId));
      setStudentsList(prev => prev.filter(s => s.id !== deletingStudentId && s.student_id !== deletingStudentId));
      
      // Reset qilish
      setDeletingStudentId(null);
      setDeleteReasonType('xatolik');
      setDeleteReasonText('');
      showToast("O'quvchi ro'yxatdan o'chirildi!");
    } catch (err) {
      console.error("O'quvchini o'chirishda xatolik:", err);
      showToast("O'chirishda xatolik yuz berdi!");
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs font-bold text-slate-400">Yuklanmoqda...</div>;
  }

  return (
    <div className="px-4 sm:px-8 max-w-7xl mx-auto space-y-6 py-6">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Orqaga qaytish tugmasi */}
      <button
        onClick={() => navigate('/my-class')}
        className="inline-flex items-center space-x-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Mening sinfimga qaytish</span>
      </button>

      {/* Header va O'quvchi Qo'shish Tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {currentClass?.name || classId} Sinf O'quvchilari
            </h2>
            <span className="bg-blue-100 text-blue-700 font-extrabold text-xs px-3 py-1 rounded-full">
              {classStudents.length} ta o'quvchi
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Sinf rahbari: <strong className="text-slate-800">{currentClass?.teacher || currentClass?.teacher_name || user?.fullName}</strong>
          </p>
        </div>

        {/* Tepa Chap/O'ng tomonda O'quvchi qo'shish tugmasi */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-md transition active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>O'quvchi qo'shish</span>
        </button>
      </div>

      {/* O'quvchilar Ro'yxati Grid */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        {classStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classStudents.map((student) => {
              const stId = student.id || student.student_id;
              const stName = student.fullName || student.full_name;

              return (
                <div key={stId} className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl space-y-3 relative group hover:border-blue-200 transition">
                  <div className="flex justify-between items-start pr-20">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{stName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">ID: {stId}</p>
                    </div>
                  </div>

                  {/* Tahrirlash va O'chirish tugmalari */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1">
                    <button
                      onClick={() => setEditingStudent({ ...student, fullName: stName })}
                      className="p-2 bg-white text-slate-600 hover:text-blue-600 rounded-xl border border-slate-200 shadow-sm transition active:scale-95"
                      title="Tahrirlash"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingStudentId(stId);
                        setDeleteReasonType('xatolik');
                        setDeleteReasonText('');
                      }}
                      className="p-2 bg-white text-slate-600 hover:text-rose-600 rounded-xl border border-slate-200 shadow-sm transition active:scale-95"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs space-y-1 text-slate-600 pt-2 border-t border-slate-200/50">
                    <p className="flex items-center space-x-2">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Ota-onasi: <strong>{student.parentName || 'Kiritilmagan'}</strong></span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-400 font-bold">Ushbu sinfda hozircha o'quvchilar mavjud emas.</p>
          </div>
        )}
      </div>

      {/* 1. O'QUVCHI QO'SHISH MODALI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>Yangi o'quvchi qo'shish</span>
            </h3>

            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">O'quvchi Ismi *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Masalan: Ali"
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">O'quvchi Familiyasi *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Masalan: Valiye"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ota-onasining Ismi</label>
                  <input 
                    type="text" 
                    placeholder="Masalan: Hasan"
                    value={newStudent.parentFirstName}
                    onChange={(e) => setNewStudent({ ...newStudent, parentFirstName: e.target.value })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ota-onasining Familiyasi</label>
                  <input 
                    type="text" 
                    placeholder="Masalan: Valiye"
                    value={newStudent.parentLastName}
                    onChange={(e) => setNewStudent({ ...newStudent, parentLastName: e.target.value })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition mt-2">
                Saqlash va Qo'shish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. TAHRIRLASH MODALI */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setEditingStudent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-900">O'quvchini Tahrirlash</h3>

            <form onSubmit={handleUpdateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">O'quvchi Ism va Familiyasi</label>
                <input 
                  type="text" 
                  required
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ota-onasining Ism Familiyasi</label>
                <input 
                  type="text" 
                  value={editingStudent.parentName || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
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

      {/* 3. SABAB BILAN O'CHIRISH MODALI */}
      {deletingStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">O'quvchini o'chirish</h3>
              <p className="text-xs text-slate-500 mt-1">Nima uchun o'chirmoqchisiz?</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sababni tanlang:</label>
                <select
                  value={deleteReasonType}
                  onChange={(e) => setDeleteReasonType(e.target.value)}
                  className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="xatolik">Xatolik bo'ldi</option>
                  <option value="boshqa">Boshqa sabab</option>
                </select>
              </div>

              {/* Boshqa sabab tanlanganda majburiy matn maydoni */}
              {deleteReasonType === 'boshqa' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sababni batafsil yozing*</label>
                  <textarea
                    rows={3}
                    placeholder="Masalan: Boshqa maktabga ko'chib o'tdi..."
                    value={deleteReasonText}
                    onChange={(e) => setDeleteReasonText(e.target.value)}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setDeletingStudentId(null)} 
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition"
                >
                  Bekor qilish
                </button>
                <button 
                  disabled={deleteReasonType === 'boshqa' && !deleteReasonText.trim()}
                  onClick={handleDeleteStudent} 
                  className={`flex-1 font-bold py-2.5 rounded-xl transition shadow-md ${
                    deleteReasonType === 'boshqa' && !deleteReasonText.trim()
                      ? 'bg-rose-300 cursor-not-allowed text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                  }`}
                >
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}