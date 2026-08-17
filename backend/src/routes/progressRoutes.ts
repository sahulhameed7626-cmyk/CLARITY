import { Router } from 'express';
import { getStudentProgress, updateStudentCourseProgress } from '../controllers/progressController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', getStudentProgress);
router.post('/:courseId', updateStudentCourseProgress);
router.put('/:courseId', updateStudentCourseProgress);

export default router;
