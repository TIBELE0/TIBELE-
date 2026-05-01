import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (userId: string, role: string = 'user'): string => {
  const payload: TokenPayload = { userId, role };
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRE || '15m';

  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }

  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

export const generateRefreshToken = (userId: string, role: string = 'user'): string => {
  const payload: TokenPayload = { userId, role };
  const secret = process.env.JWT_REFRESH_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRE || '7d';

  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is required');
  }

  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is required');
    }
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
