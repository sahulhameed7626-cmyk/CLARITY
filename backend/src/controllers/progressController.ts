import { Response } from 'express';
import { prisma } from '../database/db';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const getStudentProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const progressRecords = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            difficulty: true,
          },
        },
        subtopic: true,
      },
    });

    return sendSuccess(res, 200, 'Student progress retrieved', progressRecords);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch progress', error.message);
  }
};

export const updateStudentCourseProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { courseId } = req.params;
    const { subtopicId, isCompleted = true } = req.body;

    if (!userId) return sendError(res, 401, 'Unauthorized');

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return sendError(res, 404, 'Course not found');

    if (!subtopicId) {
      return sendError(res, 400, 'Subtopic ID is required');
    }

    const record = await prisma.userProgress.upsert({
      where: {
        userId_subtopicId: {
          userId,
          subtopicId,
        },
      },
      update: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId,
        courseId,
        subtopicId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return sendSuccess(res, 200, 'Progress updated successfully', record);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to update progress', error.message);
  }
};
