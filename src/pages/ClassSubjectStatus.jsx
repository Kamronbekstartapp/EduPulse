import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Sparkles, UserCheck, AlertTriangle } from 'lucide-react';

export default function ClassSubjectStatus() {
  const location = useLocation();
  const navigate = useNavigate();

  const [studentsList] = useState(() => JSON.parse(localStorage.getItem('edupulse_students') || '[]'));
  const [bookRecords] = useState(() => {
    const saved = localStorage.getItem('edupulse_book_notebook_records');
    return saved ? JSON.parse(saved) : {};
  });

  const { classId, className, subject, teacherName, dateStr, dayName, formattedDate } = location.state || {};

  if (!classId && !className) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200/80 shadow-lg">
        <h3 className="text-base font-black text-slate-800">Sinf yoki fan tanlanmagan!</h3>
        <button onClick={() => navigate('/my-class')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
          Mening Sinfim Sahifasiga Qaytish
        </button>
      </div>
    );
  }

  // 1. O'quvchilarni barcha ehtimoliy maydonlar bo'yicha filter qilish
  const classStudents = studentsList.filter(s => {
    const sGrade = String(s.grade || s.classId || s.className || '').trim().toLowerCase();
    const targetId = String(classId || '').trim().toLowerCase();
    const targetName = String(className || '').trim().toLowerCase();
    
    return (targetId && sGrade === targetId) || (targetName && sGrade === targetName);
  });

  // 2. localStorage dagi barcha kalitlarni tekshirish (Variantlar)
  const allSavedKeys = Object.keys(bookRecords);
  
  // Masalan: "classId_subject_dateStr" yoki "className_subject_dateStr"
  const matchedKey = allSavedKeys.find(key => {
    const parts = key.split('_');
    if (parts.length < 3) return false;

    const savedClass = parts[0].trim().toLowerCase();
    const savedSubject = parts[1].trim().toLowerCase();
    const savedDate = parts[2].trim();

    const isClassMatch = savedClass === String(classId || '').toLowerCase() || savedClass === String(className || '').toLowerCase();
    const isSubjectMatch = savedSubject === String(subject || '').toLowerCase();
    const isDateMatch = savedDate === dateStr;

    return isClassMatch && isSubjectMatch && isDateMatch;
  });

  const savedRecord = matchedKey ? bookRecords[matchedKey] : null;

  return (
    <div className="px-4 py-6 sm:px-8 max-w-7xl mx-auto space-y-6">
      {/* Sarlavha */}
      <div>
        <button 
          onClick={() => navigate('/my-class')} 
          className="text-xs font-bold text-blue-600 hover:underline mb-2 inline-flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Mening sinfim sahifasiga qaytish</span>
        </button>
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {className || classId} — {subject} Natijalari
          </h2>
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Sana: <strong className="text-slate-800">{dayName} ({formattedDate || dateStr})</strong> | O'qituvchi: <strong className="text-slate-800">{teacherName || 'Kiritilmagan'}</strong>
        </p>
      </div>

      {/* Saqlanganlik holati xabari */}
      {!savedRecord ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <span>Fan o'qituvchisi ushbu dars uchun hali kitob va daftar nazoratini belgilab saqlamagan.</span>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>✅ O'qituvchi tomonidan belgilangan va saqlangan natijalar:</span>
          <span className="text-[11px] text-emerald-600 font-semibold">Vaqti: {savedRecord.savedAt || 'Noma\'lum'}</span>
        </div>
      )}

      {/* JADVAL RO'YXATI */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-black text-slate-700">
          <div className="w-1/2 sm:w-2/3">O'QUVCHI ISMI va FAMILIYASI</div>
          <div className="w-1/2 sm:w-1/3 grid grid-cols-2 text-center">
            <span>KITOB</span>
            <span>DAFTAR</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {classStudents.length > 0 ? (
            classStudents.map((student, idx) => {
              // O'quvchi ma'lumotini topish
              const studentStatus = savedRecord?.students?.find(s => 
                String(s.id) === String(student.id) || 
                (s.fullName && student.fullName && s.fullName.toLowerCase().trim() === student.fullName.toLowerCase().trim()) ||
                (s.name && student.fullName && s.name.toLowerCase().trim() === student.fullName.toLowerCase().trim())
              );

              // Agar o'qituvchi belgilagan bo'lsa false/true, belgilamagan bo'lsa odatiy true
              const hasBook = studentStatus ? Boolean(studentStatus.booksReady) : true;
              const hasNotebook = studentStatus ? Boolean(studentStatus.notebooksReady) : true;

              return (
                <div key={student.id || idx} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                  <div className="w-1/2 sm:w-2/3 flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-extrabold text-xs sm:text-sm text-slate-900">{student.fullName || student.name}</p>
                      <p className="text-[10px] text-slate-400">ID: {student.id}</p>
                    </div>
                  </div>

                  <div className="w-1/2 sm:w-1/3 grid grid-cols-2 text-center">
                    <div className="flex justify-center">
                      {hasBook ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-bold">
                          <X className="w-5 h-5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div className="flex justify-center">
                      {hasNotebook ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-bold">
                          <X className="w-5 h-5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 space-y-2">
              <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400 font-bold">Ushbu sinfda o'quvchilar topilmadi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}