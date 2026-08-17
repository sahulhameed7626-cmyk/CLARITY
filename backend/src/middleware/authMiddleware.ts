import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthPayload, UserRole } from '../types';
import { sendError } from '../utils/response';

const JWT_SECRET = process.env.JWT_SECRET || 'edulearn_super_secret_jwt_key_2026_clarity';

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Authentication token missing or invalid');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired authentication token', error);
  }
};

export const requireRole = (requiredRole: UserRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, 'User authentication required');
    }

    if (req.user.role !== requiredRole) {
      return sendError(res, 403, `Access denied. Requires ${requiredRole} role.`);
    }

    next();
  };
};
