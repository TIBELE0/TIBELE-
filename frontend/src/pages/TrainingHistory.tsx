import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { questionService } from '../services/pathologyService';

type QuizMode = 'QCM' | 'QCD' | 'all';
type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

interface HistoryItem {
  id: string;
  mode: QuizMode;
  status: SessionStatus;
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

const modeLabel: Record<QuizMode, string> = {
  QCM: 'QCM',
  QCD: 'QCD',
  all: 'Mixte',
};

const statusLabel: Record<SessionStatus, string> = {
  in_progress: 'En cours',
  completed: 'Terminee',
  abandoned: 'Abandonnee',
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

const escapeCsvCell = (value: string | number): string => {
  const raw = String(value ?? '');
  if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
};

export const TrainingHistory: React.FC = () => {
  const [sessions, setSessions] = useState<HistoryItem[]>([]);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [mode, setMode] = useState<'' | QuizMode>('');
  const [status, setStatus] = useState<'' | SessionStatus>('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const filtersKey = useMemo(
    () => JSON.stringify({ mode, status, minScore, maxScore, dateFrom, dateTo, page }),
    [mode, status, minScore, maxScore, dateFrom, dateTo, page],
  );

  const loadHistory = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await questionService.getTrainingHistoryFiltered({
        page,
        limit: 20,
        mode: mode || undefined,
        status: status || undefined,
        minScore: minScore !== '' ? Number(minScore) : undefined,
        maxScore: maxScore !== '' ? Number(maxScore) : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      setSessions(res.data.sessions as HistoryItem[]);
      setPages(res.data.pages ?? 1);
    } catch {
      setErrorMsg('Impossible de charger l historique avec ces filtres.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const handleApplyFilters = () => {
    setPage(1);
    loadHistory().catch(() => undefined);
  };

  const handleResetFilters = () => {
    setMode('');
    setStatus('');
    setMinScore('');
    setMaxScore('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleOpenDetail = async (sessionId: string) => {
    setLoadingDetail(true);
    setDetail(null);

    try {
      const res = await questionService.getTrainingSession(sessionId);
      setDetail(res.data as SessionDetail);
    } catch {
      setErrorMsg('Impossible de charger le detail de la session.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Date debut',
      'Date fin',
      'Mode',
      'Statut',
      'Questions',
      'Repondues',
      'Bonnes',
      'Score %',
      'Duree (s)',
    ];

    const rows = sessions.map((item) => [
      formatDateTime(item.startedAt),
      formatDateTime(item.completedAt),
      modeLabel[item.mode],
      statusLabel[item.status],
      item.totalQuestions,
      item.answeredCount,
      item.correctCount,
      item.scorePercentage,
      item.durationSeconds ?? 0,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsvCell(cell as string | number)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historique-entrainement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    const rowsHtml = sessions
      .map(
        (item) => `
          <tr>
            <td>${formatDateTime(item.startedAt)}</td>
            <td>${modeLabel[item.mode]}</td>
            <td>${statusLabel[item.status]}</td>
            <td>${item.correctCount}/${item.totalQuestions}</td>
            <td>${item.scorePercentage}%</td>
            <td>${formatDuration(item.durationSeconds)}</td>
          </tr>
        `,
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Historique Entrainement</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin-bottom: 8px; }
            p { color: #444; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
            th { background: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>Historique Entrainement</h1>
          <p>Export du ${new Date().toLocaleString('fr-FR')}</p>
          <table>
            <thead>
              <tr>
                <th>Date debut</th>
                <th>Mode</th>
                <th>Statut</th>
                <th>Resultat</th>
                <th>Score</th>
                <th>Duree</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <main className="simple-page">
      <nav className="breadcrumb container" aria-label="Fil d'Ariane">
        <Link to="/">Accueil</Link>
        <span className="breadcrumb-sep" aria-hidden="true">›</span>
        <Link to="/entrainement">Entrainement</Link>
        <span className="breadcrumb-sep" aria-hidden="true">›</span>
        <span aria-current="page">Historique</span>
      </nav>

      <section className="container quiz-setup">
        <div className="section-shell training-history-page-head">
          <h1 className="quiz-setup-title module-main-title">Historique</h1>
          <p className="quiz-setup-sub module-main-subtitle">filtrez vos sessions et exportez vos performances en csv ou pdf.</p>

          <div className="training-filters-grid">
            <label>
              Mode
              <select value={mode} onChange={(e) => setMode(e.target.value as '' | QuizMode)}>
                <option value="">Tous</option>
                <option value="QCM">QCM</option>
                <option value="QCD">QCD</option>
                <option value="all">Mixte</option>
              </select>
            </label>

            <label>
              Statut
              <select value={status} onChange={(e) => setStatus(e.target.value as '' | SessionStatus)}>
                <option value="">Tous</option>
                <option value="completed">Terminee</option>
                <option value="in_progress">En cours</option>
                <option value="abandoned">Abandonnee</option>
              </select>
            </label>

            <label>
              Score min
              <input type="number" min={0} max={100} value={minScore} onChange={(e) => setMinScore(e.target.value)} />
            </label>

            <label>
              Score max
              <input type="number" min={0} max={100} value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
            </label>

            <label>
              Date debut
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </label>

            <label>
              Date fin
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </label>
          </div>

          <div className="training-filters-actions">
            <button type="button" className="btn-primary" onClick={handleApplyFilters}>Appliquer</button>
            <button type="button" className="btn-secondary" onClick={handleResetFilters}>Reinitialiser</button>
            <button type="button" className="btn-secondary" onClick={handleExportCsv}>Exporter CSV</button>
            <button type="button" className="btn-secondary" onClick={handleExportPdf}>Exporter PDF</button>
          </div>
        </div>

        <div className="section-shell training-history-card">
          {errorMsg && <p className="page-error">{errorMsg}</p>}

          {loading ? (
            <p>Chargement de l historique...</p>
          ) : sessions.length === 0 ? (
            <p>Aucune session avec ces filtres.</p>
          ) : (
            <ul className="training-history-list" role="list">
              {sessions.map((item) => (
                <li key={item.id} className="training-history-item">
                  <div>
                    <strong>{modeLabel[item.mode]}</strong>
                    <p>{formatDateTime(item.startedAt)}</p>
                  </div>
                  <div>
                    <span>{item.correctCount}/{item.totalQuestions}</span>
                    <p>{item.scorePercentage}%</p>
                  </div>
                  <div>
                    <span>{statusLabel[item.status]}</span>
                    <p>{formatDuration(item.durationSeconds)}</p>
                  </div>
                  <button type="button" className="btn-secondary" onClick={() => handleOpenDetail(item.id)}>
                    Voir detail
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="training-history-pagination">
            <button type="button" className="btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Prec.
            </button>
            <span>{page} / {pages}</span>
            <button type="button" className="btn-secondary" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>
              Suiv.
            </button>
          </div>

          {loadingDetail && <p>Chargement du detail...</p>}

          {detail && (
            <div className="training-session-detail">
              <h3>Session du {formatDateTime(detail.startedAt)}</h3>
              <p>
                Score: {detail.correctCount}/{detail.totalQuestions} ({detail.scorePercentage}%)
              </p>
              <ul className="quiz-review-list" role="list">
                {detail.questions.map((q) => (
                  <li key={q.questionId} className={`quiz-review-item ${q.isCorrect ? 'correct' : 'wrong'}`}>
                    <div className="quiz-review-header">
                      <span className="quiz-review-indicator">{q.isCorrect ? 'OK' : 'KO'}</span>
                      <span className="quiz-review-qtext">{q.questionText}</span>
                      <span className="quiz-type-tag">{q.type}</span>
                    </div>
                    <div className="quiz-review-detail">
                      <span className="wrong-ans">Votre reponse: {q.selectedOptionIndex !== undefined ? q.options[q.selectedOptionIndex]?.text : '-'}</span>
                      <span className="right-ans">Bonne reponse: {q.options[q.correctOptionIndex]?.text}</span>
                    </div>
                    {q.explanation && <p className="quiz-explanation">{q.explanation}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
