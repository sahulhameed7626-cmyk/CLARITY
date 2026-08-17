import { Router } from 'express';
import { searchCourses } from '../controllers/searchController';

const router = Router();

router.get('/', searchCourses);

export default router;
