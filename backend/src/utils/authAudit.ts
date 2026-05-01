import { AuthRequest } from '../middleware/auth';

type AuditOutcome = 'success' | 'failure';

export const logAuthAudit = (
  req: AuthRequest,
  event: string,
  outcome: AuditOutcome,
  metadata?: Record<string, unknown>
): void => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : (forwardedFor?.toString().split(',')[0]?.trim() || req.ip || 'unknown');

  const payload = {
    event,
    outcome,
    userId: req.userId || null,
    ip,
    userAgent: req.get('user-agent') || 'unknown',
    metadata: metadata || {},
    timestamp: new Date().toISOString(),
  };

  const line = JSON.stringify(payload);
  if (outcome === 'failure') {
    console.warn(`[AUTH_AUDIT] ${line}`);
    return;
  }

  console.info(`[AUTH_AUDIT] ${line}`);
};