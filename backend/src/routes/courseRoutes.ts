import { Router } from 'express';
import {
  getAllCourses,
  getCourseById,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  getRoadmapByCourse,
  createRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
  getSubtopicsByCourse,
  createSubtopic,
  updateSubtopic,
  deleteSubtopic,
  getVideosByCourse,
  createVideo,
  updateVideo,
  deleteVideo,
  getWebsitesByCourse,
  createWebsite,
  updateWebsite,
  deleteWebsite,
} from '../controllers/courseController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public Course routes
router.get('/', getAllCourses);
router.get('/slug/:slug', getCourseBySlug);
router.get('/:id', getCourseById);

// Teacher Course routes
router.post('/', requireAuth, requireRole('TEACHER'), createCourse);
router.put('/:id', requireAuth, requireRole('TEACHER'), updateCourse);
router.delete('/:id', requireAuth, requireRole('TEACHER'), deleteCourse);

// Roadmap routes
router.get('/:courseId/roadmap', getRoadmapByCourse);
router.post('/:courseId/roadmap', requireAuth, requireRole('TEACHER'), createRoadmapItem);
router.put('/roadmap/:id', requireAuth, requireRole('TEACHER'), updateRoadmapItem);
router.delete('/roadmap/:id', requireAuth, requireRole('TEACHER'), deleteRoadmapItem);

// Subtopics routes
router.get('/:courseId/subtopics', getSubtopicsByCourse);
router.post('/:courseId/subtopics', requireAuth, requireRole('TEACHER'), createSubtopic);
router.put('/subtopics/:id', requireAuth, requireRole('TEACHER'), updateSubtopic);
router.delete('/subtopics/:id', requireAuth, requireRole('TEACHER'), deleteSubtopic);

// Video routes
router.get('/:courseId/videos', getVideosByCourse);
router.post('/:courseId/videos', requireAuth, requireRole('TEACHER'), createVideo);
router.put('/videos/:id', requireAuth, requireRole('TEACHER'), updateVideo);
router.delete('/videos/:id', requireAuth, requireRole('TEACHER'), deleteVideo);

// Website routes
router.get('/:courseId/websites', getWebsitesByCourse);
router.post('/:courseId/websites', requireAuth, requireRole('TEACHER'), createWebsite);
router.put('/websites/:id', requireAuth, requireRole('TEACHER'), updateWebsite);
router.delete('/websites/:id', requireAuth, requireRole('TEACHER'), deleteWebsite);

export default router;
