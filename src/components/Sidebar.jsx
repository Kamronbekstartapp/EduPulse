import React, { useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Shirt, 
  Users, 
  GraduationCap, 
  LogOut, 
  UserCog,
  KeyRound,
  FileSpreadsheet,
  Building2,
  Calendar,
  BookMarked
} from 'lucide-react';

export default function Sidebar({ onLogout, user }) {
  const navigate = useNavigate();
  const mobileNavRef = useRef(null);

  const handleMobileWheel = (e) => {
    if (mobileNavRef.current && e.deltaY !== 0) {
      mobileNavRef.current.scrollLeft += e.deltaY;
    }
  };

  const menuItems = [
    { path: '/', name: 'Bosh sahifa', icon: <Home className="w-5 h-5 flex-shrink-0" /> },
    { path: '/attendance', name: 'Davomat', icon: <CheckSquare className="w-5 h-5 flex-shrink-0" /> },
    { path: '/reports', name: 'Hisobotlar', icon: <FileSpreadsheet className="w-5 h-5 flex-shrink-0 text-emerald-500" /> },
    { path: '/uniform', name: 'Forma & Kitob', icon: <Shirt className="w-5 h-5 flex-shrink-0" /> },
    { path: '/timetable', name: 'Dars Jadvali', icon: <Calendar className="w-5 h-5 flex-shrink-0 text-amber-500" /> },
    { path: '/my-class', name: 'Mening sinfim', icon: <BookMarked className="w-5 h-5 flex-shrink-0 text-purple-500" /> },
    { path: '/classes', name: 'Sinflar', icon: <Users className="w-5 h-5 flex-shrink-0" />, exact: true },
    { path: '/teachers', name: 'O\'qituvchilar', icon: <GraduationCap className="w-5 h-5 flex-shrink-0 text-blue-500" /> }
  ];

  if (user?.role === 'administrator') {
    menuItems.push({
      path: '/admin-management',
      name: 'Ma\'muriyat Boshqaruvi',
      icon: <Building2 className="w-5 h-5 flex-shrink-0 text-sky-500" />
    });
    menuItems.push({
      path: '/teacher-auth',
      name: 'O\'qituvchilar Akkauntlari',
      icon: <KeyRound className="w-5 h-5 flex-shrink-0 text-purple-500" />
    });
    menuItems.push({
      path: '/students-management',
      name: 'O\'quvchilar Boshqaruvi',
      icon: <UserCog className="w-5 h-5 flex-shrink-0 text-amber-500" />
    });
  }

  const displayName = user?.role === 'administrator' ? "ADMIN" : user?.username;
  const displayRole = user?.position || (user?.role === 'administrator' ? 'Bosh Admin' : 'O\'qituvchi');
  
  const avatarInitials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ADM';

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 justify-between p-4 z-40">
        <div className="flex flex-col space-y-4">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center space-x-3 cursor-pointer px-3 py-2"
          >
            <div className="shadow-lg shadow-blue-500/30 flex-shrink-0">
              <img src="/icon-192.png" alt="EduPulse Logo" width="48" height="32" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              EduPulse
            </span>
          </div>

          {user && (
            <div className="px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                {avatarInitials}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold truncate">
                  ● {displayRole}
                </p>
              </div>
            </div>
          )}

          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-260px)] custom-scrollbar">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl font-bold transition text-xs ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold py-2.5 px-4 rounded-2xl transition active:scale-95 text-xs"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Tizimdan chiqish</span>
          </button>
        </div>
      </aside>

      {/* MOBIL BOTTOM NAVIGATSIYA */}
      <div 
        ref={mobileNavRef}
        onWheel={handleMobileWheel}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 z-50 px-3 py-2 flex items-center space-x-2 overflow-x-auto custom-scrollbar shadow-2xl"
      >
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-bold transition flex-shrink-0 min-w-[70px] ${
                isActive ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {item.icon}
            <span className="mt-1 tracking-tight truncate max-w-[65px]">{item.name}</span>
          </NavLink>
        ))}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-bold text-rose-500 hover:text-rose-700 flex-shrink-0 min-w-[60px]"
        >
          <LogOut className="w-5 h-5" />
          <span className="mt-1 tracking-tight">Chiqish</span>
        </button>
      </div>
    </>
  );
}