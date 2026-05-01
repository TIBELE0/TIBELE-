import { Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { forumService } from '../services/forumService';
import { createSlug } from '../utils/validators';

const sanitizeUser = (user: any) => {
  const { passwordHash, refreshTokenHash, refreshTokenExpiresAt, ...safe } = user;
  return safe;
};

const mapTopic = (topic: any) => ({
  ...topic,
  _id: topic.id,
  author: topic.author
    ? {
      _id: topic.author.id,
      id: topic.author.id,
      fullName: topic.author.fullName,
      email: topic.author.email,
    }
    : null,
  pathology: topic.pathology
    ? {
      _id: topic.pathology.id,
      id: topic.pathology.id,
      title: topic.pathology.title,
      slug: topic.pathology.slug,
    }
    : null,
});

const mapMessage = (message: any) => ({
  ...message,
  _id: message.id,
  author: message.author
    ? {
      _id: message.author.id,
      id: message.author.id,
      fullName: message.author.fullName,
      email: message.author.email,
    }
    : null,
  topic: message.topic
    ? {
      _id: message.topic.id,
      id: message.topic.id,
      title: message.topic.title,
    }
    : null,
  parentMessage: message.parentMessage
    ? {
      _id: message.parentMessage.id,
      id: message.parentMessage.id,
    }
    : null,
});

const logAdminAction = async (
  req: AuthRequest,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, unknown>,
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: req.userId,
        actorEmail: (req as any).userEmail,
        action,
        resource,
        resourceId,
        details: details as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    // Ignore audit failures to avoid blocking admin flows.
  }
};

export const getAdminDashboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalClients,
      totalPathologies,
      totalQuestions,
      totalTopics,
      totalMessages,
      pendingMatricules,
      bannedUsers,
      recentUsers,
      recentTopics,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'user' } }),
      prisma.pathology.count(),
      prisma.question.count(),
      prisma.topic.count(),
      prisma.message.count(),
      prisma.user.count({ where: { role: 'user', matriculeValidated: false } }),
      prisma.user.count({ where: { role: 'user', isBanned: true } }),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          matriculeValidated: true,
          isBanned: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.topic.findMany({
        include: {
          author: { select: { id: true, fullName: true, email: true } },
          pathology: { select: { id: true, title: true, slug: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        take: 8,
      }),
    ]);

    res.status(200).json({
      overview: {
        totalUsers,
        totalClients,
        totalPathologies,
        totalQuestions,
        totalTopics,
        totalMessages,
        pendingMatricules,
        bannedUsers,
      },
      recentUsers: recentUsers.map((u) => ({ ...u, _id: u.id })),
      recentTopics: recentTopics.map(mapTopic),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erreur dashboard administrateur' });
  }
};

export const getAdminUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 20, 1), 100);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const skip = (page - 1) * limit;
    const where = search
      ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { matricule: { contains: search, mode: 'insensitive' as const } },
          { school: { contains: search, mode: 'insensitive' as const } },
          { major: { contains: search, mode: 'insensitive' as const } },
        ],
      }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      users: users.map((u) => ({ ...sanitizeUser(u), _id: u.id })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erreur liste utilisateurs admin' });
  }
};

export const updateClientSubscription = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(410).json({ message: 'Le module abonnement est retire. Utilisez les dons externes.' });
};

export const getAdminForumMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 20, 1), 100);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const skip = (page - 1) * limit;
    const where = search
      ? { content: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          author: { select: { id: true, fullName: true, email: true } },
          topic: { select: { id: true, title: true } },
          parentMessage: { select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where }),
    ]);

    res.status(200).json({
      messages: messages.map(mapMessage),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erreur moderation messages admin' });
  }
};

export const deleteAdminForumMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Authentification requise' });
      return;
    }

    const { id } = req.params;
    await forumService.deleteMessage(id, req.userId, 'admin');
    await logAdminAction(req, 'delete_message', 'forum_message', id);
    res.status(200).json({ message: 'Message supprime par moderation' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Suppression du message impossible' });
  }
};

export const setTopicPinned = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body as { isPinned: boolean };

    let topic: any;
    try {
      topic = await prisma.topic.update({
        where: { id },
        data: { isPinned: Boolean(isPinned) },
        include: {
          author: { select: { id: true, fullName: true, email: true } },
          pathology: { select: { id: true, title: true, slug: true } },
        },
      });
    } catch {
      res.status(404).json({ message: 'Sujet introuvable' });
      return;
    }

    await logAdminAction(req, isPinned ? 'pin_topic' : 'unpin_topic', 'forum_topic', id, { isPinned: Boolean(isPinned) });
    res.status(200).json({ message: 'Statut d epinglage mis a jour', topic: mapTopic(topic) });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Mise a jour epinglage impossible' });
  }
};

export const getAdminBillingOverview = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    mode: 'donation_only',
    message: 'Le module paiement est retire. Les dons passent par un lien externe Djamo.',
    overview: {
      totalRevenueXof: 0,
      pendingIntents: 0,
      failedIntents: 0,
    },
    monthlyRevenue: [],
    intents: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 1 },
  });
};

