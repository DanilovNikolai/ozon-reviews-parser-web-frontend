import { useState } from 'react';
import Input from './ui/Input';

export default function AuthModal({ onClose, onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(email, password);
      }
    } catch (e) {
      setError(e.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  }

  const inputClass = (hasError) =>
    `w-full border rounded-lg p-2 focus:outline-none ${
      hasError ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-gray-300'
    }`;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg relative">
        {/* КНОПКА ЗАКРЫТИЯ */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold mb-4 text-center">
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </h3>

        {/* ОШИБКА */}
        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-center">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <Input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error}
          />

          <Input
            type="password"
            required
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 disabled:opacity-60 cursor-pointer"
          >
            {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-4 text-xs text-center">
          <button
            type="button"
            onClick={switchMode}
            className="text-blue-600 underline cursor-pointer"
          >
            {mode === 'login' ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}
