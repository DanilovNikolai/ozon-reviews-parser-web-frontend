export default function Header({ user, onLoginClick, onLogout }) {
  return (
    <header className="w-full max-w-2xl mb-6 flex justify-between items-center">
      <span className="text-sm font-semibold text-gray-600">Ozon Reviews Parser</span>

      {!user ? (
        <button onClick={onLoginClick} className="text-sm text-blue-600 underline">
          Войти / Регистрация
        </button>
      ) : (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-700">{user.email}</span>

          <button
            className="text-blue-600 underline"
            onClick={() => (window.location.href = '/account')}
          >
            История
          </button>

          <button onClick={onLogout} className="text-red-600 underline">
            Выйти
          </button>
        </div>
      )}
    </header>
  );
}
