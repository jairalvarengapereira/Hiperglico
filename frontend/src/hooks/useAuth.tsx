// frontend/src/hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const API_HOST = '';

export interface UserAuth {
  id: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  tenantId: string;
  patientId?: string;
  fullName?: string;
}

interface AuthContextType {
  user: UserAuth | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: 'ADMIN' | 'DOCTOR' | 'PATIENT', tenantId?: string) => Promise<void>;
  logout: () => void;
  userId?: string;
  fullName?: string;
  role?: 'ADMIN' | 'DOCTOR' | 'PATIENT';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session from localStorage on startup
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('ht_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        // Fetch real user info from '/api/auth/me' using the stored token
        const res = await fetch(`${API_HOST}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setToken(storedToken);
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.role,
            tenantId: userData.tenantId,
            patientId: userData.patientId,
            fullName: userData.fullName || (userData.role === 'DOCTOR' ? 'Dr(a). ' + userData.email.split('@')[0] : userData.email),
          });
        } else {
          // Token invalid or expired
          localStorage.removeItem('ht_token');
        }
      } catch (err) {
        console.error('Erro ao restaurar sessão:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_HOST}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Credenciais inválidas');
    }

    const data = await res.json();
    localStorage.setItem('ht_token', data.token);
    setToken(data.token);

    // Fetch full user profile including patient info if applicable
    const profileRes = await fetch(`${API_HOST}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    if (profileRes.ok) {
      const userData = await profileRes.json();
      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        tenantId: userData.tenantId,
        patientId: userData.patientId,
        fullName: userData.fullName || (userData.role === 'DOCTOR' ? 'Dr(a). ' + userData.email.split('@')[0] : userData.email),
      });
    } else {
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        tenantId: data.user.tenantId,
        fullName: data.user.role === 'DOCTOR' ? 'Médico' : 'Paciente',
      });
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT',
    tenantId?: string
  ) => {
    const res = await fetch(`${API_HOST}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName, role, tenantId }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Falha ao registrar usuário');
    }

    const data = await res.json();
    localStorage.setItem('ht_token', data.token);
    setToken(data.token);

    // Fetch full profile info for context
    const profileRes = await fetch(`${API_HOST}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    if (profileRes.ok) {
      const userData = await profileRes.json();
      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        tenantId: userData.tenantId,
        patientId: userData.patientId,
        fullName: userData.fullName || fullName,
      });
    } else {
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        tenantId: data.user.tenantId,
        fullName: fullName,
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('ht_token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        userId: user?.id,
        fullName: user?.fullName,
        role: user?.role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
