import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { forumService } from '../services/forumService';

export const getTopics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { topics, total } = await forumService.getTopics(page, limit);

    res.status(200).json({
      topics,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const topic = await forumService.getTopic(id);
    if (!topic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }

    const { messages, total } = await forumService.getMessages(id, page, limit);

    res.status(200).json({
      topic,
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { title, content, pathologyId } = req.body;
    const topic = await forumService.createTopic(title, content, req.userId, pathologyId);

    res.status(201).json({ message: 'Topic created', topic });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await forumService.deleteTopic(id);
    res.status(200).json({ message: 'Topic deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { topicId, content, parentMessageId } = req.body;
    const message = await forumService.createMessage(topicId, req.userId, content, parentMessageId);

    res.status(201).json({ message: 'Message created', data: message });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId || !req.userRole) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    await forumService.deleteMessage(id, req.userId, req.userRole as 'user' | 'admin');
    res.status(200).json({ message: 'Message deleted' });
  } catch (error: any) {
    if (error?.message === 'Not allowed to delete this message') {
      res.status(403).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};
