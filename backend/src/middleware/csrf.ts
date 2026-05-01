import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { securityConfig } from '../config/security';

const CSRF_COOKIE_NAME = 'tibele_csrf_token';
const LEGACY_CSRF_COOKIE_NAME = 'csrfToken';
const CSRF_HEADER_NAME = 'x-csrf-token';

const getCsrfCookieOptions = () => ({
  httpOnly: false,
  secure: securityConfig.cookieSecure,
  sameSite: securityConfig.cookieSameSite,
  domain: securityConfig.cookieDomain,
  path: '/',
  maxAge: 24 * 60 * 60 * 1000,
});

const clearLegacyCsrfCookies = (res: Response) => {
  const baseOptions = {
    httpOnly: false,
    secure: securityConfig.cookieSecure,
    sameSite: securityConfig.cookieSameSite,
    domain: securityConfig.cookieDomain,
  } as const;

  ['/api/auth', '/api', '/'].forEach((path) => {
    res.clearCookie(LEGACY_CSRF_COOKIE_NAME, { ...baseOptions, path });
  });
};

export const issueCsrfToken = (res: Response, existingToken?: string): string => {
  clearLegacyCsrfCookies(res);
  const csrfToken = existingToken || crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions());
  return csrfToken;
};

export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  if (req.path === '/api/auth/csrf') {
    next();
    return;
  }

  const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME] || req.cookies?.[LEGACY_CSRF_COOKIE_NAME];
  const csrfHeader = req.headers[CSRF_HEADER_NAME] as string | undefined;

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    res.status(403).json({ message: 'Invalid CSRF token' });
    return;
  }

  next();
};

export const getCsrfToken = (req: Request, res: Response): void => {
  const csrfToken = issueCsrfToken(res, req.cookies?.[CSRF_COOKIE_NAME] || req.cookies?.[LEGACY_CSRF_COOKIE_NAME]);
  res.status(200).json({ csrfToken });
};