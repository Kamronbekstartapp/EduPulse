import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Agar qurilma kompyuter bo'lsa (ekran kengligi 768px dan katta bo'lsa), ko'rsatmaymiz
    if (window.innerWidth > 768) {
      return;
    }

    // 2. Agar ilova allaqachon telefonga o'rnatilgan bo'lsa (standalone), ko'rsatmaymiz
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log("Ilova o'rnatildi");
    }

    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] md:hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-xl">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold">EduPulse Ilovasi</p>
          <p className="text-[10px] text-blue-100">Tezkor kirish uchun telefoningizga o'rnating!</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handleInstallClick}
          className="bg-white text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition active:scale-95"
        >
          Yuklab olish
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/70 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}