export const updatePaymentIntentStatus = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(410).json({ message: 'Paiements internes retires. Aucun status a modifier.' });
};

export const getAdminSiteSettings = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await prisma.siteSetting.upsert({
      where: { key: 'global' },
      update: {},
      create: {
        key: 'global',
        siteName: 'TIBELE Admin',
        supportEmail: 'support@tibele.local',
        maintenanceMode: false,
        registrationsOpen: true,
        messageMaintenance: 'Maintenance en cours. Merci de revenir plus tard.',
        primaryColor: '#0b3b5a',
        secondaryColor: '#2e8b57',
        donationUrl: 'https://pay.djamo.com/o5y88',
        donationPopupIntervalMinutes: 5,
      },
    });

    res.status(200).json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erreur chargement parametres site' });
  }
};

export const updateAdminSiteSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowed = [
      'siteName',
      'supportEmail',
      'maintenanceMode',
      'registrationsOpen',
      'messageMaintenance',
      'primaryColor',
      'secondaryColor',
      'donationUrl',
      'donationPopupIntervalMinutes',
    ];
    const payload = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) => allowed.includes(key))
    ) as Record<string, unknown>;

    if (typeof payload.donationPopupIntervalMinutes !== 'undefined') {
      const interval = Number(payload.donationPopupIntervalMinutes);
      payload.donationPopupIntervalMinutes = Number.isFinite(interval)
        ? Math.min(Math.max(interval, 1), 120)
        : 5;
    }

    const settings = await prisma.siteSetting.upsert({
      where: { key: 'global' },
      create: {
        key: 'global',
        ...(payload as any),
      },
      update: payload as any,
    });

    await logAdminAction(req, 'update_settings', 'site_settings', 'global', payload);
    res.status(200).json({ message: 'Parametres site mis a jour', settings });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Mise a jour parametres impossible' });
  }
};

export const getAdminAdvancedAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const periodDays = Number((req as any).query?.periodDays) || 90;
    const safePeriodDays = [7, 30, 90].includes(periodDays) ? periodDays : 90;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - safePeriodDays);

    const [
      totalUsers,
      totalAdmins,
      totalClients,
      bannedUsers,
      pendingMatricules,
      pathologies,
      sessions,
      topics,
      messages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { role: 'user' } }),
      prisma.user.count({ where: { role: 'user', isBanned: true } }),
      prisma.user.count({ where: { role: 'user', matriculeValidated: false } }),
      prisma.pathology.findMany({ select: { groupe: true } }),
      prisma.trainingSession.findMany({ where: { createdAt: { gte: fromDate } } }),
      prisma.topic.findMany({ where: { createdAt: { gte: fromDate } }, select: { createdAt: true } }),
      prisma.message.findMany({ where: { createdAt: { gte: fromDate } }, select: { createdAt: true } }),
    ]);

    const userRoleDistribution = [
      { name: 'Admins', value: totalAdmins },
      { name: 'Etudiants', value: totalClients },
    ];

    const subscriptionDistribution = [
      { name: 'Valides', value: Math.max(totalClients - pendingMatricules, 0) },
      { name: 'Validation en attente', value: pendingMatricules },
      { name: 'Bannis', value: bannedUsers },
    ];

    const paymentMethodDistribution = [
      { name: 'Dons externes Djamo', value: 1 },
    ];

    const groupMap = new Map<string, number>();
    pathologies.forEach((p) => {
      const key = p.groupe || 'Autres';
      groupMap.set(key, (groupMap.get(key) || 0) + 1);
    });
    const pathologyGroupDistribution = Array.from(groupMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);

    const completed = sessions.filter((s) => s.status === 'completed');
    const trainingOverview = {
      totalSessions: sessions.length,
      completedSessions: completed.length,
      avgScore: Math.round(completed.reduce((sum, s) => sum + s.scorePercentage, 0) / Math.max(completed.length, 1)),
    };

    const modeMap = new Map<string, number>();
    sessions.forEach((s) => {
      modeMap.set(s.mode, (modeMap.get(s.mode) || 0) + 1);
    });
    const trainingModeDistribution = Array.from(modeMap.entries()).map(([name, value]) => ({ name, value }));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (safePeriodDays - 1));
    startDate.setHours(0, 0, 0, 0);

    const toKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const topicMap = new Map<string, number>();
    const messageMap = new Map<string, number>();

    topics.forEach((t) => {
      const k = toKey(t.createdAt);
      topicMap.set(k, (topicMap.get(k) || 0) + 1);
    });

    messages.forEach((m) => {
      const k = toKey(m.createdAt);
      messageMap.set(k, (messageMap.get(k) || 0) + 1);
    });

    const forumActivity = Array.from({ length: safePeriodDays }).map((_, index) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + index);
      const key = toKey(d);

      return {
        label: safePeriodDays === 7
          ? d.toLocaleDateString('fr-FR', { weekday: 'short' })
          : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        topics: topicMap.get(key) || 0,
        messages: messageMap.get(key) || 0,
      };
    });

    res.status(200).json({
      periodDays: safePeriodDays,
      userRoleDistribution,
      subscriptionDistribution,
      paymentMethodDistribution,
      pathologyGroupDistribution,
      forumActivity,
      trainingOverview,
      trainingModeDistribution,
      totals: {
        totalUsers,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erreur analytics avancees administrateur' });
  }
};

export const deleteClientUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ message: 'Utilisateur introuvable' });
      return;
    }

    if (user.role === 'admin') {
      res.status(400).json({ message: 'Suppression du compte administrateur interdite' });
      return;
    }

    await prisma.user.delete({ where: { id: user.id } });

    await logAdminAction(req, 'delete_user', 'user', id, { email: user.email });
    res.status(200).json({ message: 'Client supprime avec ses donnees associees' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Suppression client impossible' });
  }
};

