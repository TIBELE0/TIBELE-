type SameSiteValue = 'strict' | 'lax' | 'none';

const isProd = process.env.NODE_ENV === 'production';

const parseOrigins = (): string[] => {
  const rawOrigins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:5173';

  const parsed = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // In dev, allow localhost/127.0.0.1 aliases for configured ports to reduce CORS friction.
  const withAliases = parsed.flatMap((origin) => {
    try {
      const url = new URL(origin);
      const aliases = [origin];

      if (url.hostname === 'localhost') {
        aliases.push(`${url.protocol}//127.0.0.1${url.port ? `:${url.port}` : ''}`);
      }

      if (url.hostname === '127.0.0.1') {
        aliases.push(`${url.protocol}//localhost${url.port ? `:${url.port}` : ''}`);
      }

      return aliases;
    } catch {
      return [origin];
    }
  });

  return Array.from(new Set(withAliases));
};

const normalizeSameSite = (value?: string): SameSiteValue | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase();
  if (normalized === 'strict' || normalized === 'lax' || normalized === 'none') {
    return normalized;
  }

  return undefined;
};

const getSecurityConfig = () => {
  const allowedOrigins = parseOrigins();
  const configuredSameSite = normalizeSameSite(process.env.COOKIE_SAMESITE);
  const crossSiteCookies = process.env.COOKIE_CROSS_SITE === 'true' || configuredSameSite === 'none';

  return {
    isProd,
    allowedOrigins,
    cookieDomain: process.env.COOKIE_DOMAIN || undefined,
    cookieSameSite: configuredSameSite || (crossSiteCookies ? 'none' : 'lax'),
    cookieSecure: crossSiteCookies || process.env.COOKIE_SECURE === 'true' || isProd,
  };
};

export const securityConfig = {
  get isProd() {
    return getSecurityConfig().isProd;
  },
  get allowedOrigins() {
    return getSecurityConfig().allowedOrigins;
  },
  get cookieDomain() {
    return getSecurityConfig().cookieDomain;
  },
  get cookieSameSite() {
    return getSecurityConfig().cookieSameSite;
  },
  get cookieSecure() {
    return getSecurityConfig().cookieSecure;
  },
};

export const isOriginAllowed = (origin?: string): boolean => {
  const currentSecurityConfig = getSecurityConfig();

  if (!origin) {
    return true;
  }

  if (currentSecurityConfig.allowedOrigins.includes('*')) {
    return true;
  }

  return currentSecurityConfig.allowedOrigins.includes(origin);
};