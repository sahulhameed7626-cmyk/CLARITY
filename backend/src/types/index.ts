import { Request } from 'express';

export type UserRole = 'STUDENT' | 'TEACHER';

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}
