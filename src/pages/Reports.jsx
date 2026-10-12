import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  BarChart3, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  Calendar,
  X,
  FileCheck
} from 'lucide-react';

export default function Reports() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('edupulse_user') || '{}'));
  
  // Real vaqt rejimida doimiy yangilanadigan lokal ma'lumotlar
  const [classesList] = useState(() => JSON.parse(localStorage.getItem('edupulse_classes') || '[]'));
  const [studentsList] = useState(() => JSON.parse(localStorage.getItem('edupulse_students') || '[]'));
  const [teachersList] = useState(() => JSON.parse(localStorage.getItem('edupulse_teachers') || '[]'));
  const [attendanceRecords] = useState(() => JSON.parse(localStorage.getItem('edupulse_attendance') || '{}'));

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('today'); // 'today', 'week', 'month'

  const canDownload = user?.role === 'administrator' || !!user?.canDownloadReport;

  // Sana va vaqt formatlash funksiyasi
  const now = new Date();
  const realDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const realTimeStr = now.toTimeString().split(' ')[0].slice(0, 5); // HH:MM

  // O'tmishdagi sanalar ro'yxatini shakllantirish
  const getDatesInRange = (daysCount) => {
    const dates = [];
    for (let i = 0; i < daysCount; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Tanlangan davrga ko'ra hisobot ma'lumotlarini yig'ish
  const generateReportForPeriod = (period) => {
    let daysToCalculate = 1;
    if (period === 'week') daysToCalculate = 7;
    if (period === 'month') daysToCalculate = 30;

    const targetDates = getDatesInRange(daysToCalculate);

    return classesList.map(cls => {
      // Sinf o'quvchilari
      const classStudents = studentsList.filter(s => s.grade === cls.id);
      const totalStudents = classStudents.length;

      // Sinf rahbarini Teachers ro'yxatidan qidirish (Eng so'nggi real ma'lumot)
      const assignedTeacherObj = teachersList.find(t => t.assignedClass === cls.id);
      const currentTeacherName = assignedTeacherObj ? assignedTeacherObj.fullName : (cls.teacher || 'Biriktirilmagan');

      let totalPresent = 0;
      let totalAbsent = 0;
      let totalExcused = 0;

      // Tanlangan kunlar bo'yicha davomat yig'indisi
      targetDates.forEach(dateStr => {
        const classKey = `${dateStr}_${cls.id}`;
        const att = attendanceRecords[classKey] || {};

        classStudents.forEach(st => {
          const status = att[st.id] || 'present';
          if (status === 'present') totalPresent++;
          if (status === 'absent') totalAbsent++;
          if (status === 'excused') totalExcused++;
        });
      });

      const totalPossibleEntries = totalStudents * daysToCalculate;
      const attendanceRate = totalPossibleEntries > 0 
        ? Math.round((totalPresent / totalPossibleEntries) * 100) 
        : 100;

      return {
        classId: cls.id,
        className: cls.name,
        teacher: currentTeacherName,
        totalStudents,
        present: totalPresent,
        absent: totalAbsent,
        excused: totalExcused,
        attendanceRate
      };
    });
  };

  // Bugungi ko'rsatkichlar (sayt ekranida ko'rish uchun)
  const todayReportsData = generateReportForPeriod('today');
  const totalAllStudents = todayReportsData.reduce((acc, c) => acc + c.totalStudents, 0);
  const totalAllPresent = todayReportsData.reduce((acc, c) => acc + c.present, 0);
  const totalAllAbsent = todayReportsData.reduce((acc, c) => acc + c.absent, 0);
  const totalAllExcused = todayReportsData.reduce((acc, c) => acc + c.excused, 0);
  const overallRate = totalAllStudents > 0 ? Math.round((totalAllPresent / totalAllStudents) * 100) : 100;

  // Excel / CSV faylini yuklab olish
  const handleExecuteDownload = () => {
    if (!canDownload) return;

    const dataToExport = generateReportForPeriod(selectedRange);

    let periodTitle = "Bugungi Kun";
    if (selectedRange === 'week') periodTitle = "Bir Haftalik (Oxirgi 7 kun)";
    if (selectedRange === 'month') periodTitle = "Bir Oylik (Oxirgi 30 kun)";

    let csvContent = "\uFEFF"; // UTF-8 BOM uzbek xarflari to'g'ri chiqishi uchun
    csvContent += `HYS OBOT NOMI:;EDUPULSE MAKTAB DAVOMAT HISOBOTI\n`;
    csvContent += `HISOBOT DAVRI:;${periodTitle}\n`;
    csvContent += `YARATILGAN REAL SANA VA VAQT:;${realDateStr} ${realTimeStr}\n\n`;

    csvContent += `Sinf;Sinf Rahbari;Jami O'quvchi;Kelganlar Yig'indisi;Kelmaganlar Yig'indisi;Sababli Yig'indisi;Davomat Foizi (%)\n`;

    dataToExport.forEach(row => {
      csvContent += `"${row.className}";"${row.teacher}";${row.totalStudents};${row.present};${row.absent};${row.excused};${row.attendanceRate}%\n`;
    });

    const sumStudents = dataToExport.reduce((a, b) => a + b.totalStudents, 0);
    const sumPresent = dataToExport.reduce((a, b) => a + b.present, 0);
    const sumAbsent = dataToExport.reduce((a, b) => a + b.absent, 0);
    const sumExcused = dataToExport.reduce((a, b) => a + b.excused, 0);
    const avgRate = sumStudents > 0 ? Math.round((sumPresent / (sumStudents * (selectedRange === 'week' ? 7 : selectedRange === 'month' ? 30 : 1))) * 100) : 100;

    csvContent += `\n"UMUMIY MAKTAB KO'RSATKICHI";"";${sumStudents};${sumPresent};${sumAbsent};${sumExcused};${avgRate}%\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EduPulse_Hisobot_${selectedRange}_${realDateStr}_${realTimeStr.replace(':', '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsDownloadModalOpen(false);
  };

  return (
    <div className="px-4 sm:px-8 max-w-7xl mx-auto space-y-6 py-4">
      {/* Sarlavha & Yuklab olish tugmasi */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            <span>Maktab Davomat Hisoboti</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Real vaqt: <strong>{realDateStr} ({realTimeStr})</strong></span>
          </p>
        </div>

        {/* YUKLAB OLISH TUGMASI */}
        {canDownload ? (
          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Hisobotni Yuklash (Excel / CSV)</span>
          </button>
        ) : (
          <div className="px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center space-x-2">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span>Hisobot yuklash uchun ruxsat berilmagan</span>
          </div>
        )}
      </div>

      {/* UMUMIY STATISTIKA KARTALARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Jami O'quvchilar</p>
            <p className="text-xl font-black text-slate-900">{totalAllStudents} nafar</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Bugun Kelganlar</p>
            <p className="text-xl font-black text-emerald-600">{totalAllPresent} nafar</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Bugun Kelmaganlar</p>
            <p className="text-xl font-black text-rose-600">{totalAllAbsent} nafar</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Sababli Kelmagan</p>
            <p className="text-xl font-black text-amber-600">{totalAllExcused} nafar</p>
          </div>
        </div>
      </div>

      {/* SAYTDA KO'RISH JADVALI */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="text-lg font-black text-slate-900">Sinflar Kesimida Real Davomat Jadvali</h3>
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-xl">
            Bugungi Davomat: {overallRate}%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="pb-3 px-3">Sinf</th>
                <th className="pb-3 px-3">Sinf Rahbari</th>
                <th className="pb-3 px-3 text-center">Jami O'quvchi</th>
                <th className="pb-3 px-3 text-center">Keldi</th>
                <th className="pb-3 px-3 text-center">Kelmadi</th>
                <th className="pb-3 px-3 text-center">Sababli</th>
                <th className="pb-3 px-3 text-right">Davomat (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
              {todayReportsData.map((row) => (
                <tr key={row.classId} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-3">
                    <span className="bg-slate-100 text-slate-900 px-2.5 py-1 rounded-lg font-black">
                      {row.className}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-800">{row.teacher}</td>
                  <td className="py-3.5 px-3 text-center text-slate-900">{row.totalStudents}</td>
                  <td className="py-3.5 px-3 text-center text-emerald-600">{row.present}</td>
                  <td className="py-3.5 px-3 text-center text-rose-600">{row.absent}</td>
                  <td className="py-3.5 px-3 text-center text-amber-600">{row.excused}</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className={`px-2.5 py-1 rounded-lg ${
                      row.attendanceRate >= 90 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {row.attendanceRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HISOBOT DAVRINI TANLASH MODALI */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <button 
              onClick={() => setIsDownloadModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Hisobot Davrini Tanlang</span>
              </h3>
              <p className="text-xs text-slate-500">
                Qaysi vaqt oralig'idagi maktab hisobotini Excel/CSV formatida yuklab olmoqchisiz?
              </p>
            </div>

            <div className="space-y-2.5">
              <div 
                onClick={() => setSelectedRange('today')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  selectedRange === 'today' 
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-sm' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <div>
                  <p className="text-xs font-extrabold">1. Bugungi Kun Hisoboti</p>
                  <p className="text-[10px] text-slate-400 font-normal">Sana: {realDateStr} ({realTimeStr})</p>
                </div>
                {selectedRange === 'today' && <FileCheck className="w-5 h-5 text-blue-600" />}
              </div>

              <div 
                onClick={() => setSelectedRange('week')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  selectedRange === 'week' 
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-sm' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <div>
                  <p className="text-xs font-extrabold">2. Bir Haftalik Hisobot</p>
                  <p className="text-[10px] text-slate-400 font-normal">Oxirgi 7 kunlik umumiy jamlanma</p>
                </div>
                {selectedRange === 'week' && <FileCheck className="w-5 h-5 text-blue-600" />}
              </div>

              <div 
                onClick={() => setSelectedRange('month')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  selectedRange === 'month' 
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-sm' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <div>
                  <p className="text-xs font-extrabold">3. Bir Oylik Hisobot</p>
                  <p className="text-[10px] text-slate-400 font-normal">Oxirgi 30 kunlik umumiy jamlanma</p>
                </div>
                {selectedRange === 'month' && <FileCheck className="w-5 h-5 text-blue-600" />}
              </div>
            </div>

            <button
              onClick={handleExecuteDownload}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition text-xs flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Yuklab Olishni Boshlash</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}