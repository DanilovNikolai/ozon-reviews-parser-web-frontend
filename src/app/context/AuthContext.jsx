'use client';
import { createContext, useContext } from 'react';
import { useAuthState } from '@/hooks/useAuthState';

const AuthContext = createContext(null);

export function AuthProvider({ initialUser, children }) {
  const auth = useAuthState(initialUser);
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
