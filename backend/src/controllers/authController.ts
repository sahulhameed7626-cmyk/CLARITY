import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/db';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest, UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'CLARITY_super_secret_jwt_key_2026_clarity';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 400, 'An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole: UserRole = role === 'TEACHER' ? 'TEACHER' : 'STUDENT';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role as UserRole },
      JWT_SECRET,
      { expiresIn: '7d' as any }
    );

    const { password: _, ...userWithoutPassword } = user;

    return sendSuccess(res, 201, 'User registered successfully', {
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    return sendError(res, 500, 'Registration failed', error.message);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role as UserRole },
      JWT_SECRET,
      { expiresIn: '7d' as any }
    );

    const { password: _, ...userWithoutPassword } = user;

    return sendSuccess(res, 200, 'Login successful', {
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    return sendError(res, 500, 'Login failed', error.message);
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return sendSuccess(res, 200, 'User profile retrieved', userWithoutPassword);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch user profile', error.message);
  }
};
