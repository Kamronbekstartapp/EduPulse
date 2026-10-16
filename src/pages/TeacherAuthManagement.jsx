import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  KeyRound,
  CheckCircle2,
  Trash2,
  X,
  Eye,
  EyeOff,
  Pencil,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { db } from '../firebase'; // Firebase sozlama faylingiz manzili
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const PERMISSION_DOWNLOAD_REPORT = {
  id: 'can_download_school_report',
  label: "Butun maktab bo'yicha hisobotni yuklab olish"
};

export default function TeacherAuthManagement() {
  const [userList, setUserList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [toastMsg, setToastMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formAcc, setFormAcc] = useState({
    fullName: '',
    username: '',
    password: '',
    position: "Fan o'qituvchisi",
    canDownloadReport: false
  });

  // Firestore'dan ma'lumotlarni yuklab olish
  useEffect(() => {
    loadDataFromFirebase();
  }, []);

  const loadDataFromFirebase = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'teacher_accounts'));
      const users = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      
      setUserList(users.length > 0 ? users : [
        {
          id: 'USR-1',
          fullName: 'Azizov Murod',
          username: 'murod',
          password: '123',
          position: 'Sinf rahbari',
          canDownloadReport: false
        },
        {
          id: 'USR-2',
          fullName: 'Karimova Zilola',
          username: 'zilola',
          password: '123',
          position: 'Zavuch',
          canDownloadReport: true
        }
      ]);
    } catch (err) {
      console.error("Akkauntlarni yuklashda xatolik:", err);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const togglePasswordVisibility = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openModalForAdd = () => {
    setEditingUserId(null);
    setFormAcc({
      fullName: '',
      username: '',
      password: '',
      position: "Fan o'qituvchisi",
      canDownloadReport: false
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openModalForEdit = (acc) => {
    setEditingUserId(acc.id);
    setFormAcc({
      fullName: acc.fullName || acc.full_name || '',
      username: acc.username || '',
      password: acc.password || '',
      position: acc.position || "Fan o'qituvchisi",
      canDownloadReport: !!acc.canDownloadReport
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = formAcc.username.trim().toLowerCase();

    if (cleanUsername === 'rahbar' || cleanUsername === 'super') {
      setErrorMsg("Ushbu login admin uchun band qilingan!");
      return;
    }

    const exists = userList.some(u => u.username.toLowerCase() === cleanUsername && u.id !== editingUserId);
    if (exists) {
      setErrorMsg("Ushbu login tizimda allaqachon mavjud! Boshqa login tanlang.");
      return;
    }

    try {
      if (editingUserId) {
        const payload = {
          fullName: formAcc.fullName,
          full_name: formAcc.fullName,
          username: cleanUsername,
          password: formAcc.password,
          position: formAcc.position,
          canDownloadReport: formAcc.canDownloadReport
        };

        await setDoc(doc(db, 'teacher_accounts', editingUserId), payload, { merge: true });
        setUserList(prev => prev.map(u => u.id === editingUserId ? { ...u, ...payload } : u));
        showToast("O'qituvchi ma'lumotlari va ruxsati yangilandi!");
      } else {
        const userId = `USR-${Date.now().toString().slice(-4)}`;
        const accountObj = {
          fullName: formAcc.fullName,
          full_name: formAcc.fullName,
          username: cleanUsername,
          password: formAcc.password,
          position: formAcc.position,
          canDownloadReport: formAcc.canDownloadReport
        };

        await setDoc(doc(db, 'teacher_accounts', userId), accountObj);
        setUserList(prev => [...prev, { id: userId, ...accountObj }]);
        showToast("Yangi o'qituvchi muvaffaqiyatli saqlandi!");
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Akkauntni saqlashda xatolik:", err);
      setErrorMsg("Saqlashda xatolik yuz berdi!");
    }
  };

  // Akkaunt o'chirilganda uning asosiy teachers ma'lumotlari va sinf rahbarligini ham tozalash
  const handleDeleteAccount = async (id) => {
    const accountToDelete = userList.find(u => u.id === id);
    if (!accountToDelete) return;

    try {
      // 1. Akkauntni Firestore'dan o'chirish
      await deleteDoc(doc(db, 'teacher_accounts', id));
      setUserList(prev => prev.filter(u => u.id !== id));

      // 2. 'teachers' va 'classes' kolleksiyalarini ham tozalash (agar mavjud bo'lsa)
      const teachersSnap = await getDocs(collection(db, 'teachers'));
      const targetTeacher = teachersSnap.docs.find(docSnap => {
        const tData = docSnap.data();
        const tName = tData.fullName || tData.full_name || '';
        return tName.toLowerCase().trim() === (accountToDelete.fullName || '').toLowerCase().trim();
      });

      if (targetTeacher) {
        await deleteDoc(doc(db, 'teachers', targetTeacher.id));
        const tData = targetTeacher.data();
        const assignedClass = tData.assignedClass || tData.assigned_class;

        if (assignedClass) {
          const classesSnap = await getDocs(collection(db, 'classes'));
          const targetClassDoc = classesSnap.docs.find(docSnap => docSnap.id === assignedClass || docSnap.data().name === assignedClass);
          if (targetClassDoc) {
            await setDoc(doc(db, 'classes', targetClassDoc.id), { teacher: 'Tayinlanmagan', teacherPhone: 'Kiritilmagan' }, { merge: true });
          }
        }
      }

      showToast("Akkount, o'qituvchi ma'lumotlari va sinf rahbarligi to'liq o'chirildi!");
    } catch (err) {
      console.error("Akkountni o'chirishda xatolik:", err);
      showToast("O'chirishda xatolik yuz berdi!");
    }
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
            O'qituvchilar Akkauntlari
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            O'qituvchilarning login/paroli hamda maktab hisobotini yuklash ruxsatini boshqarish
          </p>
        </div>

        <button
          onClick={openModalForAdd}
          className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Yangi Login Yaratish</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userList.map((acc) => {
          const accName = acc.fullName || acc.full_name;
          return (
            <div key={acc.id} className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-3 relative group">
              <div className="flex justify-between items-start pr-16">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{accName}</h3>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {acc.position}
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex items-center space-x-1">
                <button
                  onClick={() => openModalForEdit(acc)}
                  className="p-2 bg-slate-50 text-slate-500 hover:text-blue-600 rounded-xl transition"
                  title="Tahrirlash"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteAccount(acc.id)}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs space-y-2 pt-2 border-t border-slate-100 font-medium">
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold">Login:</span>
                  <span className="font-bold text-slate-800">{acc.username}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold">Parol:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-emerald-600">
                      {showPasswords[acc.id] ? acc.password : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(acc.id)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {showPasswords[acc.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hisobot Yuklash Ruxsati:</p>
                  <div>
                    {acc.canDownloadReport ? (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg inline-flex items-center space-x-1">
                        <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                        <span>Ruxsat Berilgan</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg inline-flex items-center space-x-1">
                        <X className="w-3 h-3 text-rose-500" />
                        <span>Ruxsat Yo'q</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-900">
              {editingUserId ? "O'qituvchi Ma'lumotlarini Tahrirlash" : "Yangi O'qituvchi Qo'shish"}
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">O'qituvchi Ism-Familiyasi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Murodov Azizbek"
                  value={formAcc.fullName}
                  onChange={(e) => setFormAcc({ ...formAcc, fullName: e.target.value })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lavozimi</label>
                <select
                  value={formAcc.position}
                  onChange={(e) => setFormAcc({ ...formAcc, position: e.target.value })}
                  className="w-full p-3 border rounded-xl outline-none font-bold text-slate-700"
                >
                  <option value="Direktor">Direktor</option>
                  <option value="Zavuch">Zavuch (O'quv ishlari o'rinbosari)</option>
                  <option value="Ma'naviyat o'rinbosari">Ma'naviyat o'rinbosari</option>
                  <option value="Sinf rahbari">Sinf rahbari</option>
                  <option value="Fan o'qituvchisi">Fan o'qituvchisi</option>
                  <option value="Xo'jalik mudiri">Xo'jalik mudiri</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tizim Logini</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: murod_teacher"
                    value={formAcc.username}
                    onChange={(e) => setFormAcc({ ...formAcc, username: e.target.value })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parol</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: pass12345"
                    value={formAcc.password}
                    onChange={(e) => setFormAcc({ ...formAcc, password: e.target.value })}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div
                  onClick={() => setFormAcc({ ...formAcc, canDownloadReport: !formAcc.canDownloadReport })}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${formAcc.canDownloadReport
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-500 font-medium hover:bg-slate-100'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className={`w-4 h-4 ${formAcc.canDownloadReport ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-xs">{PERMISSION_DOWNLOAD_REPORT.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${formAcc.canDownloadReport ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                    {formAcc.canDownloadReport && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition text-xs">
                {editingUserId ? "O'zgarishlarni Saqlash" : "Akkountni Qo'shish"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}