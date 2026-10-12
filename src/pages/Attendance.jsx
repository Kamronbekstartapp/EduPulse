import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  AlertCircle, 
  ShieldCheck,
  ArrowLeft,
  ShieldAlert,
  Unlock
} from 'lucide-react';

export default function Attendance() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('edupulse_user') || '{}'));
  const [classesList] = useState(() => JSON.parse(localStorage.getItem('edupulse_classes') || '[]'));
  const [studentsList] = useState(() => JSON.parse(localStorage.getItem('edupulse_students') || '[]'));
  const [teachersList] = useState(() => JSON.parse(localStorage.getItem('edupulse_teachers') || '[]'));

  const [selectedClassId, setSelectedClassId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const saved = localStorage.getItem('edupulse_attendance');
    return saved ? JSON.parse(saved) : {};
  });

  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('edupulse_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const todayStr = new Date().toISOString().split('T')[0];
  
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const isTimeLocked = hours > 8 || (hours === 8 && minutes >= 15);

  const isAdmin = user?.role === 'administrator';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Tahrirlash huquqini tekshirish
  const checkCanEdit = (classId) => {
    // Admin har qanday holatda va har qanday sinfni o'zgartira oladi!
    if (isAdmin) return true; 

    // O'qituvchi bo'lsa: faqat o'z sinfini va 08:15 gacha tahrirlay oladi
    const myTeacherInfo = teachersList.find(t => t.fullName.toLowerCase() === user.username?.toLowerCase());
    return myTeacherInfo && myTeacherInfo.assignedClass === classId && !isTimeLocked;
  };

  const handleStatusChange = (studentId, status) => {
    if (!isAdmin && isTimeLocked) {
      showToast("Soat 08:15 dan o'tdi! Oddiy o'qituvchilar uchun davomat bloki yopilgan.");
      return;
    }

    if (!checkCanEdit(selectedClassId)) {
      showToast("Siz faqat o'zingizga biriktirilgan sinf davomatini qilishingiz mumkin!");
      return;
    }

    const recordKey = `${todayStr}_${selectedClassId}`;
    setAttendanceRecords(prev => ({
      ...prev,
      [recordKey]: {
        ...(prev[recordKey] || {}),
        [studentId]: status
      }
    }));
  };

  const selectedClassStudents = studentsList.filter(s => s.grade === selectedClassId);
  const currentKey = `${todayStr}_${selectedClassId}`;
  const currentClassAttendance = attendanceRecords[currentKey] || {};

  return (
    <div className="px-4 sm:px-8 max-w-7xl mx-auto space-y-6 py-4">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-bounce">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sarlavha & Taymer Bar */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sinflar Davomati</h2>
          <p className="text-xs text-slate-500 mt-0.5">Sana: <strong>{todayStr}</strong></p>
        </div>

        <div className="flex items-center space-x-3">
          {isAdmin ? (
            <div className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-2xl text-xs font-bold flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Admin Rejimi (Vaqtsiz Cheksiz Boshqaruv)</span>
            </div>
          ) : (
            <div className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
              isTimeLocked ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {isTimeLocked ? <Lock className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              <span>
                {isTimeLocked ? "08:15 O'tdi - Davomat Tahrirlash Yopilgan" : "Davomat Ochiq (08:15 gacha)"}
              </span>
            </div>
          )}

          <div className="text-xs font-black bg-slate-100 text-slate-800 px-3 py-2 rounded-xl">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {selectedClassId ? (
        /* TANLANGAN SINF DAVOMAT JADVALI */
        <div className="space-y-4">
          <button
            onClick={() => setSelectedClassId(null)}
            className="inline-flex items-center space-x-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sinflar ro'yxatiga qaytish</span>
          </button>

          {!checkCanEdit(selectedClassId) && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs flex items-center space-x-2 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Siz bu sinfga rahbar emassiz va 08:15 dan o'tgan. Faqat ko'rish rejimidasiz!</span>
            </div>
          )}

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900">{selectedClassId} sinf o'quvchilari</h3>
              {isAdmin && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl flex items-center space-x-1">
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Admin: Tahrirlash ochiq</span>
                </span>
              )}
            </div>

            {selectedClassStudents.length > 0 ? (
              <div className="space-y-2">
                {selectedClassStudents.map((student) => {
                  const status = currentClassAttendance[student.id] || 'present';
                  const canEdit = checkCanEdit(selectedClassId);

                  return (
                    <div key={student.id} className="p-3 bg-slate-50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-100">
                      <div>
                        <p className="font-extrabold text-xs text-slate-900">{student.fullName}</p>
                        <p className="text-[10px] text-slate-400">{student.id}</p>
                      </div>

                      <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                        <button
                          disabled={!canEdit}
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                            status === 'present'
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-white text-slate-600 border border-slate-200 opacity-60'
                          } ${!canEdit ? 'cursor-not-allowed' : ''}`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Keldi</span>
                        </button>

                        <button
                          disabled={!canEdit}
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                            status === 'absent'
                              ? 'bg-rose-600 text-white shadow-md'
                              : 'bg-white text-slate-600 border border-slate-200 opacity-60'
                          } ${!canEdit ? 'cursor-not-allowed' : ''}`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Kelmadi</span>
                        </button>

                        <button
                          disabled={!canEdit}
                          onClick={() => handleStatusChange(student.id, 'excused')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                            status === 'excused'
                              ? 'bg-amber-500 text-white shadow-md'
                              : 'bg-white text-slate-600 border border-slate-200 opacity-60'
                          } ${!canEdit ? 'cursor-not-allowed' : ''}`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Sababli kelmadi</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">Ushbu sinfda o'quvchilar yo'q.</p>
            )}
          </div>
        </div>
      ) : (
        /* SINFLAR RO'YXATI */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classesList.map((cls) => {
            const classStudents = studentsList.filter(s => s.grade === cls.id);
            const classKey = `${todayStr}_${cls.id}`;
            const att = attendanceRecords[classKey] || {};

            let presentCount = 0;
            let absentCount = 0;
            let excusedCount = 0;

            classStudents.forEach(st => {
              const stStatus = att[st.id] || 'present';
              if (stStatus === 'present') presentCount++;
              if (stStatus === 'absent') absentCount++;
              if (stStatus === 'excused') excusedCount++;
            });

            const canEditThis = checkCanEdit(cls.id);

            return (
              <div 
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`bg-white border p-5 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer space-y-3 relative ${
                  canEditThis ? 'border-blue-300 ring-2 ring-blue-500/10' : 'border-slate-200/80'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="bg-blue-50 text-blue-700 font-black text-sm px-3 py-1 rounded-xl">
                    {cls.name}
                  </span>
                  {isAdmin ? (
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                      Boshqaruv Ochiq
                    </span>
                  ) : canEditThis && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      Mening sinfim
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>Sinf rahbari: <strong className="text-slate-900">{cls.teacher}</strong></p>
                  <p>Jami o'quvchi: <strong className="text-slate-900">{classStudents.length} ta</strong></p>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-[11px] font-bold text-center">
                  <div className="bg-emerald-50 text-emerald-700 p-1.5 rounded-xl">
                    <span>Kelgan</span>
                    <p className="text-sm font-black">{presentCount}</p>
                  </div>
                  <div className="bg-rose-50 text-rose-700 p-1.5 rounded-xl">
                    <span>Kelmagan</span>
                    <p className="text-sm font-black">{absentCount}</p>
                  </div>
                  <div className="bg-amber-50 text-amber-700 p-1.5 rounded-xl">
                    <span>Sababli</span>
                    <p className="text-sm font-black">{excusedCount}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}