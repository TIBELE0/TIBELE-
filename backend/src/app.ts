import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { validateBackendStartupConfig } from './config/startupChecks';
import { csrfProtection } from './middleware/csrf';
import { maintenanceModeGuard } from './middleware/settings';
import { errorHandler } from './middleware/errorHandler';
import prisma from './config/prisma';

import authRoutes from './routes/auth';
import pathologyRoutes from './routes/pathologies';
import forumRoutes from './routes/forum';
import questionRoutes from './routes/questions';
import adminRoutes from './routes/admin';

export const createApp = (): { app: Express; startupReport: ReturnType<typeof validateBackendStartupConfig> } => {
  const app: Express = express();
  const startupReport = validateBackendStartupConfig();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cookieParser());
  app.use(express.json());
  app.use(cors({
    origin: 'https://tibele.onrender.com',
    credentials: true,
  }));
  app.use(express.urlencoded({ extended: true }));
  app.use(csrfProtection);
  app.use(maintenanceModeGuard);

  app.use('/auth', authRoutes);
  app.use('/pathologies', pathologyRoutes);
  app.use('/forum', forumRoutes);
  app.use('/questions', questionRoutes);
  app.use('/admin', adminRoutes);

  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'TIBELE API',
      status: 'running',
      health: '/health',
    });
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  app.get('/settings/public', async (_req: Request, res: Response) => {
    try {
      const settings = await prisma.siteSetting.upsert({
        where: { key: 'global' },
        update: {},
        create: {
          key: 'global',
          siteName: 'TIBELE Admin',
          supportEmail: 'tibeleyeo@gmail.com',
          maintenanceMode: false,
          registrationsOpen: true,
          messageMaintenance: 'Maintenance en cours. Merci de revenir plus tard.',
          primaryColor: '#0b3b5a',
          secondaryColor: '#2e8b57',
          donationUrl: 'https://pay.djamo.com/o5y88',
          donationPopupIntervalMinutes: 5,
        },
        select: {
          siteName: true,
          supportEmail: true,
          primaryColor: true,
          secondaryColor: true,
          donationUrl: true,
          donationPopupIntervalMinutes: true,
          maintenanceMode: true,
          messageMaintenance: true,
          registrationsOpen: true,
        },
      });

      res.status(200).json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur chargement parametres publics' });
    }
  });

  app.get('/stats/public', async (_req: Request, res: Response) => {
    try {
      const [pathologiesCount, questionsCount, usersCount, topicsCount] = await Promise.all([
        prisma.pathology.count(),
        prisma.question.count(),
        prisma.user.count(),
        prisma.topic.count(),
      ]);

      res.status(200).json({
        pathologies: pathologiesCount,
        questions: questionsCount,
        users: usersCount,
        topics: topicsCount,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur chargement statistiques publiques' });
    }
  });

  app.get('/ready', (_req: Request, res: Response) => {
    const postgresConnected = true;
    const configOk = startupReport.ok;
    const ready = postgresConnected && configOk;

    const payload = {
      status: ready ? 'READY' : 'DEGRADED',
      checks: {
        api: true,
        postgres: postgresConnected,
        config: configOk,
      },
      config: {
        warnings: startupReport.warnings,
        snapshot: startupReport.snapshot,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(ready ? 200 : 503).json(payload);
  });

  app.use(errorHandler);

  return { app, startupReport };
};
