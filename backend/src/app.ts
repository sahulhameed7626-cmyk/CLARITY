import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import teacherRoutes from './routes/teacherRoutes';
import searchRoutes from './routes/searchRoutes';
import chatRoutes from './routes/chatRoutes';
import progressRoutes from './routes/progressRoutes';

dotenv.config();

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

app.use('/api', apiLimiter);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', service: 'CLARITY Unified Single-Server API', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/progress', progressRoutes);

// Static Middleware serving Frontend Single-Page App
const frontendPath = path.resolve(process.cwd(), '../frontend');
console.log('Serving static frontend assets from:', frontendPath);

app.use(express.static(frontendPath));

// Wildcard SPA Fallback
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`  🚀 CLARITY Server Running on http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
}

export default app;
