import { Request, Response, NextFunction } from 'express';
import { FallbackAuthService } from './fallbackAuth';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddlewareFallback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = FallbackAuthService.verifyToken(token);
    const user = await FallbackAuthService.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

export const optionalAuthFallback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;

    if (token) {
      const decoded = FallbackAuthService.verifyToken(token);
      const user = await FallbackAuthService.getUserById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};