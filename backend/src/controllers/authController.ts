import { Response } from 'express';
import { securityConfig } from '../config/security';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/authService';
import { issueCsrfToken } from '../middleware/csrf';
import { logAuthAudit } from '../utils/authAudit';
import prisma from '../config/prisma';

const REFRESH_COOKIE_NAME = 'tibele_refresh_token';
const LEGACY_REFRESH_COOKIE_NAME = 'refreshToken';

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: securityConfig.cookieSecure,
  sameSite: securityConfig.cookieSameSite,
  domain: securityConfig.cookieDomain,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
});

const getRefreshClearCookieOptions = () => ({
  httpOnly: true,
  secure: securityConfig.cookieSecure,
  sameSite: securityConfig.cookieSameSite,
  domain: securityConfig.cookieDomain,
  path: '/api/auth',
});

const clearAuthCookies = (res: Response) => {
  const baseOptions = {
    httpOnly: true,
    secure: securityConfig.cookieSecure,
    sameSite: securityConfig.cookieSameSite,
    domain: securityConfig.cookieDomain,
  } as const;

  const paths = ['/api/auth', '/api', '/'];
  const cookieNames = [REFRESH_COOKIE_NAME, LEGACY_REFRESH_COOKIE_NAME];

  paths.forEach((path) => {
    cookieNames.forEach((name) => {
      res.clearCookie(name, { ...baseOptions, path });
    });
  });
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, matricule, school, studyYear, major } = req.body;

    const settings = await prisma.siteSetting.findUnique({
      where: { key: 'global' },
      select: { registrationsOpen: true },
    });
    if (settings && settings.registrationsOpen === false) {
      res.status(403).json({ message: 'Les inscriptions sont temporairement fermees.' });
      return;
    }

    const result = await authService.register({ email, password, fullName, matricule, school, studyYear, major });

    clearAuthCookies(res);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());
    issueCsrfToken(res);

    res.status(201).json({
      message: 'Inscription reussie',
      accessToken: result.accessToken,
      user: result.user,
    });
    logAuthAudit(req, 'register', 'success', { email });
  } catch (error: any) {
    logAuthAudit(req, 'register', 'failure', { email: req.body?.email, reason: error.message });
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    clearAuthCookies(res);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());
    issueCsrfToken(res);

    res.status(200).json({
      message: 'Connexion reussie',
      accessToken: result.accessToken,
      user: result.user,
    });
    logAuthAudit(req, 'login', 'success', { email });
  } catch (error: any) {
    logAuthAudit(req, 'login', 'failure', { email: req.body?.email, reason: error.message });
    res.status(401).json({ message: error.message });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      await authService.revokeRefreshToken(refreshToken);
    }

    clearAuthCookies(res);
    issueCsrfToken(res);
    res.status(200).json({ message: 'Deconnexion reussie' });
    logAuthAudit(req, 'logout', 'success');
  } catch (error: any) {
    logAuthAudit(req, 'logout', 'failure', { reason: error.message });
    res.status(400).json({ message: error.message });
  }
};

export const refreshSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      logAuthAudit(req, 'refresh_session', 'failure', { reason: 'missing_refresh_token' });
      res.status(401).json({ message: 'Jeton de session requis' });
      return;
    }

    const result = await authService.refreshSession(refreshToken);
    clearAuthCookies(res);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());
    issueCsrfToken(res);

    res.status(200).json({
      message: 'Session rafraichie',
      accessToken: result.accessToken,
      user: result.user,
    });
    logAuthAudit(req, 'refresh_session', 'success');
  } catch (error: any) {
    clearAuthCookies(res);
    logAuthAudit(req, 'refresh_session', 'failure', { reason: error.message });
    res.status(401).json({ message: error.message });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Non authentifie' });
      return;
    }

    const user = await authService.getUserById(req.userId);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Non authentifie' });
      return;
    }

    const { fullName, school, studyYear, major } = req.body;
    const user = await authService.updateUserProfile(req.userId, { fullName, school, studyYear, major });

    res.status(200).json({
      message: 'Profil mis a jour',
      user,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Non authentifie' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.userId, currentPassword, newPassword);

    logAuthAudit(req, 'change_password', 'success');
    res.status(200).json({ message: 'Mot de passe mis a jour avec succes' });
  } catch (error: any) {
    logAuthAudit(req, 'change_password', 'failure', { reason: error.message });
    res.status(400).json({ message: error.message });
  }
};
