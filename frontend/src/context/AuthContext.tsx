import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { ensureCsrfToken, setAccessToken } from '../services/api';

interface User {
  _id: string;
  email: string;
  fullName?: string;
  matricule: string;
  school: string;
  studyYear?: string;
  major: string;
  category?: 'student' | 'professional' | 'other';
  profession?: string;
  matriculeValidated: boolean;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    matricule: string;
    school: string;
    studyYear?: string;
    major: string;
    category?: 'student' | 'professional' | 'other';
    profession?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getAuthErrorMessage = (error: any, fallback: string): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  const firstValidationError = error?.response?.data?.errors?.[0]?.msg;
  if (firstValidationError) {
    return firstValidationError;
  }

  if (error?.code === 'ERR_NETWORK') {
    return 'Impossible de joindre le serveur. Verifiez que le frontend utilise bien /api et que le backend est demarre.';
  }

  return fallback;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authRequestVersionRef = useRef(0);

  const beginAuthRequest = () => {
    authRequestVersionRef.current += 1;
    return authRequestVersionRef.current;
  };

  const isLatestAuthRequest = (version: number) => {
    return authRequestVersionRef.current === version;
  };

  useEffect(() => {
    const bootstrapSession = async () => {
      const requestVersion = beginAuthRequest();

      try {
        await ensureCsrfToken();
        const response = await authService.refresh();
        const nextToken = response.data.accessToken;
        if (!isLatestAuthRequest(requestVersion)) {
          return;
        }

        setAccessToken(nextToken);
        setToken(nextToken);
        setUser(response.data.user);
      } catch (err) {
        if (!isLatestAuthRequest(requestVersion)) {
          return;
        }

        setAccessToken(null);
        setToken(null);
        setUser(null);
      } finally {
        if (isLatestAuthRequest(requestVersion)) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapSession();
  }, []);

  const refreshUser = async () => {
    if (!token) {
      return;
    }

    const requestVersion = beginAuthRequest();
    const response = await authService.getCurrentUser();
    if (!isLatestAuthRequest(requestVersion)) {
      return;
    }

    setUser(response.data);
  };

  const login = async (email: string, password: string): Promise<User> => {
    const requestVersion = beginAuthRequest();
    setIsLoading(true);
    setError(null);
    try {
      await ensureCsrfToken();
      const response = await authService.login(email, password);
      if (!isLatestAuthRequest(requestVersion)) {
        return response.data.user as User;
      }

      setAccessToken(response.data.accessToken);
      setToken(response.data.accessToken);
      setUser(response.data.user);
      return response.data.user as User;
    } catch (err: any) {
      if (!isLatestAuthRequest(requestVersion)) {
        throw err;
      }

      const message = getAuthErrorMessage(err, 'Echec de la connexion');
      setError(message);
      throw err;
    } finally {
      if (isLatestAuthRequest(requestVersion)) {
        setIsLoading(false);
      }
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    fullName: string;
    matricule: string;
    school: string;
    studyYear?: string;
    major: string;
  }) => {
    const requestVersion = beginAuthRequest();
    setIsLoading(true);
    setError(null);
    try {
      await ensureCsrfToken();
      const response = await authService.register(payload);
      if (!isLatestAuthRequest(requestVersion)) {
        return;
      }

      setAccessToken(response.data.accessToken);
      setToken(response.data.accessToken);
      setUser(response.data.user);
    } catch (err: any) {
      if (!isLatestAuthRequest(requestVersion)) {
        throw err;
      }

      const message = getAuthErrorMessage(err, 'Echec de l\'inscription');
      setError(message);
      throw err;
    } finally {
      if (isLatestAuthRequest(requestVersion)) {
        setIsLoading(false);
      }
    }
  };

  const logout = () => {
    void authService.logout();
    setUser(null);
    setToken(null);
    setError(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
