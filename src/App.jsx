import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Home from './pages/Home';
import Attendance from './pages/Attendance';
import Uniform from './pages/Uniform';
import Classes from './pages/Classes';
import Teachers from './pages/Teachers';
import Reports from './pages/Reports';
import AdminManagement from './pages/AdminManagement';
import TeacherAuthManagement from './pages/TeacherAuthManagement';
import StudentsManagement from './pages/StudentsManagement';
import ClassDetail from './pages/ClassDetail';
import Timetable from './pages/Timetable';
import BookNotebook from './pages/BookNotebook';
import MyClass from './pages/MyClass';
import ClassSubjectStatus from './pages/ClassSubjectStatus';
import InstallBanner from './components/InstallBanner';

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('edupulse_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // F12 VA KO'RISH TUGMALARINI FAQAT ADMIN BO'LMAGANLAR UCHUN BLOKLASH
  useEffect(() => {
    const isAdmin = user?.role === 'administrator' || user?.role === 'admin';

    // Admin bo'lsa, cheklov ishlamaydi
    if (isAdmin) return;

    // 1. Klaviaturadagi F12 va Developer Tools tugmalarini to'sish
    const handleKeyDown = (e) => {
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl + Shift + I
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl + Shift + J
        (e.ctrlKey && e.keyCode === 85) // Ctrl + U (Manba kodini ko'rish)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 2. Sichqonchaning o'ng tugmasini (Kontekst menyu) taqiqlash
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('edupulse_user', JSON.stringify(userData));
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('edupulse_user');
    navigate('/');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      <Sidebar onLogout={handleLogout} user={user} />
 <InstallBanner />
      <main className="flex-1 pb-28 md:pb-8 pt-4 md:pt-0 overflow-x-hidden">
       
        <Routes>
          {/* BARCHA FOYDALANUVCHILAR UCHUN OCHIQ SAHIFALAR */}
          <Route path="/" element={<Home />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/uniform" element={<Uniform />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/book-notebook" element={<BookNotebook />} />
          <Route path="/my-class" element={<MyClass />} />
          <Route path="/my-class/subject-status" element={<ClassSubjectStatus />} />
          <Route path="/class-detail/:classId" element={<ClassDetail />} />
          
          
          {/* FAQAT ADMIN KO'RA OLADIGAN BOSHGARUV SAHIFALARI */}
          {user.role === 'administrator' && (
            <>
              <Route path="/admin-management" element={<AdminManagement />} />
              <Route path="/teacher-auth" element={<TeacherAuthManagement />} />
              <Route path="/students-management" element={<StudentsManagement />} />
              <Route path="/students-management/:classId" element={<ClassDetail />} /> 
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}