import { Response } from 'express';
import { prisma } from '../database/db';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { classifyQuestion } from '../services/QuestionClassifier';
import { searchWeb } from '../services/WebSearchService';
import { processAndRankSources } from '../services/SourceProcessor';
import { generateAiEducationalAnswer } from '../services/AIService';
import { formatFinalResponse } from '../services/ResponseFormatter';

export const handleChatMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { question, message, courseId, conversationId, currentTopic } = req.body;
    const userQuestion = (question || message || '').trim();
    const userId = req.user?.userId;

    if (!userQuestion) {
      return sendError(res, 400, 'Question or message content is required');
    }

    if (!userId) {
      return sendError(res, 401, 'Authentication required to use CLARITY AI Assistant');
    }

    // 1. Fetch or Create Conversation History
    let conversation;
    if (conversationId) {
      conversation = await prisma.chatConversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          userId,
          courseId: courseId || null,
        },
        include: { messages: true },
      });
    }

    // Save User Message to Database
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        sender: 'USER',
        message: userQuestion,
      },
    });

    // 2. Resolve Course & Subject Context
    let courseName = 'General Academic Subjects';
    let subjectOverview = '';

    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (course) {
        courseName = course.title;
        subjectOverview = course.overview || '';
      }
    }

    // Format conversation history snippet
    const historyText = conversation.messages.slice(-6).map(m => `${m.sender}: ${m.message}`).join('\n');

    // 3. Question Classification Service
    const classification = classifyQuestion(userQuestion, courseName, currentTopic || '', historyText);

    let rawSourcesList: any[] = [];
    let sourceContextText = '';

    // 4. Real-Time Web Search Service (if needed)
    if (classification.needsWebSearch && !classification.isOffTopic) {
      try {
        const rawResults = await searchWeb(classification.searchQuery, courseName);
        const processed = processAndRankSources(rawResults);
        rawSourcesList = processed.sourcesList;
        sourceContextText = processed.sourceContextText;
      } catch (err) {
        console.warn('Web search service exception, continuing with AI synthesis:', err);
      }
    }

    // 5. AI Service Generation
    const rawAiAnswer = await generateAiEducationalAnswer(
      userQuestion,
      courseName,
      classification,
      sourceContextText,
      rawSourcesList,
      historyText
    );

    // 6. Response Formatter Service
    const { formattedAnswer, sources } = formatFinalResponse(
      rawAiAnswer,
      rawSourcesList,
      classification.isOffTopic,
      classification.offTopicReason
    );

    // Save AI Response Message to Database
    const aiMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        sender: 'AI',
        message: formattedAnswer,
      },
    });

    return sendSuccess(res, 200, 'CLARITY AI response generated successfully', {
      conversationId: conversation.id,
      answer: formattedAnswer,
      reply: formattedAnswer, // For backwards compatibility
      sources,
      course: courseName,
      message: aiMessage,
    });
  } catch (error: any) {
    return sendError(res, 500, 'Failed to process chat request', error.message);
  }
};

export const getUserConversations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const conversations = await prisma.chatConversation.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        messages: { orderBy: { createdAt: 'asc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return sendSuccess(res, 200, 'Conversations retrieved', conversations);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch conversations', error.message);
  }
};

export const getConversationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const conversation = await prisma.chatConversation.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) return sendError(res, 404, 'Conversation not found');
    if (conversation.userId !== userId) return sendError(res, 403, 'Unauthorized');

    return sendSuccess(res, 200, 'Conversation retrieved', conversation);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch conversation history', error.message);
  }
};
