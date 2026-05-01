import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { questionService } from '../services/pathologyService';

type QuizMode = 'QCM' | 'QCD' | 'all';
type Step = 'setup' | 'quiz' | 'results';

interface QuestionOption {
  text: string;
}

interface QuestionItem {
  _id: string;
  questionText: string;
  type: 'QCM' | 'QCD';
  options: QuestionOption[];
  explanation?: string;
  pathology: {
    _id: string;
    title: string;
    slug: string;
  };
}

interface AnswerRecord {
  questionId: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation?: string;
}

interface DashboardResponse {
  overview: {
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    bestScore: number;
    totalAnswered: number;
    totalCorrect: number;
    accuracyRate: number;
    currentStreakDays: number;
    inProgressSessions: number;
  };
  trend7Days: Array<{ day: string; sessions: number; averageScore: number }>;
  byMode: Array<{ mode: QuizMode; sessions: number; averageScore: number }>;
  weakPathologies: Array<{ pathologyId: string; pathologyTitle: string; accuracyRate: number; attempts: number }>;
  recentSessions: Array<{
    id: string;
    mode: QuizMode;
    status: 'in_progress' | 'completed' | 'abandoned';
    startedAt: string;
    completedAt?: string;
    scorePercentage: number;
    answeredCount: number;
    totalQuestions: number;
  }>;
}

interface HistoryItem {
  id: string;
  mode: QuizMode;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  scorePercentage: number;
  durationSeconds?: number;
}

interface SessionDetail {
  id: string;
  mode: QuizMode;
  status: string;
  startedAt: string;
  completedAt?: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  scorePercentage: number;
  durationSeconds?: number;
  questions: Array<{
    questionId: string;
    pathologyTitle: string;
    questionText: string;
    type: 'QCM' | 'QCD';
    options: Array<{ text: string }>;
    selectedOptionIndex?: number;
    correctOptionIndex: number;
    isCorrect?: boolean;
    explanation?: string;
  }>;
}

interface CatalogEntry {
  pathologyId: string;
  pathologyTitle: string;
  pathologySlug: string;
  groupe: string;
  qcmCount: number;
  qcdCount: number;
  totalCount: number;
}

interface ActiveSession {
  id: string;
  mode: QuizMode;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  scorePercentage: number;
  nextQuestionIndex: number;
  questions: Array<{
    questionId: string;
    questionText: string;
    type: 'QCM' | 'QCD';
    pathology: {
      _id: string;
      title: string;
      slug: string;
    };
    options: Array<{ text: string }>;
    selectedOptionIndex?: number;
    correctOptionIndex?: number;
    isCorrect?: boolean;
    explanation?: string;
  }>;
}

const MODE_CONFIG: Record<QuizMode, { label: string; desc: string; icon: string }> = {
  QCM: {
    label: 'QCM',
    desc: 'Une seule bonne reponse.',
    icon: 'A',
  },
  QCD: {
    label: 'QCD',
    desc: 'Format vrai/faux.',
    icon: 'V/F',
  },
  all: {
    label: 'Mixte',
    desc: 'QCM + QCD combines.',
    icon: 'Mix',
  },
};

