import { Router } from 'express';
import { getTeacherCourses, createFullCourseTransaction } from '../controllers/teacherController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth, requireRole('TEACHER'));

router.get('/courses', getTeacherCourses);
router.post('/courses', createFullCourseTransaction);

export default router;
