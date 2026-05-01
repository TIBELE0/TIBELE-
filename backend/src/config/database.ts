import prisma from './prisma';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected successfully');
  } catch (error) {
    logger.error({ err: error }, 'PostgreSQL connection error');
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('PostgreSQL disconnected');
  } catch (error) {
    logger.error({ err: error }, 'PostgreSQL disconnection error');
  }
};