const formatDateTime = (value?: string): string => {
  if (!value) return '-';
  const d = new Date(value);
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (seconds?: number): string => {
  if (!seconds || seconds <= 0) return '-';
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min} min ${String(sec).padStart(2, '0')} s`;
};

export const Entrainement: React.FC = () => {
  const [step, setStep] = useState<Step>('setup');
  const [mode, setMode] = useState<QuizMode>('all');
  const [limit, setLimit] = useState<number>(10);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogGroupFilter, setCatalogGroupFilter] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPages, setHistoryPages] = useState(1);
  const [historyDetail, setHistoryDetail] = useState<SessionDetail | null>(null);

  const [loadingSetup, setLoadingSetup] = useState(true);
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [loadingHistoryDetail, setLoadingHistoryDetail] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadDashboard = async () => {
    const [dashboardRes, historyRes, activeSessionRes, catalogRes] = await Promise.all([
      questionService.getTrainingDashboard(),
      questionService.getTrainingHistory(historyPage, 8),
      questionService.getActiveTrainingSession(),
      questionService.getTrainingCatalog(),
    ]);

    setDashboard(dashboardRes.data as DashboardResponse);
    setHistory(historyRes.data.sessions as HistoryItem[]);
    setHistoryPages(historyRes.data.pages ?? 1);
    setActiveSession((activeSessionRes.data?.session as ActiveSession | null) ?? null);
    setCatalog((catalogRes.data?.catalog as CatalogEntry[]) ?? []);
  };

  const handleResumeSession = () => {
    if (!activeSession) return;

    const mappedQuestions: QuestionItem[] = activeSession.questions.map((q) => ({
      _id: q.questionId,
      questionText: q.questionText,
      type: q.type,
      options: q.options,
      explanation: q.explanation,
      pathology: q.pathology,
    }));

    const mappedAnswers: AnswerRecord[] = activeSession.questions
      .filter((q) => q.selectedOptionIndex !== undefined && q.correctOptionIndex !== undefined)
      .map((q) => ({
        questionId: q.questionId,
        selectedOptionIndex: q.selectedOptionIndex as number,
        correctOptionIndex: q.correctOptionIndex as number,
        isCorrect: Boolean(q.isCorrect),
        explanation: q.explanation,
      }));

    setSessionId(activeSession.id);
    setMode(activeSession.mode);
    setQuestions(mappedQuestions);
    setAnswers(mappedAnswers);
    setCurrent(Math.min(activeSession.nextQuestionIndex, Math.max(mappedQuestions.length - 1, 0)));
    setSelected(null);
    setConfirmed(false);
    setStep('quiz');
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoadingSetup(true);
      setErrorMsg(null);
      try {
        await loadDashboard();
      } catch {
        if (mounted) {
          setErrorMsg('Impossible de charger votre progression pour le moment.');
        }
      } finally {
        if (mounted) {
          setLoadingSetup(false);
        }
      }
    };

    run();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyPage]);

  const handleStart = async (overridePathologyId?: string) => {
    setLoadingStart(true);
    setErrorMsg(null);
    setHistoryDetail(null);

    try {
      const res = await questionService.startTrainingSession(mode, limit, overridePathologyId);
      const payload = res.data;

      if (!payload.session || !Array.isArray(payload.questions) || payload.questions.length === 0) {
        setErrorMsg('Aucune question disponible pour ce parametrage.');
        return;
      }

      setSessionId(payload.session.id);
      setQuestions(payload.questions as QuestionItem[]);
      setAnswers([]);
      setCurrent(0);
      setSelected(null);
      setConfirmed(false);
      setStep('quiz');
    } catch {
      setErrorMsg('Impossible de demarrer une session. Verifiez votre connexion.');
    } finally {
      setLoadingStart(false);
    }
  };

  const handleConfirm = async () => {
    if (!sessionId || selected === null || loadingAnswer) return;

    const q = questions[current];
    setLoadingAnswer(true);

    try {
      const res = await questionService.submitTrainingSessionAnswer(sessionId, q._id, selected);
      const result = res.data as {
        correctOptionIndex: number;
        isCorrect: boolean;
        explanation?: string;
      };

      setAnswers((prev) => [
        ...prev,
        {
          questionId: q._id,
          selectedOptionIndex: selected,
          correctOptionIndex: result.correctOptionIndex,
          isCorrect: result.isCorrect,
          explanation: result.explanation,
        },
      ]);
      setConfirmed(true);
    } catch {
      setErrorMsg('Erreur lors de la validation de la reponse.');
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleNext = async () => {
    if (current + 1 >= questions.length) {
      if (sessionId) {
        try {
          await questionService.completeTrainingSession(sessionId);
        } catch {
          // La session est potentiellement deja completee cote serveur.
        }
      }
      setStep('results');
      loadDashboard().catch(() => undefined);
      return;
    }

    setCurrent((c) => c + 1);
    setSelected(null);
    setConfirmed(false);
  };

  const handleRestart = () => {
    setStep('setup');
    setSessionId(null);
    setQuestions([]);
    setAnswers([]);
    setCurrent(0);
    setSelected(null);
    setConfirmed(false);
    setHistoryDetail(null);
  };

  const handleOpenHistoryDetail = async (targetSessionId: string) => {
    setLoadingHistoryDetail(true);
    setHistoryDetail(null);

    try {
      const res = await questionService.getTrainingSession(targetSessionId);
      setHistoryDetail(res.data as SessionDetail);
    } catch {
      setErrorMsg('Impossible de charger le detail de cette session.');
    } finally {
      setLoadingHistoryDetail(false);
    }
  };

  const progress = questions.length > 0 ? ((current + (confirmed ? 1 : 0)) / questions.length) * 100 : 0;
  const score = useMemo(() => answers.filter((a) => a.isCorrect).length, [answers]);

  const catalogGroups = useMemo(() => Array.from(new Set(catalog.map((e) => e.groupe))).sort(), [catalog]);

  const filteredCatalog = useMemo(() => {
    const search = catalogSearch.trim().toLowerCase();
    return catalog.filter((e) => {
      const matchSearch = !search || e.pathologyTitle.toLowerCase().includes(search);
      const matchGroup = !catalogGroupFilter || e.groupe === catalogGroupFilter;
      return matchSearch && matchGroup;
    });
  }, [catalog, catalogSearch, catalogGroupFilter]);

  if (step === 'setup') {
    return (
      <main className="simple-page">
        <nav className="breadcrumb container" aria-label="Fil d'Ariane">
          <Link to="/">Accueil</Link>
          <span className="breadcrumb-sep" aria-hidden="true">›</span>
          <span aria-current="page">Entrainement</span>
        </nav>

        <section className="container quiz-setup">
          <div className="section-shell quiz-setup-card">
            <h1 className="quiz-setup-title module-main-title">Entrainement</h1>
            <p className="quiz-setup-sub module-main-subtitle">
              Lancez des sessions, suivez votre progression et revisitez l historique de vos jeux.
            </p>
            <Link to="/soutenir" className="btn-primary donate-btn-red" style={{ marginBottom: '0.8rem', display: 'inline-flex' }}>
              Je fais un don
            </Link>

            {errorMsg && <p className="page-error">{errorMsg}</p>}

            <details className="training-accordion" open>
              <summary className="training-accordion-summary">Tableau de bord</summary>
              <div className="training-accordion-body">
                <div className="training-kpi-grid">
                  <article className="training-kpi-card">
                    <span>Sessions</span>
                    <strong>{dashboard?.overview.totalSessions ?? 0}</strong>
                  </article>
                  <article className="training-kpi-card">
                    <span>Score moyen</span>
                    <strong>{dashboard?.overview.averageScore ?? 0}%</strong>
                  </article>
                  <article className="training-kpi-card">
                    <span>Precision globale</span>
                    <strong>{dashboard?.overview.accuracyRate ?? 0}%</strong>
                  </article>
                  <article className="training-kpi-card">
                    <span>Serie active</span>
                    <strong>{dashboard?.overview.currentStreakDays ?? 0} j</strong>
                  </article>
                </div>

                <div className="training-charts-grid">
                  <div className="training-chart-card">
                    <h3>Score sur 7 jours</h3>
                    {(dashboard?.trend7Days ?? []).every((d) => d.sessions === 0) ? (
                      <p className="training-chart-empty">Pas encore de donnees cette semaine.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart
                          data={dashboard?.trend7Days ?? []}
                          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#eaf4fb" />
                          <XAxis
                            dataKey="day"
                            tickFormatter={(v: string) => v.slice(5)}
                            tick={{ fontSize: 11, fill: '#1f6a97' }}
                          />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#1f6a97' }} unit="%" />
                          <Tooltip
                            formatter={(v: unknown) => [`${Number(v)}%`, 'Score moyen']}
                            labelFormatter={(l: unknown) => `Jour : ${String(l)}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="averageScore"
                            stroke="#2b84b8"
                            strokeWidth={2}
                            dot={{ r: 3, fill: '#2b84b8' }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {(dashboard?.byMode ?? []).some((m) => m.sessions > 0) && (
                    <div className="training-chart-card">
                      <h3>Score par mode</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart
                          data={(dashboard?.byMode ?? [])
                            .filter((m) => m.sessions > 0)
                            .map((m) => ({
                              ...m,
                              modeLabel: m.mode === 'all' ? 'Mixte' : m.mode,
                            }))}
                          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#eaf4fb" />
                          <XAxis dataKey="modeLabel" tick={{ fontSize: 11, fill: '#1f6a97' }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#1f6a97' }} unit="%" />
                          <Tooltip formatter={(v: unknown) => [`${Number(v)}%`, 'Score moyen']} />
                          <Bar dataKey="averageScore" radius={[4, 4, 0, 0]}>
                            {(dashboard?.byMode ?? [])
                              .filter((m) => m.sessions > 0)
                              .map((entry, index) => (
                                <Cell
                                  key={entry.mode}
                                  fill={(['#2b84b8', '#3ea66f', '#0b3b5a'] as string[])[index % 3]}
                                />
                              ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </details>

            <details className="training-accordion">
              <summary className="training-accordion-summary">
                Banque d'exercices
                {catalog.length > 0 && (
                  <span className="training-accordion-count">{catalog.length} pathologies</span>
                )}
              </summary>
              <div className="training-accordion-body">
                <div className="catalog-toolbar">
                  <input
                    type="search"
                    className="catalog-search"
                    placeholder="Rechercher une pathologie..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    aria-label="Rechercher une pathologie"
                  />
                  <select
                    className="catalog-group-select"
                    value={catalogGroupFilter}
                    onChange={(e) => setCatalogGroupFilter(e.target.value)}
                    aria-label="Filtrer par spécialité"
                  >
                    <option value="">Toutes les spécialités</option>
                    {catalogGroups.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {loadingSetup ? (
                  <p className="catalog-empty">Chargement du catalogue...</p>
                ) : filteredCatalog.length === 0 ? (
                  <p className="catalog-empty">Aucune pathologie trouvée.</p>
                ) : (
                  <div className="catalog-table-wrap">
                    <table className="catalog-table" role="table">
                      <thead>
                        <tr>
                          <th>Pathologie</th>
                          <th>Spécialité</th>
                          <th className="catalog-col-num">QCM</th>
                          <th className="catalog-col-num">QCD</th>
                          <th className="catalog-col-num">Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCatalog.map((entry) => (
                          <tr key={entry.pathologyId} className="catalog-row">
                            <td className="catalog-title">{entry.pathologyTitle}</td>
                            <td>
                              <span className="catalog-groupe-badge">{entry.groupe}</span>
                            </td>
                            <td className="catalog-col-num">
                              {entry.qcmCount > 0 ? (
                                <span className="catalog-count qcm">{entry.qcmCount}</span>
                              ) : (
                                <span className="catalog-count zero">—</span>
                              )}
                            </td>
                            <td className="catalog-col-num">
                              {entry.qcdCount > 0 ? (
                                <span className="catalog-count qcd">{entry.qcdCount}</span>
                              ) : (
                                <span className="catalog-count zero">—</span>
                              )}
                            </td>
                            <td className="catalog-col-num">
                              <strong>{entry.totalCount}</strong>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="catalog-launch-btn"
                                disabled={loadingStart}
                                onClick={() => handleStart(entry.pathologyId)}
                                aria-label={`Lancer ${entry.totalCount} exercices pour ${entry.pathologyTitle}`}
                              >
                                ▶ Lancer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </details>

            <details className="training-accordion" open>
              <summary className="training-accordion-summary">Configuration des exercices</summary>
              <div className="training-accordion-body">
                <div className="quiz-config">
                  <fieldset className="quiz-fieldset">
                    <legend>Type de questions</legend>
                    <div className="quiz-mode-grid">
                      {(Object.keys(MODE_CONFIG) as QuizMode[]).map((m) => (
                        <label key={m} className={`quiz-mode-card ${mode === m ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="mode"
                            value={m}
                            checked={mode === m}
                            onChange={() => setMode(m)}
                            className="sr-only"
                          />
                          <span className="quiz-mode-icon">{MODE_CONFIG[m].icon}</span>
                          <span className="quiz-mode-label">{MODE_CONFIG[m].label}</span>
                          <span className="quiz-mode-desc">{MODE_CONFIG[m].desc}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="quiz-fieldset">
                    <legend>Nombre de questions</legend>
                    <div className="quiz-limit-grid">
                      {[5, 10, 20, 30].map((n) => (
                        <label key={n} className={`quiz-limit-btn ${limit === n ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="limit"
                            value={n}
                            checked={limit === n}
                            onChange={() => setLimit(n)}
                            className="sr-only"
                          />
                          {n}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div className="quiz-setup-actions">
                  <button type="button" className="btn-primary quiz-start-btn" onClick={() => handleStart()} disabled={loadingStart}>
                    {loadingStart ? 'Demarrage...' : 'Commencer une session'}
                  </button>
                  <Link to="/entrainement/historique" className="btn-secondary">
                    Historique complet
                  </Link>
                </div>
              </div>
            </details>

            {activeSession && (
              <details className="training-accordion" open>
                <summary className="training-accordion-summary">Session interrompue</summary>
                <div className="training-accordion-body">
                  <div className="training-resume-card">
                    <h3>Session interrompue detectee</h3>
                    <p>
                      Session {MODE_CONFIG[activeSession.mode].label} commencée le {formatDateTime(activeSession.startedAt)}.
                      Progression: {activeSession.answeredCount}/{activeSession.totalQuestions}.
                    </p>
                    <button type="button" className="btn-primary" onClick={handleResumeSession}>
                      Reprendre la session
                    </button>
                  </div>
                </div>
              </details>
            )}
          </div>

          <div className="section-shell training-history-card">
            <details className="training-accordion" open>
              <summary className="training-accordion-summary">Historique des sessions</summary>
              <div className="training-accordion-body">
                <div className="training-history-head">
                  <h2>Historique des sessions</h2>
                  <div className="training-history-pagination">
                    <button type="button" className="btn-secondary" onClick={() => setHistoryPage((p) => Math.max(1, p - 1))} disabled={historyPage <= 1 || loadingSetup}>
                      Prec.
                    </button>
                    <span>{historyPage} / {historyPages}</span>
                    <button type="button" className="btn-secondary" onClick={() => setHistoryPage((p) => Math.min(historyPages, p + 1))} disabled={historyPage >= historyPages || loadingSetup}>
                      Suiv.
                    </button>
                  </div>
                </div>

                {loadingSetup ? (
                  <p>Chargement de l historique...</p>
                ) : history.length === 0 ? (
                  <p>Aucune session enregistree pour le moment.</p>
                ) : (
                  <ul className="training-history-list" role="list">
                    {history.map((item) => (
                      <li key={item.id} className="training-history-item">
                        <div>
                          <strong>{MODE_CONFIG[item.mode].label}</strong>
                          <p>{formatDateTime(item.startedAt)}</p>
                        </div>
                        <div>
                          <span>{item.correctCount}/{item.totalQuestions}</span>
                          <p>{item.scorePercentage}%</p>
                        </div>
                        <div>
                          <span>{item.status}</span>
                          <p>{formatDuration(item.durationSeconds)}</p>
                        </div>
                        <button type="button" className="btn-secondary" onClick={() => handleOpenHistoryDetail(item.id)}>
                          Voir detail
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {loadingHistoryDetail && <p>Chargement du detail...</p>}

                {historyDetail && (
                  <div className="training-session-detail">
                    <h3>Detail session {formatDateTime(historyDetail.startedAt)}</h3>
                    <p>
                      Score: {historyDetail.correctCount}/{historyDetail.totalQuestions} ({historyDetail.scorePercentage}%)
                    </p>
                    <ul className="quiz-review-list" role="list">
                      {historyDetail.questions.map((q) => (
                        <li key={q.questionId} className={`quiz-review-item ${q.isCorrect ? 'correct' : 'wrong'}`}>
                          <div className="quiz-review-header">
                            <span className="quiz-review-indicator">{q.isCorrect ? 'OK' : 'KO'}</span>
                            <span className="quiz-review-qtext">{q.questionText}</span>
                            <span className="quiz-type-tag">{q.type}</span>
                          </div>
                          <div className="quiz-review-detail">
                            <span className="wrong-ans">
                              Votre reponse: {q.selectedOptionIndex !== undefined ? q.options[q.selectedOptionIndex]?.text : '-'}
                            </span>
                            <span className="right-ans">
                              Bonne reponse: {q.options[q.correctOptionIndex]?.text}
                            </span>
                          </div>
                          {q.explanation && <p className="quiz-explanation">{q.explanation}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          </div>
        </section>
      </main>
    );
  }

  if (step === 'results') {
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    return (
      <main className="simple-page">
        <nav className="breadcrumb container" aria-label="Fil d'Ariane">
          <Link to="/">Accueil</Link>
          <span className="breadcrumb-sep" aria-hidden="true">›</span>
          <span aria-current="page">Resultats</span>
        </nav>

        <section className="container">
          <div className="section-shell quiz-results">
            <div className="quiz-results-grade" aria-live="polite">
              <h1>{pct >= 80 ? 'Excellent' : pct >= 60 ? 'Bon niveau' : 'Progression en cours'}</h1>
              <p className="quiz-results-score">{score} / {questions.length} · {pct}%</p>
            </div>

            <div className="quiz-progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="quiz-progress-fill" style={{ width: `${pct}%` }} />
            </div>

            <div className="quiz-review">
              <h2>Correction complete</h2>
              <ul className="quiz-review-list" role="list">
                {questions.map((q, index) => {
                  const ans = answers[index];
                  return (
                    <li key={q._id} className={`quiz-review-item ${ans?.isCorrect ? 'correct' : 'wrong'}`}>
                      <div className="quiz-review-header">
                        <span className="quiz-review-indicator">{ans?.isCorrect ? 'OK' : 'KO'}</span>
                        <span className="quiz-review-qtext">{q.questionText}</span>
                        <span className="quiz-type-tag">{q.type}</span>
                      </div>
                      <div className="quiz-review-detail">
                        <span className="wrong-ans">
                          Votre reponse: {ans ? q.options[ans.selectedOptionIndex]?.text : '-'}
                        </span>
                        <span className="right-ans">
                          Bonne reponse: {ans ? q.options[ans.correctOptionIndex]?.text : '-'}
                        </span>
                      </div>
                      {(ans?.explanation || q.explanation) && (
                        <p className="quiz-explanation">{ans?.explanation || q.explanation}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="quiz-results-actions">
              <button type="button" className="btn-primary" onClick={handleRestart}>
                Nouvelle session
              </button>
              <Link to="/pathologies" className="btn-secondary">
                Reviser les fiches
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const q = questions[current];
  const currentAnswer = answers[current];
  const correctOptionIndex = currentAnswer?.correctOptionIndex;

  return (
    <main className="simple-page">
      <nav className="breadcrumb container" aria-label="Fil d'Ariane">
        <Link to="/">Accueil</Link>
        <span className="breadcrumb-sep" aria-hidden="true">›</span>
        <button type="button" className="breadcrumb-btn" onClick={handleRestart}>Entrainement</button>
        <span className="breadcrumb-sep" aria-hidden="true">›</span>
        <span aria-current="page">Question {current + 1} / {questions.length}</span>
      </nav>

      <section className="container">
        <div className="quiz-progress-bar quiz-progress-top" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="section-shell quiz-card">
          <div className="quiz-card-meta">
            <span className="quiz-type-tag">{q.type}</span>
            <span className="quiz-pathology-tag">{q.pathology.title}</span>
          </div>

          <h2 className="quiz-question-text">{q.questionText}</h2>

          <div className="quiz-options" role="group" aria-label="Options de reponse">
            {q.options.map((opt, idx) => {
              let state: 'idle' | 'chosen' | 'correct' | 'wrong' = 'idle';
              if (confirmed) {
                if (idx === correctOptionIndex) state = 'correct';
                else if (idx === selected) state = 'wrong';
              } else if (idx === selected) {
                state = 'chosen';
              }

              return (
                <button
                  key={`${q._id}-${idx}`}
                  type="button"
                  className={`quiz-option quiz-option--${state}`}
                  onClick={() => !confirmed && setSelected(idx)}
                  aria-pressed={selected === idx}
                  aria-disabled={confirmed}
                >
                  <span className="quiz-option-letter">{String.fromCharCode(65 + idx)}</span>
                  <span className="quiz-option-text">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {confirmed && (currentAnswer?.explanation || q.explanation) && (
            <div className="quiz-explanation-box" role="note">
              <strong>Explication</strong>
              <p>{currentAnswer?.explanation || q.explanation}</p>
            </div>
          )}

          <div className="quiz-card-actions">
            {!confirmed ? (
              <button type="button" className="btn-primary" onClick={handleConfirm} disabled={selected === null || loadingAnswer}>
                {loadingAnswer ? 'Validation...' : 'Valider'}
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={handleNext}>
                {current + 1 >= questions.length ? 'Voir les resultats' : 'Question suivante'}
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};
