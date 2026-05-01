import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User as PrismaUser } from '@prisma/client';
import prisma from '../config/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { isStrongPassword, isValidEmail, isValidHealthStudentMatricule } from '../utils/validators';

// Compatibility alias: expose password field as-is for internal use
type IUser = PrismaUser & { password?: string };

interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  matricule: string;
  school: string;
  studyYear?: string;
  major: string;
  category?: 'student' | 'professional' | 'other';
  profession?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<PrismaUser, 'passwordHash' | 'refreshTokenHash' | 'refreshTokenExpiresAt'>;
}

const getRefreshTokenExpiry = (): Date => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return expiry;
};

const hashRefreshToken = (refreshToken: string): string => {
  return crypto.createHash('sha256').update(refreshToken).digest('hex');
};

const sanitizeUser = (user: PrismaUser) => {
  const { passwordHash, refreshTokenHash, refreshTokenExpiresAt, ...safe } = user;
  return safe;
};

const issueTokensForUser = async (user: PrismaUser): Promise<AuthResponse> => {
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const refreshTokenExpiresAt = getRefreshTokenExpiry();

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash, refreshTokenExpiresAt },
  });

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  };
};

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { email, password, fullName, matricule, school, studyYear, major } = payload;

    // Validation
    if (!isValidEmail(email)) {
      throw new Error('Format d\'adresse e-mail invalide');
    }

    if (!isStrongPassword(password)) {
      throw new Error('Le mot de passe doit contenir au moins 8 caracteres, 1 majuscule, 1 minuscule et 1 chiffre');
    }

    if (!isValidHealthStudentMatricule(matricule)) {
      throw new Error('Matricule invalide. Formats acceptes: MED, INF, PHAR suivis de chiffres.');
    }

    if (!school?.trim()) {
      throw new Error('Ecole / Universite obligatoire');
    }

    if (!major?.trim()) {
      throw new Error('Filiere obligatoire');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Cette adresse e-mail est deja utilisee');
    }

    const existingMatricule = await prisma.user.findFirst({ where: { matricule: matricule.toUpperCase() } });
    if (existingMatricule) {
      throw new Error('Ce matricule est deja utilise');
    }

    // Hash password
    const salt = parseInt(process.env.BCRYPT_SALT || '12', 10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
        matricule: matricule.toUpperCase(),
        school: school.trim(),
        studyYear: studyYear?.trim() || undefined,
        major: major.trim(),
        category: payload.category,
        profession: payload.profession?.trim() || undefined,
        matriculeValidated: false,
        role: 'user',
      },
    });

    return issueTokensForUser(user);
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { email, password } = payload;

    // Validation
    if (!isValidEmail(email)) {
      throw new Error('Format d\'adresse e-mail invalide');
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('E-mail ou mot de passe incorrect');
    }

    if (user.isBanned) {
      throw new Error('Compte suspendu. Contactez le support.');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('E-mail ou mot de passe incorrect');
    }

    return issueTokensForUser(user);
  },

  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error('Jeton de session invalide ou expire');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
      throw new Error('Session introuvable');
    }

    if (user.refreshTokenExpiresAt < new Date()) {
      throw new Error('Jeton de session expire');
    }

    const incomingHash = hashRefreshToken(refreshToken);
    if (incomingHash !== user.refreshTokenHash) {
      throw new Error('Jeton de session invalide');
    }

    return issueTokensForUser(user);
  },

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return;
    }

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { refreshTokenHash: null, refreshTokenExpiresAt: null },
    });
  },

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    return sanitizeUser(user);
  },

  async updateUserProfile(
    userId: string,
    payload: { fullName?: string; school?: string; studyYear?: string; major?: string; category?: 'student' | 'professional' | 'other'; profession?: string }
  ) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(payload.fullName !== undefined ? { fullName: payload.fullName.trim() } : {}),
          ...(payload.school !== undefined ? { school: payload.school.trim() } : {}),
          ...(payload.studyYear !== undefined ? { studyYear: payload.studyYear.trim() } : {}),
          ...(payload.major !== undefined ? { major: payload.major.trim() } : {}),
          ...(payload.category !== undefined ? { category: payload.category } : {}),
          ...(payload.profession !== undefined ? { profession: payload.profession.trim() } : {}),
        },
      });
      return sanitizeUser(user);
    } catch {
      throw new Error('Utilisateur introuvable');
    }
  },

  async updateUserSubscription(userId: string, isPaid: boolean, subscriptionExpiryDate: Date | null) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isPaid, subscriptionExpiryDate },
      });
      return sanitizeUser(user);
    } catch {
      throw new Error('Utilisateur introuvable');
    }
  },

  async isSubscriptionActive(user: PrismaUser): Promise<boolean> {
    if (!user.isPaid) {
      return false;
    }

    if (!user.subscriptionExpiryDate) {
      return true;
    }

    return new Date() <= new Date(user.subscriptionExpiryDate);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (!isStrongPassword(newPassword)) {
      throw new Error('Le mot de passe doit contenir au moins 8 caracteres, 1 majuscule, 1 minuscule et 1 chiffre');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('Mot de passe actuel incorrect');
    }

    const salt = parseInt(process.env.BCRYPT_SALT || '12', 10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
    });
  },
};
