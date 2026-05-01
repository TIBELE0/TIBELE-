import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { ensureSingleAdminAccount } from './services/adminBootstrapService';
import { createApp } from './app';
import { logger } from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 5000;
const { app, startupReport } = createApp();

// Start server
const startServer = async () => {
  try {
    if (!startupReport.ok) {
      logger.error({ errors: startupReport.errors }, 'Startup configuration invalid');
      process.exit(1);
    }

    if (startupReport.warnings.length > 0) {
      logger.warn({ warnings: startupReport.warnings }, 'Startup configuration warnings');
    }

    await connectDB();
    await ensureSingleAdminAccount();
    app.listen(PORT, () => {
      logger.info({ port: PORT }, 'Server running');
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
