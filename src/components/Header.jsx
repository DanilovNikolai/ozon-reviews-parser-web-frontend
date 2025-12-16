export default function Header({ user, onLoginClick, onLogout }) {
  return (
    <header className="w-full max-w-2xl mb-6 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-blue-600 text-center">
        🧩 Ozon Reviews Parser v1.4
      </h1>

      {!user ? (
        <button onClick={onLoginClick} className="text-sm text-blue-600 underline cursor-pointer">
          Войти / Регистрация
        </button>
      ) : (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-700">{user.email}</span>

          <button
            className="text-blue-600 underline cursor-pointer"
            onClick={() => (window.location.href = '/account')}
          >
            История
          </button>

          <button onClick={onLogout} className="text-red-600 underline cursor-pointer">
            Выйти
          </button>
        </div>
      )}
    </header>
  );
}