export const setUserBanStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body as { isBanned: boolean };

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ message: 'Utilisateur introuvable' });
      return;
    }

    if (user.role === 'admin') {
      res.status(400).json({ message: 'Le compte administrateur ne peut pas etre banni' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isBanned: Boolean(isBanned) },
    });

    await logAdminAction(req, isBanned ? 'ban_user' : 'unban_user', 'user', id, { isBanned: Boolean(isBanned) });
    res.status(200).json({ message: 'Statut de bannissement mis a jour', user: { ...sanitizeUser(updated), _id: updated.id } });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Mise a jour bannissement impossible' });
  }
};

export const setUserMatriculeValidation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { matriculeValidated } = req.body as { matriculeValidated: boolean };

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ message: 'Utilisateur introuvable' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { matriculeValidated: Boolean(matriculeValidated) },
    });

    await logAdminAction(req, matriculeValidated ? 'validate_matricule' : 'invalidate_matricule', 'user', id, {
      matriculeValidated: Boolean(matriculeValidated),
    });
    res.status(200).json({ message: 'Validation matricule mise a jour', user: { ...sanitizeUser(updated), _id: updated.id } });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Mise a jour validation impossible' });
  }
};

export const getAdminGroups = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const groups = await prisma.medicalGroup.findMany({ orderBy: { name: 'asc' } });
    res.status(200).json({ groups: groups.map((g) => ({ ...g, _id: g.id })) });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erreur chargement des groupes' });
  }
};

export const createAdminGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body as { name: string; description?: string };
    const normalizedName = String(name || '').trim();
    if (!normalizedName) {
      res.status(400).json({ message: 'Nom de groupe requis' });
      return;
    }

    const slug = createSlug(normalizedName);
    const group = await prisma.medicalGroup.create({
      data: { name: normalizedName, slug, description: description?.trim() || undefined },
    });
    await logAdminAction(req, 'create_group', 'medical_group', String(group.id), { name: normalizedName });
    res.status(201).json({ message: 'Groupe cree', group: { ...group, _id: group.id } });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Creation groupe impossible' });
  }
};

export const updateAdminGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body as { name?: string; description?: string };

    const payload: Record<string, unknown> = {};
    if (name !== undefined) {
      const normalized = String(name || '').trim();
      if (!normalized) {
        res.status(400).json({ message: 'Nom de groupe invalide' });
        return;
      }
      payload.name = normalized;
      payload.slug = createSlug(normalized);
    }
    if (description !== undefined) {
      payload.description = description?.trim() || null;
    }

    let group: any;
    try {
      group = await prisma.medicalGroup.update({ where: { id }, data: payload });
    } catch {
      res.status(404).json({ message: 'Groupe introuvable' });
      return;
    }

    await logAdminAction(req, 'update_group', 'medical_group', id, payload as Record<string, unknown>);
    res.status(200).json({ message: 'Groupe mis a jour', group: { ...group, _id: group.id } });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Mise a jour groupe impossible' });
  }
};

export const deleteAdminGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const group = await prisma.medicalGroup.findUnique({ where: { id } });
    if (!group) {
      res.status(404).json({ message: 'Groupe introuvable' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.pathology.updateMany({
        where: { groupe: group.name },
        data: { groupe: 'Autres' },
      });
      await tx.medicalGroup.delete({ where: { id } });
    });

    await logAdminAction(req, 'delete_group', 'medical_group', id, { name: group.name });
    res.status(200).json({ message: 'Groupe supprime. Les pathologies associees ont ete basculees dans Autres.' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Suppression groupe impossible' });
  }
};

export const getAdminAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 50, 1), 200);
    const action = typeof req.query.action === 'string' ? req.query.action.trim() : '';

    const skip = (page - 1) * limit;
    const where = action ? { action: { contains: action, mode: 'insensitive' as const } } : {};

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.auditLog.count({ where }),
    ]);

    res.status(200).json({
      logs: logs.map((l) => ({ ...l, _id: l.id })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erreur chargement audit logs' });
  }
};
