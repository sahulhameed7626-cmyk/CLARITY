import { Request, Response } from 'express';
import { prisma } from '../database/db';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        roadmapItems: { orderBy: { orderIndex: 'asc' } },
        subtopics: { orderBy: { orderIndex: 'asc' } },
        videos: true,
        websites: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return sendSuccess(res, 200, 'Courses retrieved successfully', courses);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch courses', error.message);
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        roadmapItems: { orderBy: { orderIndex: 'asc' } },
        subtopics: { orderBy: { orderIndex: 'asc' } },
        videos: true,
        websites: true,
      },
    });
    if (!course) return sendError(res, 404, 'Course not found');
    return sendSuccess(res, 200, 'Course details retrieved', course);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch course', error.message);
  }
};

export const getCourseBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const course = await prisma.course.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      include: {
        roadmapItems: { orderBy: { orderIndex: 'asc' } },
        subtopics: { orderBy: { orderIndex: 'asc' } },
        videos: true,
        websites: true,
      },
    });
    if (!course) return sendError(res, 404, 'Course not found');
    return sendSuccess(res, 200, 'Course details retrieved', course);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch course details', error.message);
  }
};

export const createCourse = async (req: AuthenticatedRequest, res: Response) => {
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
    } = req.body;

    if (!title || !shortDescription || !overview) {
      return sendError(res, 400, 'Title, short description, and overview are required');
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString().slice(-4)}`;

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        shortDescription,
        overview,
        difficulty,
        estimatedDuration,
        prerequisites,
        pdfUrl: pdfUrl || null,
        pdfName: pdfName || (pdfUrl ? `${title} Lecture Notes.pdf` : null),
        createdBy: req.user?.userId || 'teacher-1',
      },
    });

    return sendSuccess(res, 201, 'Course created successfully', course);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to create course', error.message);
  }
};

export const updateCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      shortDescription,
      overview,
      difficulty,
      estimatedDuration,
      prerequisites,
      pdfUrl,
      pdfName,
      videos,
      websites,
    } = req.body;

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) return sendError(res, 404, 'Course not found');

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(shortDescription && { shortDescription }),
        ...(overview && { overview }),
        ...(difficulty && { difficulty }),
        ...(estimatedDuration && { estimatedDuration }),
        ...(prerequisites && { prerequisites }),
        ...(pdfUrl !== undefined && { pdfUrl }),
        ...(pdfName !== undefined && { pdfName }),
      },
    });

    if (Array.isArray(videos) && videos.length > 0) {
      for (const v of videos) {
        if (v.youtubeUrl) {
          await prisma.videoResource.create({
            data: {
              courseId: id,
              title: v.title || `${updated.title} Video`,
              youtubeUrl: v.youtubeUrl,
              thumbnailUrl: v.thumbnailUrl || null,
              channelName: v.channelName || 'Instructor Video',
            },
          });
        }
      }
    }

    if (Array.isArray(websites) && websites.length > 0) {
      for (const w of websites) {
        if (w.url) {
          await prisma.websiteResource.create({
            data: {
              courseId: id,
              name: w.name || `${updated.title} Resource`,
              url: w.url,
              logoUrl: w.logoUrl || 'fa-globe',
              description: w.description || 'Added by course teacher',
            },
          });
        }
      }
    }

    const finalCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        roadmapItems: { orderBy: { orderIndex: 'asc' } },
        subtopics: { orderBy: { orderIndex: 'asc' } },
        videos: true,
        websites: true,
      },
    });

    return sendSuccess(res, 200, 'Course updated successfully', finalCourse);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to update course', error.message);
  }
};

export const deleteCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    return sendSuccess(res, 200, 'Course deleted successfully');
  } catch (error: any) {
    return sendError(res, 500, 'Failed to delete course', error.message);
  }
};

// Roadmap CRUD
export const getRoadmapByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const items = await prisma.roadmapItem.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
    });
    return sendSuccess(res, 200, 'Roadmap items retrieved', items);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch roadmap', error.message);
  }
};

export const createRoadmapItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title, description, orderIndex = 0 } = req.body;
    const item = await prisma.roadmapItem.create({
      data: { courseId, title, description, orderIndex },
    });
    return sendSuccess(res, 201, 'Roadmap item created', item);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to create roadmap item', error.message);
  }
};

export const updateRoadmapItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, orderIndex } = req.body;
    const item = await prisma.roadmapItem.update({
      where: { id },
      data: { ...(title && { title }), ...(description && { description }), ...(orderIndex !== undefined && { orderIndex }) },
    });
    return sendSuccess(res, 200, 'Roadmap item updated', item);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to update roadmap item', error.message);
  }
};

export const deleteRoadmapItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.roadmapItem.delete({ where: { id } });
    return sendSuccess(res, 200, 'Roadmap item deleted');
  } catch (error: any) {
    return sendError(res, 500, 'Failed to delete roadmap item', error.message);
  }
};

// Subtopic CRUD
export const getSubtopicsByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const items = await prisma.subtopic.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
    });
    return sendSuccess(res, 200, 'Subtopics retrieved', items);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch subtopics', error.message);
  }
};

export const createSubtopic = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title, description, content, difficulty = 'Beginner', orderIndex = 0 } = req.body;
    const subtopic = await prisma.subtopic.create({
      data: { courseId, title, description, content, difficulty, orderIndex },
    });
    return sendSuccess(res, 201, 'Subtopic created', subtopic);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to create subtopic', error.message);
  }
};

export const updateSubtopic = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, content, difficulty, orderIndex } = req.body;
    const subtopic = await prisma.subtopic.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(content && { content }),
        ...(difficulty && { difficulty }),
        ...(orderIndex !== undefined && { orderIndex }),
      },
    });
    return sendSuccess(res, 200, 'Subtopic updated', subtopic);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to update subtopic', error.message);
  }
};

export const deleteSubtopic = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.subtopic.delete({ where: { id } });
    return sendSuccess(res, 200, 'Subtopic deleted');
  } catch (error: any) {
    return sendError(res, 500, 'Failed to delete subtopic', error.message);
  }
};

// Video Resources CRUD
export const getVideosByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const videos = await prisma.videoResource.findMany({ where: { courseId } });
    return sendSuccess(res, 200, 'Videos retrieved', videos);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch videos', error.message);
  }
};

export const createVideo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title, youtubeUrl, thumbnailUrl, channelName } = req.body;
    const video = await prisma.videoResource.create({
      data: { courseId, title, youtubeUrl, thumbnailUrl: thumbnailUrl || null, channelName: channelName || null },
    });
    return sendSuccess(res, 201, 'Video added', video);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to add video', error.message);
  }
};

export const updateVideo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, youtubeUrl, thumbnailUrl, channelName } = req.body;
    const video = await prisma.videoResource.update({
      where: { id },
      data: { ...(title && { title }), ...(youtubeUrl && { youtubeUrl }), ...(thumbnailUrl !== undefined && { thumbnailUrl }), ...(channelName !== undefined && { channelName }) },
    });
    return sendSuccess(res, 200, 'Video updated', video);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to update video', error.message);
  }
};

export const deleteVideo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.videoResource.delete({ where: { id } });
    return sendSuccess(res, 200, 'Video deleted');
  } catch (error: any) {
    return sendError(res, 500, 'Failed to delete video', error.message);
  }
};

// Website Resources CRUD
export const getWebsitesByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const websites = await prisma.websiteResource.findMany({ where: { courseId } });
    return sendSuccess(res, 200, 'Websites retrieved', websites);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch websites', error.message);
  }
};

export const createWebsite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { name, url, logoUrl, description } = req.body;
    const website = await prisma.websiteResource.create({
      data: { courseId, name, url, logoUrl: logoUrl || 'fa-globe', description: description || null },
    });
    return sendSuccess(res, 201, 'Website resource created', website);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to create website resource', error.message);
  }
};

export const updateWebsite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, url, logoUrl, description } = req.body;
    const website = await prisma.websiteResource.update({
      where: { id },
      data: { ...(name && { name }), ...(url && { url }), ...(logoUrl !== undefined && { logoUrl }), ...(description !== undefined && { description }) },
    });
    return sendSuccess(res, 200, 'Website resource updated', website);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to update website resource', error.message);
  }
};

export const deleteWebsite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.websiteResource.delete({ where: { id } });
    return sendSuccess(res, 200, 'Website resource deleted');
  } catch (error: any) {
    return sendError(res, 500, 'Failed to delete website resource', error.message);
  }
};
