import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { forumService } from '../services/pathologyService';

interface Author {
  _id: string;
  fullName?: string;
  email?: string;
}

interface TopicItem {
  _id: string;
  title: string;
  content: string;
  author?: Author;
  replyCount: number;
  createdAt: string;
  pathology?: {
    _id: string;
    title: string;
    slug: string;
  } | null;
}

interface MessageItem {
  _id: string;
  content: string;
  createdAt: string;
  author?: Author;
  parentMessage?: {
    _id: string;
  } | null;
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
}

const formatDate = (value?: string) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const Forum: React.FC = () => {
  const { user } = useAuth();
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TopicItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [topicPage, setTopicPage] = useState(1);
  const [topicMeta, setTopicMeta] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const [messagePage, setMessagePage] = useState(1);
  const [messageMeta, setMessageMeta] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '' });
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [replyTargetLabel, setReplyTargetLabel] = useState<string | null>(null);
  const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});

  const TOPIC_PREVIEW_LIMIT = 220;
  const MESSAGE_PREVIEW_LIMIT = 260;

  const messagesByParent = useMemo(() => {
    const grouped: Record<string, MessageItem[]> = {};
    messages.forEach((message) => {
      const key = message.parentMessage?._id || 'root';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(message);
    });
    return grouped;
  }, [messages]);

  const filteredTopics = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return topics;
    return topics.filter((topic) => (
      topic.title.toLowerCase().includes(term)
      || topic.content.toLowerCase().includes(term)
      || (topic.author?.fullName || '').toLowerCase().includes(term)
    ));
  }, [search, topics]);

  const loadTopics = async (page = topicPage) => {
    setLoadingTopics(true);
    try {
      const res = await forumService.getTopics(page, 12);
      const nextTopics = (res.data?.topics ?? []) as TopicItem[];
      setTopics(nextTopics);
      setTopicMeta({
        page: res.data?.pagination?.page ?? page,
        pages: res.data?.pagination?.pages ?? 1,
        total: res.data?.pagination?.total ?? nextTopics.length,
      });

      if (!selectedTopic && nextTopics.length > 0) {
        setSelectedTopic(nextTopics[0]);
      }
    } catch (error) {
      setStatusType('error');
      setStatusMessage('Impossible de charger les sujets du forum.');
    } finally {
      setLoadingTopics(false);
    }
  };

  const loadTopicDetail = async (topicId: string, page = 1) => {
    setLoadingMessages(true);
    try {
      const res = await forumService.getTopic(topicId, page, 20);
      setSelectedTopic((res.data?.topic ?? null) as TopicItem | null);
      setMessages((res.data?.messages ?? []) as MessageItem[]);
      setMessageMeta({
        page: res.data?.pagination?.page ?? page,
        pages: res.data?.pagination?.pages ?? 1,
        total: res.data?.pagination?.total ?? 0,
      });
      setMessagePage(page);
      setExpandedTopic(false);
      setExpandedMessages({});
      setReplyTargetLabel(null);
      setReplyToMessageId(null);
    } catch (error) {
      setStatusType('error');
      setStatusMessage('Impossible de charger ce sujet pour le moment.');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    void loadTopics(topicPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicPage]);

  useEffect(() => {
    if (!selectedTopic?._id) return;
    void loadTopicDetail(selectedTopic._id, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic?._id]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setStatusType('error');
      setStatusMessage('Vous devez vous connecter pour créer un sujet.');
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusType(null);
      setStatusMessage(null);
      await forumService.createTopic(newTopic);
      setNewTopic({ title: '', content: '' });
      setStatusType('success');
      setStatusMessage('Sujet publié avec succès.');
      await loadTopics(1);
      setTopicPage(1);
    } catch (error) {
      console.error('Error creating topic:', error);
      setStatusType('error');
      setStatusMessage('Erreur lors de la publication du sujet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setStatusType('error');
      setStatusMessage('Vous devez vous connecter pour écrire un message.');
      return;
    }

    if (!selectedTopic?._id) {
      setStatusType('error');
      setStatusMessage('Sélectionnez un sujet pour répondre.');
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusType(null);
      setStatusMessage(null);
      await forumService.createMessage({
        topicId: selectedTopic._id,
        content: newMessage,
        ...(replyToMessageId ? { parentMessageId: replyToMessageId } : {}),
      });
      setNewMessage('');
      setReplyTargetLabel(null);
      setReplyToMessageId(null);
      setStatusType('success');
      setStatusMessage('Message publié avec succès.');
      await loadTopicDetail(selectedTopic._id, 1);
      await loadTopics(topicPage);
    } catch (error) {
      setStatusType('error');
      setStatusMessage('Erreur lors de la publication du message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildReplyPrefix = (target: string, excerpt: string) => {
    return `@${target}\n> ${excerpt}\n\n`;
  };

  const prepareReplyToTopic = () => {
    if (!selectedTopic) {
      return;
    }

    const excerpt = selectedTopic.content.slice(0, 120);
    const prefix = buildReplyPrefix('Sujet', excerpt);
    setNewMessage(prefix);
    setReplyTargetLabel('Réponse au sujet');
    setReplyToMessageId(null);
    messageInputRef.current?.focus();
  };

  const prepareReplyToMessage = (message: MessageItem) => {
    const authorName = message.author?.fullName || message.author?.email || 'Membre';
    const excerpt = message.content.slice(0, 120);
    const prefix = buildReplyPrefix(authorName, excerpt);
    setNewMessage(prefix);
    setReplyTargetLabel(`Réponse à ${authorName}`);
    setReplyToMessageId(message._id);
    messageInputRef.current?.focus();
  };

  const clearReplyTarget = () => {
    setReplyTargetLabel(null);
    setReplyToMessageId(null);
    setNewMessage('');
  };

  const renderMessageThread = (parentId: string = 'root', depth = 0): React.ReactNode => {
    const branch = messagesByParent[parentId] || [];
    if (branch.length === 0) {
      return null;
    }

    return branch.map((message) => {
      const canDelete = Boolean(
        user && (user.role === 'admin' || user._id === message.author?._id)
      );

      return (
        <li key={message._id} className="forum-message-card" style={{ marginLeft: depth > 0 ? `${Math.min(depth * 18, 54)}px` : 0 }}>
          <p>
            {expandedMessages[message._id] || message.content.length <= MESSAGE_PREVIEW_LIMIT
              ? message.content
              : `${message.content.slice(0, MESSAGE_PREVIEW_LIMIT)}...`}
          </p>
          {message.content.length > MESSAGE_PREVIEW_LIMIT && (
            <button
              type="button"
              className="forum-link-btn"
              onClick={() => setExpandedMessages((prev) => ({ ...prev, [message._id]: !prev[message._id] }))}
            >
              {expandedMessages[message._id] ? 'Réduire' : 'Lire l\'intégralité du commentaire'}
            </button>
          )}
          <div className="forum-message-meta">
            <small>
              {message.author?.fullName || message.author?.email || 'Membre'} · {formatDate(message.createdAt)}
            </small>
            <div className="forum-message-actions">
              {user && (
                <button type="button" onClick={() => prepareReplyToMessage(message)}>
                  Répondre
                </button>
              )}
              {canDelete && (
                <button type="button" onClick={() => handleDeleteMessage(message._id)}>
                  Supprimer
                </button>
              )}
            </div>
          </div>

          <ul className="forum-message-list forum-message-list-nested">
            {renderMessageThread(message._id, depth + 1)}
          </ul>
        </li>
      );
    });
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedTopic?._id) return;

    try {
      setStatusType(null);
      setStatusMessage(null);
      await forumService.deleteMessage(messageId);
      await loadTopicDetail(selectedTopic._id, messagePage);
      await loadTopics(topicPage);
      setStatusType('success');
      setStatusMessage('Message supprimé.');
    } catch (error) {
      setStatusType('error');
      setStatusMessage('Suppression impossible pour ce message.');
    }
  };

  return (
    <main className="simple-page">
      <section className="container section-shell forum-page">
        <div className="forum-header">
          <h1 className="module-main-title">Forum</h1>
          <p className="module-main-subtitle">lisez les discussions, publiez des sujets et repondez aux messages de la communaute.</p>
        </div>

        {statusMessage && (
          <p className={`forum-status ${statusType === 'success' ? 'success' : 'error'}`}>{statusMessage}</p>
        )}

        <details className="training-accordion" open>
          <summary className="training-accordion-summary">Nouveau sujet</summary>
          <div className="training-accordion-body">
            {user ? (
              <form onSubmit={handleCreateTopic} className="forum-topic-form">
                <input
                  type="text"
                  placeholder="Titre du sujet"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <textarea
                  placeholder="Décrivez votre sujet en détail"
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Publication...' : 'Publier le sujet'}
                </button>
              </form>
            ) : (
              <p className="forum-muted">Connectez-vous pour créer un sujet.</p>
            )}
          </div>
        </details>

        <div className="forum-layout">
          <details className="training-accordion forum-topics-accordion" open>
            <summary className="training-accordion-summary">Sujets</summary>
            <div className="training-accordion-body">
              <aside className="forum-topics-panel">
            <div className="forum-panel-header">
              <h2>Sujets</h2>
              <span>{topicMeta.total}</span>
            </div>
            <input
              type="search"
              className="search-input"
              placeholder="Rechercher un sujet"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher un sujet"
            />

            {loadingTopics ? (
              <p className="forum-muted">Chargement des sujets...</p>
            ) : filteredTopics.length === 0 ? (
              <p className="forum-muted">Aucun sujet trouvé.</p>
            ) : (
              <ul className="forum-topic-list">
                {filteredTopics.map((topic) => (
                  <li key={topic._id}>
                    <button
                      type="button"
                      className={`forum-topic-item ${selectedTopic?._id === topic._id ? 'active' : ''}`}
                      onClick={() => setSelectedTopic(topic)}
                    >
                      <strong>{topic.title}</strong>
                      <small>
                        {topic.author?.fullName || topic.author?.email || 'Auteur inconnu'} · {formatDate(topic.createdAt)}
                      </small>
                      <span>{topic.replyCount} réponse{topic.replyCount > 1 ? 's' : ''}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="forum-pagination">
              <button type="button" onClick={() => setTopicPage((p) => Math.max(1, p - 1))} disabled={topicMeta.page <= 1}>
                Précédent
              </button>
              <span>Page {topicMeta.page}/{topicMeta.pages}</span>
              <button type="button" onClick={() => setTopicPage((p) => Math.min(topicMeta.pages, p + 1))} disabled={topicMeta.page >= topicMeta.pages}>
                Suivant
              </button>
            </div>
              </aside>
            </div>
          </details>

          <details className="training-accordion forum-thread-accordion" open>
            <summary className="training-accordion-summary">Discussion</summary>
            <div className="training-accordion-body">
              <section className="forum-thread-panel">
            {!selectedTopic ? (
              <p className="forum-muted">Sélectionnez un sujet pour afficher les messages.</p>
            ) : (
              <>
                <header className="forum-thread-header">
                  <h2>{selectedTopic.title}</h2>
                  <p>
                    {expandedTopic || selectedTopic.content.length <= TOPIC_PREVIEW_LIMIT
                      ? selectedTopic.content
                      : `${selectedTopic.content.slice(0, TOPIC_PREVIEW_LIMIT)}...`}
                  </p>
                  {selectedTopic.content.length > TOPIC_PREVIEW_LIMIT && (
                    <button
                      type="button"
                      className="forum-link-btn"
                      onClick={() => setExpandedTopic((prev) => !prev)}
                    >
                      {expandedTopic ? 'Réduire' : 'Lire l\'intégralité du sujet'}
                    </button>
                  )}
                  <small>
                    Par {selectedTopic.author?.fullName || selectedTopic.author?.email || 'Auteur inconnu'} · {formatDate(selectedTopic.createdAt)}
                  </small>
                  {user && (
                    <div className="forum-thread-actions">
                      <button type="button" className="btn-secondary" onClick={prepareReplyToTopic}>Répondre au sujet</button>
                    </div>
                  )}
                </header>

                {loadingMessages ? (
                  <p className="forum-muted">Chargement des messages...</p>
                ) : messages.length === 0 ? (
                  <p className="forum-muted">Aucun message pour ce sujet.</p>
                ) : (
                  <ul className="forum-message-list">
                    {renderMessageThread('root', 0)}
                  </ul>
                )}

                <div className="forum-pagination">
                  <button
                    type="button"
                    onClick={() => selectedTopic?._id && loadTopicDetail(selectedTopic._id, Math.max(1, messagePage - 1))}
                    disabled={messageMeta.page <= 1}
                  >
                    Précédent
                  </button>
                  <span>Page {messageMeta.page}/{messageMeta.pages}</span>
                  <button
                    type="button"
                    onClick={() => selectedTopic?._id && loadTopicDetail(selectedTopic._id, Math.min(messageMeta.pages, messagePage + 1))}
                    disabled={messageMeta.page >= messageMeta.pages}
                  >
                    Suivant
                  </button>
                </div>

                {user ? (
                  <form onSubmit={handleCreateMessage} className="forum-message-form">
                    <h3>Écrire un message</h3>
                    {replyTargetLabel && (
                      <div className="forum-reply-target">
                        <span>{replyTargetLabel}</span>
                        <button type="button" onClick={clearReplyTarget}>Annuler</button>
                      </div>
                    )}
                    <textarea
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Décrivez votre réponse"
                      required
                      disabled={isSubmitting}
                    />
                    <button type="submit" className="btn-primary" disabled={isSubmitting || !selectedTopic}>
                      {isSubmitting ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </form>
                ) : (
                  <p className="forum-muted">Connectez-vous pour écrire un message.</p>
                )}
              </>
            )}
              </section>
            </div>
          </details>
        </div>
      </section>
    </main>
  );
};
