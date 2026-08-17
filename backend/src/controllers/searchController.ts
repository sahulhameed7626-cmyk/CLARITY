import { Request, Response } from 'express';
import { prisma } from '../database/db';
import { sendSuccess, sendError } from '../utils/response';

export const searchCourses = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim() === '') {
      const allCourses = await prisma.course.findMany({
        include: {
          roadmapItems: { orderBy: { orderIndex: 'asc' } },
          subtopics: { orderBy: { orderIndex: 'asc' } },
          videos: { orderBy: { createdAt: 'asc' } },
          websites: { orderBy: { createdAt: 'asc' } },
        },
      });
      return sendSuccess(res, 200, 'Search query empty, returning all courses', allCourses);
    }

    const searchTerm = query.trim().toLowerCase();

    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm } },
          { shortDescription: { contains: searchTerm } },
          { overview: { contains: searchTerm } },
          {
            subtopics: {
              some: {
                title: { contains: searchTerm },
              },
            },
          },
        ],
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        roadmapItems: { orderBy: { orderIndex: 'asc' } },
        subtopics: { orderBy: { orderIndex: 'asc' } },
        videos: { orderBy: { createdAt: 'asc' } },
        websites: { orderBy: { createdAt: 'asc' } },
      },
    });

    return sendSuccess(res, 200, `Found ${courses.length} courses matching '${query}'`, courses);
  } catch (error: any) {
    return sendError(res, 500, 'Search failed', error.message);
  }
};
