import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../config/prisma';

const isAdminRequest = (req: AuthRequest): boolean => {
  if (req.userRole === 'admin') {
    return true;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return false;
  }

  const decoded = verifyAccessToken(token);
  return decoded?.role === 'admin';
};

export const maintenanceModeGuard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const bypassPaths = ['/api/health', '/api/ready', '/api/settings/public', '/api/auth/login', '/api/auth/csrf', '/api/auth/refresh'];
    if (bypassPaths.includes(req.path)) {
      next();
      return;
    }

    const settings = await prisma.siteSetting.findUnique({
      where: { key: 'global' },
      select: { maintenanceMode: true, messageMaintenance: true },
    });
    if (!settings || !settings.maintenanceMode) {
      next();
      return;
    }

    if (isAdminRequest(req)) {
      next();
      return;
    }

    res.status(503).json({
      message: settings.messageMaintenance || 'Maintenance en cours',
      maintenanceMode: true,
    });
  } catch {
    next();
  }
};
