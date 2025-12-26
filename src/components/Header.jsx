'use client';
import { useState, useEffect } from 'react';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/app/context/AuthContext';
import { UserMenuSkeleton } from './ui/UserMenuSkeleton';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const { user, logout, login, register, loading } = useAuth();

  useEffect(() => {
    if (user) setShowAuth(false);
  }, [user]);

  return (
    <>
      <header className="w-full py-4 sm:py-8 relative">
        <div className="w-full flex items-center justify-between gap-3">
          {/* ================= ЛОГОТИП ================= */}
          <h1 className="text-lg sm:text-xl font-semibold text-blue-600 whitespace-nowrap">
            🧩 Ozon Reviews Parser <span className="text-xs text-gray-600">v1.4</span>
          </h1>

          {/* ================= МЕНЮ ПОЛЬЗОВАТЕЛЯ ================= */}

          {/* === ПРИ ЗАГРУЗКЕ === */}
          {loading && (
            <>
              {/* DESKTOP */}
              <UserMenuSkeleton />

              {/* MOBILE */}
              <button
                className="sm:hidden bg-white shadow-md rounded-xl px-3 py-2 text-xl cursor-default"
                aria-label="Меню"
              >
                ☰
              </button>
            </>
          )}

          {/* === ЕСЛИ НЕ АВТОРИЗОВАН И НЕТ ЗАГРУЗКИ === */}
          {!loading && !user && (
            <>
              {/* DESKTOP */}
              <div className="hidden sm:block bg-white shadow-md rounded-xl px-4 py-2">
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-sm font-bold text-blue-600 cursor-pointer"
                >
                  Войти / Регистрация
                </button>
              </div>

              {/* MOBILE */}
              <div className="sm:hidden bg-white shadow-md rounded-xl px-4 py-2">
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-sm font-bold text-blue-600 cursor-pointer"
                >
                  Войти
                </button>
              </div>
            </>
          )}

          {/* === ЕСЛИ АВТОРИЗОВАН И НЕТ ЗАГРУЗКИ === */}
          {!loading && user && (
            <>
              {/* DESKTOP */}
              <div className="hidden sm:flex items-center gap-3 bg-white shadow-md rounded-xl px-4 py-2 text-sm whitespace-nowrap">
                <span className="text-gray-700 font-bold max-w-[180px] truncate">{user.email}</span>

                <button
                  onClick={() => (window.location.href = '/history')}
                  className="text-blue-600 font-bold cursor-pointer"
                >
                  История
                </button>

                <button onClick={logout} className="text-red-600 font-bold cursor-pointer">
                  Выйти
                </button>
              </div>

              {/* MOBILE */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="sm:hidden bg-white shadow-md rounded-xl px-3 py-2 text-xl cursor-pointer"
                aria-label="Меню"
              >
                ☰
              </button>
            </>
          )}
        </div>

        {/* ================= МЕНЮ БУРГЕР ================= */}
        {!loading && menuOpen && user && (
          <div className="sm:hidden absolute right-3 top-full mt-2 w-44 bg-white shadow-lg rounded-xl border border-gray-300 z-50">
            <div className="px-4 py-3 text-sm text-gray-700 truncate border-b border-gray-200">
              {user.email}
            </div>

            <button
              onClick={() => {
                setMenuOpen(false);
                window.location.href = '/history';
              }}
              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 cursor-pointer"
            >
              История
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer"
            >
              Выйти
            </button>
          </div>
        )}
      </header>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onLogin={login} onRegister={register} />
      )}
    </>
  );
}
