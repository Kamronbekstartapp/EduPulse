import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Building2, 
  Phone, 
  Award, 
  CheckCircle2, 
  Trash2, 
  X, 
  Pencil, 
  PlusCircle, 
  AlertTriangle,
  Lock
} from 'lucide-react';
import { getAdmins, saveAdmin, removeAdmin } from '../services/api';

// Telefon raqamini avtomatik formatlash (+998 XX XXX XX XX)
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

export default function AdminManagement() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('edupulse_user') || '{}'));
  const [adminList, setAdminList] = useState([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    category: 'RAHBAR',
    phone: '+998 ',
    experience: '5 yil tajriba'
  });

  // Serverdan ma'lumotlarni yuklash
  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const data = await getAdmins();
      setAdminList(data || []);
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
    }
  };

  const isAdmin = user?.role === 'administrator';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenAddForm = () => {
    if (!isAdmin) return;
    setEditingId(null);
    setFormData({ name: '', title: '', category: 'RAHBAR', phone: '+998 ', experience: '5 yil tajriba' });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (item) => {
    if (!isAdmin) return;
    setEditingId(item.admin_id);
    setFormData({
      name: item.name,
      title: item.title,
      category: item.category || 'RAHBAR',
      phone: item.phone,
      experience: item.experience
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!formData.name.trim() || !formData.title.trim()) return;

    try {
      const payload = {
        admin_id: editingId || `ADM-${Date.now()}`,
        ...formData
      };

      await saveAdmin(payload);
      await loadAdmins();

      setIsFormOpen(false);
      showToast(editingId ? "Ma'muriyat xodimi tahrirlandi!" : "Yangi ma'muriyat xodimi qo'shildi!");
    } catch (err) {
      console.error("Saqlashda xatolik:", err);
    }
  };

  const confirmDelete = async () => {
    if (!isAdmin) return;
    if (deleteConfirmId) {
      try {
        await removeAdmin(deleteConfirmId);
        await loadAdmins();
        setDeleteConfirmId(null);
        showToast("Xodim ro'yxatdan o'chirildi!");
      } catch (err) {
        console.error("O'chirishda xatolik:", err);
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="px-4 sm:px-8 max-w-7xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Ruxsat Cheklangan</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Ushbu sahifaga kirish va ma'muriyat xodimlarini boshqarish faqat Maktab Ma'muri (Admin) hisobi uchun ruxsat etilgan.
        </p>
      </div>
    );
  }

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
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            <span>Maktab Ma'muriyati Boshqaruvi</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Bosh sahifada ko'rinadigan maktab rahbar va mas'ul xodimlarini boshqarish
          </p>
        </div>

        <button
          onClick={handleOpenAddForm}
          className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Shaxs Qo'shish</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white border-2 border-blue-500/30 p-6 rounded-3xl shadow-xl space-y-4 relative animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <span>{editingId ? "Ma'muriyat Xodimini Tahrirlash" : "Yangi Ma'muriyat Xodimi Qo'shish Formasi"}</span>
            </h3>
            <button 
              onClick={() => setIsFormOpen(false)} 
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ism, Familiya va Otasining Ismi</label>
              <input 
                type="text" 
                required
                placeholder="Masalan: G'ofurova Gulmira"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lavozimi</label>
              <input 
                type="text" 
                required
                placeholder="Masalan: Maktab Direktori"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategoriya burchagi</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border rounded-xl outline-none font-bold text-slate-700 bg-white"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="RAHBAR">RAHBAR</option>
                <option value="TA'LIM">TA'LIM</option>
                <option value="TARBIYA">TARBIYA</option>
                <option value="TA'MINOT">TA'MINOT</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tajriba</label>
              <input 
                type="text" 
                placeholder="Masalan: 15 yil tajriba"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Telefon Raqami (+998 XX XXX XX XX)</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                placeholder="+998 90 123 45 67"
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-end space-x-2 pt-2">
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
              >
                Bekor qilish
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition"
              >
                {editingId ? "O'zgarishlarni Saqlash" : "Shaxsni Saqlash"}
              </button>
            </div>
          </form>
        </div>
      )}

      {adminList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminList.map((admin) => (
            <div key={admin.admin_id || admin.id} className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-3 relative group">
              <div className="flex justify-between items-start pr-12">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm uppercase">
                    {admin.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{admin.name}</h3>
                    <p className="text-xs text-blue-600 font-semibold">{admin.title}</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex items-center space-x-1">
                <button
                  onClick={() => handleOpenEditForm(admin)}
                  className="p-2 bg-slate-50 text-slate-500 hover:text-blue-600 rounded-xl transition"
                  title="Tahrirlash"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(admin.admin_id)}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 pt-2 border-t border-slate-100 font-medium">
                <p className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tel: <strong>{admin.phone}</strong></span>
                </p>
                <p className="flex items-center space-x-2">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tajriba: <strong>{admin.experience}</strong></span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-slate-200/80 rounded-3xl p-6">
          <p className="text-sm font-bold text-slate-500">Hozircha ma'muriyat xodimlari kiritilmagan.</p>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">O'chirishni tasdiqlang</h3>
              <p className="text-xs text-slate-500">
                Haqiqatan ham ushbu ma'muriyat xodimini ro'yxatdan o'chirmoqchimisiz?
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition text-xs"
              >
                Yo'q, qaytish
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition text-xs shadow-lg shadow-rose-500/20"
              >
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}