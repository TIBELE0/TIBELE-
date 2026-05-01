interface BackendStartupReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
  snapshot: {
    nodeEnv: string;
    port: string;
    authProvider: string;
    hasDatabaseUrl: boolean;
    hasSupabaseUrl: boolean;
    hasSupabaseSecretKey: boolean;
    hasJwtSecret: boolean;
    hasRefreshSecret: boolean;
    corsOrigins: string[];
  };
}

const parseOrigins = (): string[] => {
  const rawOrigins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:5173';
  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const validateBackendStartupConfig = (): BackendStartupReport => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = process.env.PORT || '5000';
  const authProvider = process.env.AUTH_PROVIDER || 'local';
  const databaseUrl = process.env.DATABASE_URL || '';
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || '';
  const jwtSecret = process.env.JWT_SECRET || '';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || '';
  const corsOrigins = parseOrigins();

  const portNumber = Number(port);
  if (!Number.isInteger(portNumber) || portNumber <= 0 || portNumber > 65535) {
    errors.push(`PORT invalide: "${port}".`);
  }

  if (!databaseUrl) {
    errors.push('DATABASE_URL manquant (PostgreSQL requis).');
  }

  if (authProvider === 'supabase') {
    if (!supabaseUrl) {
      errors.push('SUPABASE_URL manquant pour AUTH_PROVIDER=supabase.');
    }

    if (!supabaseSecretKey) {
      errors.push('SUPABASE_SECRET_KEY manquant pour AUTH_PROVIDER=supabase.');
    }
  }

  if (!jwtSecret) {
    errors.push('JWT_SECRET manquant.');
  }

  if (!jwtRefreshSecret) {
    errors.push('JWT_REFRESH_SECRET manquant.');
  }

  if (jwtSecret && jwtSecret.length < 32) {
    warnings.push('JWT_SECRET est court (< 32 caracteres).');
  }

  if (jwtRefreshSecret && jwtRefreshSecret.length < 32) {
    warnings.push('JWT_REFRESH_SECRET est court (< 32 caracteres).');
  }

  if (corsOrigins.length === 0) {
    errors.push('Aucune origine CORS configuree.');
  }

  corsOrigins.forEach((origin) => {
    if (origin === '*') {
      warnings.push('CORS_ORIGINS contient "*" (ouvert).');
      return;
    }

    try {
      const parsed = new URL(origin);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        errors.push(`Origine CORS invalide (protocole): ${origin}`);
      }
    } catch {
      errors.push(`Origine CORS invalide (URL): ${origin}`);
    }
  });

  if (nodeEnv === 'production' && process.env.COOKIE_SECURE !== 'true') {
    warnings.push('COOKIE_SECURE devrait etre true en production.');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    snapshot: {
      nodeEnv,
      port,
      authProvider,
      hasDatabaseUrl: Boolean(databaseUrl),
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasSupabaseSecretKey: Boolean(supabaseSecretKey),
      hasJwtSecret: Boolean(jwtSecret),
      hasRefreshSecret: Boolean(jwtRefreshSecret),
      corsOrigins,
    },
  };
};
