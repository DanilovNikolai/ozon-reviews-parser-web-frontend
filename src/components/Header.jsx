export default function Header({ user, onLoginClick, onLogout }) {
  return (
    <header className="w-full px-3 sm:px-4 mb-6">
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* ЛОГО */}
        <h1 className="text-lg sm:text-xl font-semibold text-blue-600 whitespace-nowrap shrink-0">
          🧩 Ozon Reviews Parser <span className="text-xs text-gray-600">v1.4</span>
        </h1>

        {/* ПРАВАЯ ЧАСТЬ */}
        {!user ? (
          <div className="bg-white shadow-md rounded-xl px-3 py-2 shrink-0">
            <button
              onClick={onLoginClick}
              className="text-sm text-blue-600 cursor-pointer whitespace-nowrap"
            >
              Войти / Регистрация
            </button>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-xl px-3 py-2 shrink-0">
            <div className="flex items-center gap-3 text-xs sm:text-sm whitespace-nowrap">
              {/* email */}
              <span
                className="text-gray-700 max-w-[120px] sm:max-w-[180px] truncate"
                title={user.email}
              >
                {user.email}
              </span>

              <button
                onClick={() => (window.location.href = '/history')}
                className="text-blue-600 underline cursor-pointer"
              >
                История
              </button>

              <button onClick={onLogout} className="text-red-600 underline cursor-pointer">
                Выйти
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
