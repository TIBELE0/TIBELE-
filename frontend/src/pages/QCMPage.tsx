import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { questionService } from '../services/pathologyService';

interface QuestionOption {
  text: string;
}

interface QuestionItem {
  _id: string;
  questionText: string;
  type: 'QCM' | 'QCD';
  options: QuestionOption[];
  explanation?: string;
}

interface ScoreResult {
  correct: number;
  total: number;
  percentage: number;
}

interface SessionReviewItem {
  questionId: string;
  questionText: string;
  selectedIndex: number;
  selectedText: string;
  isCorrect: boolean;
  explanation?: string;
}

export const QCMPage: React.FC = () => {
  const { pathologyId } = useParams<{ pathologyId: string }>();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answering, setAnswering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [answersCount, setAnswersCount] = useState(0);
  const [sessionReview, setSessionReview] = useState<SessionReviewItem[]>([]);


  useEffect(() => {
    if (!pathologyId) {
      setLoading(false);
      setError('Pathologie introuvable.');
      return;
    }

    setLoading(true);
    setError(null);

    questionService
      .getQuestionsByPathology(pathologyId)
      .then((res) => {
        const loaded = (res.data?.questions ?? []) as QuestionItem[];
        setQuestions(loaded);
        setCurrentIndex(0);
        setSelectedIndex(null);
        setCompleted(false);
        setScore(null);
        setAnswersCount(0);
        setSessionReview([]);
      })
      .catch((err: any) => {
        setError(err?.response?.data?.message || 'Impossible de charger les questions.');
      })
      .finally(() => setLoading(false));
  }, [pathologyId]);

  const currentQuestion = useMemo(() => questions[currentIndex] ?? null, [questions, currentIndex]);

  const fetchScore = async () => {
    if (!pathologyId) return;
    const res = await questionService.getScore(pathologyId);
    setScore(res.data as ScoreResult);
  };

  const submitCurrentAnswer = async () => {
    if (!currentQuestion || selectedIndex === null) {
      setError('Veuillez sélectionner une réponse.');
      return;
    }

    try {
      setError(null);
      setAnswering(true);

      const res = await questionService.submitAnswer(currentQuestion._id, selectedIndex);
      const isCorrect = Boolean(res.data?.data?.isCorrect);

      setSessionReview((prev) => ([
        ...prev,
        {
          questionId: currentQuestion._id,
          questionText: currentQuestion.questionText,
          selectedIndex,
          selectedText: currentQuestion.options[selectedIndex]?.text ?? '',
          isCorrect,
          explanation: currentQuestion.explanation,
        },
      ]));

      const nextCount = answersCount + 1;
      setAnswersCount(nextCount);

      const isLast = currentIndex >= questions.length - 1;
      if (isLast) {
        await fetchScore();
        setCompleted(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedIndex(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Impossible de soumettre la réponse.');
    } finally {
      setAnswering(false);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setCompleted(false);
    setScore(null);
    setAnswersCount(0);
    setSessionReview([]);
  };

  if (loading) {
    return (
      <main className="simple-page">
        <div className="container"><div className="page-loader">Chargement du QCM...</div></div>
      </main>
    );
  }

  if (!pathologyId) {
    return (
      <main className="simple-page">
        <div className="container section-shell">
          <p>Paramètre pathologie manquant.</p>
          <Link to="/pathologies" className="btn-secondary">Retour aux pathologies</Link>
        </div>
      </main>
    );
  }

  if (error && questions.length === 0) {
    return (
      <main className="simple-page">
        <div className="container section-shell">
          <p>{error}</p>
          <Link to="/pathologies" className="btn-secondary">Retour aux pathologies</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="simple-page">
      <div className="container section-shell" style={{ marginTop: '1rem', maxWidth: 780 }}>
        <h1 className="module-main-title">QCM / QCD</h1>
        <p className="module-main-subtitle">repondez aux questions de la pathologie selectionnee puis consultez votre score.</p>

        {error && <p className="page-error">{error}</p>}

        {questions.length === 0 ? (
          <div className="empty-state">
            <p>Aucune question disponible pour cette pathologie.</p>
            <Link to="/pathologies" className="btn-secondary">Retour aux pathologies</Link>
          </div>
        ) : completed ? (
          <div className="training-results-card">
            <h2>Résultat de la session</h2>
            <p>Questions répondues: <strong>{answersCount}</strong></p>
            <p>Bonnes réponses: <strong>{score?.correct ?? 0}</strong> / {score?.total ?? questions.length}</p>
            <p>Score: <strong>{score?.percentage ?? 0}%</strong></p>

            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '0.6rem' }}>Détail des réponses</h3>
              {sessionReview.length === 0 ? (
                <p>Aucun détail disponible.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                  {sessionReview.map((item, index) => (
                    <li
                      key={`${item.questionId}-${index}`}
                      style={{
                        border: `1px solid ${item.isCorrect ? '#86efac' : '#fca5a5'}`,
                        background: item.isCorrect ? '#f0fdf4' : '#fef2f2',
                        borderRadius: 8,
                        padding: '0.75rem',
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: 600 }}>{index + 1}. {item.questionText}</p>
                      <p style={{ margin: '0.35rem 0 0', fontSize: '0.95rem' }}>
                        Réponse choisie: <strong>{item.selectedText || `Option ${item.selectedIndex + 1}`}</strong>
                      </p>
                      <p style={{ margin: '0.35rem 0 0', color: item.isCorrect ? '#166534' : '#991b1b', fontWeight: 600 }}>
                        {item.isCorrect ? 'Correct' : 'Incorrect'}
                      </p>
                      {item.explanation && (
                        <p style={{ margin: '0.45rem 0 0', color: '#334155', fontSize: '0.92rem' }}>
                          Explication: {item.explanation}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="training-filters-actions" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn-primary" onClick={restartQuiz}>Recommencer</button>
              <Link to="/pathologies" className="btn-secondary">Retour aux pathologies</Link>
            </div>
          </div>
        ) : currentQuestion ? (
          <div className="training-question-card">
            <div className="training-progress-header" style={{ marginBottom: '1rem' }}>
              <span>Question {currentIndex + 1} / {questions.length}</span>
              <span>Type: {currentQuestion.type}</span>
            </div>

            <h2 style={{ marginBottom: '1rem' }}>{currentQuestion.questionText}</h2>

            <div className="training-options-grid">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={`${currentQuestion._id}-${index}`}
                  type="button"
                  className={`training-option-card ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <span className="training-option-index">{String.fromCharCode(65 + index)}</span>
                  <span>{option.text}</span>
                </button>
              ))}
            </div>

            <div className="training-filters-actions" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn-primary" onClick={submitCurrentAnswer} disabled={selectedIndex === null || answering}>
                {answering ? 'Validation...' : currentIndex === questions.length - 1 ? 'Terminer' : 'Suivant'}
              </button>
            </div>
          </div>
        ) : (
          <p>Impossible de charger la question en cours.</p>
        )}
      </div>
    </main>
  );
};
