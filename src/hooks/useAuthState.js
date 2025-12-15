import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export function useAuthState() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // === Загрузка текущего пользователя ===
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    fetchMe();
  }, []);

  // === ЛОГИН ===
  async function login(email, password) {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setUser(res.data.user);
      toast.success('Успешная авторизация');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка авторизации');
      return false;
    }
  }

  // === РЕГИСТРАЦИЯ ===
  async function register(email, password) {
    try {
      const res = await axios.post('/api/auth/register', { email, password });
      setUser(res.data.user);
      toast.success('Регистрация успешна');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка регистрации');
      return false;
    }
  }

  // === ВЫХОД ===
  async function logout() {
    await axios.post('/api/auth/logout');
    setUser(null);
    toast('Вы вышли из аккаунта');
  }

  return {
    user,
    authLoading,
    isAuth: !!user,
    login,
    register,
    logout,
  };
}
