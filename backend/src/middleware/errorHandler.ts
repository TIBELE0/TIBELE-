import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface CustomError extends Error {
  status?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error({ status, message, stack: err.stack, path: req.path, method: req.method }, 'Unhandled error');

  res.status(status).json({
    status,
    message,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
};
