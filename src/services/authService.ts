import { User, AuthSession } from '../types';

const USERS_KEY = 'audit_ai_users';
const SESSION_KEY = 'audit_ai_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Simple hash function for demo (use bcrypt in production)
function simpleHash(str: string): string {
  return btoa(str);
}

function verifyHash(plain: string, hash: string): boolean {
  return simpleHash(plain) === hash;
}

export const authService = {
  register: (email: string, password: string, name: string): User => {
    const users = authService.getAllUsers();
    
    if (users.find(u => u.email === email)) {
      throw new Error('Este email já está registrado');
    }

    if (password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    const newUser: User & { passwordHash: string } = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      createdAt: Date.now(),
      passwordHash: simpleHash(password),
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const { passwordHash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  login: (email: string, password: string): AuthSession => {
    const users = authService.getAllUsers();
    const user = users.find(u => u.email === email) as any;

    if (!user) {
      throw new Error('Email ou senha incorretos');
    }

    if (!verifyHash(password, user.passwordHash)) {
      throw new Error('Email ou senha incorretos');
    }

    const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
    const expiresAt = Date.now() + SESSION_DURATION;

    const session: AuthSession = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
      expiresAt,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  getCurrentSession: (): AuthSession | null => {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;

    const parsedSession: AuthSession = JSON.parse(session);
    
    // Check if session expired
    if (parsedSession.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return parsedSession;
  },

  renewSession: (): AuthSession | null => {
    const session = authService.getCurrentSession();
    if (!session) return null;

    const newSession: AuthSession = {
      ...session,
      token: Math.random().toString(36).substr(2) + Date.now().toString(36),
      expiresAt: Date.now() + SESSION_DURATION,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return newSession;
  },

  logout: (): void => {
    localStorage.removeItem(SESSION_KEY);
  },

  getAllUsers: (): (User & { passwordHash: string })[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },
};
