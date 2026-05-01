import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';

const resolveAdminBootstrapConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const passwordPlain = process.env.ADMIN_PASSWORD?.trim();
  const fullName = process.env.ADMIN_FULLNAME?.trim() || 'Administrateur TIBELE';

  if (env === 'production') {
    if (!email || !passwordHash) {
      return null;
    }

    return {
      email,
      fullName,
      passwordHash,
    };
  }

  if (process.env.ALLOW_DEV_ADMIN_SEED !== 'true') {
    return null;
  }

  if (!email || (!passwordHash && !passwordPlain)) {
    return null;
  }

  return {
    email,
    fullName,
    passwordHash,
    passwordPlain,
  };
};

export const ensureSingleAdminAccount = async (): Promise<void> => {
  const config = resolveAdminBootstrapConfig();
  if (!config) {
    return;
  }

  const salt = parseInt(process.env.BCRYPT_SALT || '12', 10);
  const hashedPassword = config.passwordHash || await bcrypt.hash(config.passwordPlain as string, salt);

  const existingAdmin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (existingAdmin && existingAdmin.email !== config.email) {
    return;
  }

  await prisma.user.upsert({
    where: { email: config.email },
    create: {
      email: config.email,
      passwordHash: hashedPassword,
      fullName: config.fullName,
      matricule: process.env.ADMIN_MATRICULE || 'MED000000',
      school: process.env.ADMIN_SCHOOL || 'Administration TIBELE',
      studyYear: process.env.ADMIN_STUDY_YEAR || 'N/A',
      major: process.env.ADMIN_MAJOR || 'Administration',
      matriculeValidated: true,
      role: 'admin',
    },
    update: {
      passwordHash: hashedPassword,
      fullName: config.fullName,
      matricule: process.env.ADMIN_MATRICULE || 'MED000000',
      school: process.env.ADMIN_SCHOOL || 'Administration TIBELE',
      studyYear: process.env.ADMIN_STUDY_YEAR || 'N/A',
      major: process.env.ADMIN_MAJOR || 'Administration',
      matriculeValidated: true,
      role: 'admin',
    },
  });
};
