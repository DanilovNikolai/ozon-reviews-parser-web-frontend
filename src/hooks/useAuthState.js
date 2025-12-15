import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export function useAuthState() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // === Проверка текущей сессии ===
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, []);

  // === Регистрация ===
  async function register(email, password) {
    const res = await axios.post('/api/auth/register', { email, password });

    if (!res.data.success) {
      throw new Error(res.data.error || 'Ошибка регистрации');
    }

    setUser(res.data.user);
    toast.success('Регистрация успешна!');
  }

  // === Логин ===
  async function login(email, password) {
    const res = await axios.post('/api/auth/login', { email, password });

    if (!res.data.success) {
      throw new Error(res.data.error || 'Ошибка авторизации');
    }

    setUser(res.data.user);
    toast.success('Авторизация успешна!');
  }

  // === Логаут ===
  async function logout() {
    await axios.post('/api/auth/logout');
    setUser(null);
    toast('Вы вышли из системы');
  }

  return {
    user,
    loading,
    isAuth: !!user,
    register,
    login,
    logout,
  };
}
