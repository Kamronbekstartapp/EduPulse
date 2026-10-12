import React, { useState } from 'react';
import { mockStudents, mockStats } from '../data/mockData';
import { Shirt, BookOpen, CheckCircle2, AlertTriangle, XCircle, Sparkles, BookCheck } from 'lucide-react';

export default function Uniform() {
  const [students, setStudents] = useState(mockStudents);

  const toggleBook = (id) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, booksReady: !s.booksReady } : s));
  };

  const toggleNotebook = (id) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, notebooksReady: !s.notebooksReady } : s));
  };

  return (
    <div className="px-4 py-6 sm:px-8 max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Forma & Kitob</h2>
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Kiyim tartibi va fan qurollari nazorati</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Forma Intizomi</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{mockStats.uniformComplianceRate}%</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Shirt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Darsga Tayyorgarlik</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{mockStats.preparedForLessonRate}%</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Ro'yxat */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm">O'quvchilar Holati</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {students.map((student) => (
            <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <img 
                  src={student.avatar} 
                  alt={student.fullName} 
                  className="w-10 h-10 rounded-2xl object-cover flex-shrink-0"
                />
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{student.fullName}</h4>
                  <p className="text-[10px] text-slate-400">{student.grade} sinf | {student.uniformNotes}</p>
                </div>
              </div>

              {/* Status tugmalari */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => toggleBook(student.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition active:scale-95 ${
                    student.booksReady ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  Kitob: {student.booksReady ? 'Bor' : 'Yo\'q'}
                </button>

                <button
                  onClick={() => toggleNotebook(student.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition active:scale-95 ${
                    student.notebooksReady ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  Daftar: {student.notebooksReady ? 'Bor' : 'Yo\'q'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}