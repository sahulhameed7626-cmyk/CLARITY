import { Response } from 'express';
import { prisma } from '../database/db';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const getTeacherCourses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const teacherId = req.user?.userId;
    if (!teacherId) return sendError(res, 401, 'Unauthorized');

    const courses = await prisma.course.findMany({
      where: { createdBy: teacherId },
      include: {
        roadmapItems: { orderBy: { orderIndex: 'asc' } },
        subtopics: { orderBy: { orderIndex: 'asc' } },
        videos: true,
        websites: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 200, 'Teacher courses retrieved successfully', courses);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch teacher courses', error.message);
  }
};

export const createFullCourseTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      shortDescription,
      overview,
      difficulty = 'Beginner',
      estimatedDuration = '6 Weeks',
      prerequisites = 'None',
      pdfUrl,
      pdfName,
      roadmap = [],
      subtopics = [],
      videos = [],
      websites = [],
    } = req.body;

    if (!title || !shortDescription || !overview) {
      return sendError(res, 400, 'Title, short description, and overview are required');
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString().slice(-4)}`;
    const teacherId = req.user?.userId || 'teacher-1';

    const result = await prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          title,
          slug,
          shortDescription,
          overview,
          difficulty,
          estimatedDuration,
          prerequisites,
          pdfUrl: pdfUrl || null,
          pdfName: pdfName || (pdfUrl ? `${title} Study Notes.pdf` : null),
          createdBy: teacherId,
        },
      });

      if (Array.isArray(roadmap) && roadmap.length > 0) {
        await tx.roadmapItem.createMany({
          data: roadmap.map((item: any, idx: number) => ({
            courseId: course.id,
            title: item.title,
            description: item.description || '',
            orderIndex: idx,
          })),
        });
      }

      if (Array.isArray(subtopics) && subtopics.length > 0) {
        await tx.subtopic.createMany({
          data: subtopics.map((sub: any, idx: number) => ({
            courseId: course.id,
            title: sub.title,
            description: sub.description || '',
            content: sub.content || '',
            difficulty: sub.difficulty || difficulty,
            orderIndex: idx,
          })),
        });
      }

      if (Array.isArray(videos) && videos.length > 0) {
        await tx.videoResource.createMany({
          data: videos.map((vid: any) => ({
            courseId: course.id,
            title: vid.title,
            youtubeUrl: vid.youtubeUrl,
            thumbnailUrl: vid.thumbnailUrl || null,
            channelName: vid.channelName || 'Instructor Video',
          })),
        });
      }

      if (Array.isArray(websites) && websites.length > 0) {
        await tx.websiteResource.createMany({
          data: websites.map((web: any) => ({
            courseId: course.id,
            name: web.name,
            url: web.url,
            logoUrl: web.logoUrl || 'fa-globe',
            description: web.description || 'Added by course teacher',
          })),
        });
      }

      return tx.course.findUnique({
        where: { id: course.id },
        include: {
          roadmapItems: { orderBy: { orderIndex: 'asc' } },
          subtopics: { orderBy: { orderIndex: 'asc' } },
          videos: true,
          websites: true,
        },
      });
    });

    return sendSuccess(res, 201, 'Full course created successfully by teacher', result);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to create full course', error.message);
  }
};
