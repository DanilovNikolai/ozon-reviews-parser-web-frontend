'use client';
import { useState } from 'react';

export default function Header({ user, onLoginClick, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full px-3 sm:px-4 mb-6 relative">
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* ЛОГО */}
        <h1 className="text-lg sm:text-xl font-semibold text-blue-600 whitespace-nowrap">
          🧩 Ozon Reviews Parser <span className="text-xs text-gray-600">v1.4</span>
        </h1>

        {/* DESKTOP */}
        {!user ? (
          <div className="hidden sm:block bg-white shadow-md rounded-xl px-4 py-2">
            <button
              onClick={onLoginClick}
              className="text-sm font-bold text-blue-600 cursor-pointer"
            >
              Войти / Регистрация
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-3 bg-white shadow-md rounded-xl px-4 py-2 text-sm whitespace-nowrap">
            <span className="text-gray-700 font-bold max-w-[180px] truncate">{user.email}</span>

            <button
              onClick={() => (window.location.href = '/history')}
              className="text-blue-600 font-bold cursor-pointer"
            >
              История
            </button>

            <button onClick={onLogout} className="text-red-600 font-bold cursor-pointer">
              Выйти
            </button>
          </div>
        )}

        {/* MOBILE */}
        {!user ? (
          <div className="sm:hidden bg-white shadow-md rounded-xl px-4 py-2">
            <button
              onClick={onLoginClick}
              className="text-sm font-bold text-blue-600 cursor-pointer"
            >
              Войти
            </button>
          </div>
        ) : (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden bg-white shadow-md rounded-xl px-3 py-2 text-xl cursor-pointer"
            aria-label="Меню"
          >
            ☰
          </button>
        )}
      </div>

      {/* MOBILE MENU */}
      {menuOpen && user && (
        <div className="sm:hidden absolute right-3 top-full mt-2 w-44 bg-white shadow-lg rounded-xl border border-gray-300 z-50">
          <div className="px-4 py-3 text-sm text-gray-700 truncate border-b-gray-300">
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
              onLogout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer"
          >
            Выйти
          </button>
        </div>
      )}
    </header>
  );
}
