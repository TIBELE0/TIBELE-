import prisma from '../config/prisma';

const mapTopic = (topic: any) => ({
  ...topic,
  _id: topic.id,
  author: topic.author
    ? {
      _id: topic.author.id,
      id: topic.author.id,
      fullName: topic.author.fullName,
      email: topic.author.email,
    }
    : null,
  pathology: topic.pathology
    ? {
      _id: topic.pathology.id,
      id: topic.pathology.id,
      title: topic.pathology.title,
      slug: topic.pathology.slug,
    }
    : null,
});

const mapMessage = (message: any) => ({
  ...message,
  _id: message.id,
  topic: message.topic
    ? {
      _id: message.topic.id,
      id: message.topic.id,
      title: message.topic.title,
    }
    : undefined,
  author: message.author
    ? {
      _id: message.author.id,
      id: message.author.id,
      fullName: message.author.fullName,
      email: message.author.email,
    }
    : null,
  parentMessage: message.parentMessage
    ? {
      _id: message.parentMessage.id,
      id: message.parentMessage.id,
    }
    : null,
});

export const forumService = {
  async getTopics(page: number = 1, limit: number = 10): Promise<{ topics: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const [topics, total] = await Promise.all([
      prisma.topic.findMany({
        include: {
          author: { select: { id: true, fullName: true, email: true } },
          pathology: { select: { id: true, title: true, slug: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.topic.count(),
    ]);

    return { topics: topics.map(mapTopic), total };
  },

  async getTopic(topicId: string): Promise<any | null> {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        author: { select: { id: true, fullName: true, email: true } },
        pathology: { select: { id: true, title: true, slug: true } },
      },
    });
    return topic ? mapTopic(topic) : null;
  },

  async createTopic(
    title: string,
    content: string,
    authorId: string,
    pathologyId?: string
  ): Promise<any> {
    if (!title || !content) {
      throw new Error('Title and content are required');
    }

    const topic = await prisma.topic.create({
      data: {
        title,
        content,
        authorId,
        pathologyId: pathologyId || null,
        replyCount: 0,
      },
      include: {
        author: { select: { id: true, fullName: true, email: true } },
        pathology: { select: { id: true, title: true, slug: true } },
      },
    });

    return mapTopic(topic);
  },

  async deleteTopic(topicId: string): Promise<void> {
    await prisma.topic.delete({ where: { id: topicId } });
  },

  async getMessages(topicId: string, page: number = 1, limit: number = 10): Promise<{ messages: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { topicId },
        include: {
          author: { select: { id: true, fullName: true, email: true } },
          parentMessage: { select: { id: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where: { topicId } }),
    ]);

    return { messages: messages.map(mapMessage), total };
  },

  async createMessage(topicId: string, authorId: string, content: string, parentMessageId?: string): Promise<any> {
    if (!content) {
      throw new Error('Message content is required');
    }

    if (parentMessageId) {
      const parent = await prisma.message.findUnique({
        where: { id: parentMessageId },
        select: { topicId: true },
      });
      if (!parent) {
        throw new Error('Parent message not found');
      }

      if (String(parent.topicId) !== String(topicId)) {
        throw new Error('Parent message does not belong to this topic');
      }
    }

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          topicId,
          authorId,
          content,
          parentMessageId: parentMessageId || null,
        },
        include: {
          author: { select: { id: true, fullName: true, email: true } },
          parentMessage: { select: { id: true } },
        },
      });

      await tx.topic.update({
        where: { id: topicId },
        data: { replyCount: { increment: 1 } },
      });

      return created;
    });

    return mapMessage(message);
  },

  async deleteMessage(messageId: string, requesterId: string, requesterRole: 'user' | 'admin'): Promise<void> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, authorId: true, topicId: true },
    });
    if (message) {
      const isOwner = String(message.authorId) === String(requesterId);
      const isAdmin = requesterRole === 'admin';
      if (!isOwner && !isAdmin) {
        throw new Error('Not allowed to delete this message');
      }

      const descendants = await prisma.message.findMany({
        where: { parentMessageId: message.id },
        select: { id: true },
      });
      const idsToDelete = [message.id, ...descendants.map((m) => m.id)];

      await prisma.$transaction(async (tx) => {
        await tx.message.deleteMany({ where: { id: { in: idsToDelete } } });

        const topic = await tx.topic.findUnique({
          where: { id: message.topicId },
          select: { replyCount: true },
        });

        if (topic) {
          const nextCount = Math.max(0, topic.replyCount - idsToDelete.length);
          await tx.topic.update({
            where: { id: message.topicId },
            data: { replyCount: nextCount },
          });
        }
      });
    }
  },
};
