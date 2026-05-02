import React, { useEffect, useState, useMemo } from 'react';
import { questionService } from '../services/pathologyService';
import { pathologyService } from '../services/pathologyService';

interface QuestionItem {
  _id: string;
  questionText: string;
  type: 'QCM' | 'QCD';
  options: Array<{ text: string; isCorrect: boolean }>;
  pathology?: { _id: string; title: string };
  isHidden?: boolean;
}

interface PathologyItem {
  _id: string;
  title: string;
  groupe?: string;
}

export const AdminQuestionsList: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [pathologies, setPathologies] = useState<PathologyItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');

  const [questionForm, setQuestionForm] = useState({
    pathology: '',
    questionText: '',
    type: 'QCM' as 'QCM' | 'QCD',
    options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }],
    isHidden: true,
  });

  const ok = (text: string) => { setErr(null); setMsg(text); };
  const ko = (text: string) => { setMsg(null); setErr(text); };

  const loadData = async () => {
    try {
      const [qRes, pRes] = await Promise.all([
        questionService.getAdminQuestions(1, 200),
        pathologyService.getAllPathologies(1, 500, true),
      ]);
      setQuestions(qRes.data?.questions ?? []);
      setPathologies(pRes.data?.pathologies ?? []);
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Erreur de chargement des données.');
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const pathologyGroupById = useMemo(() => {
    return pathologies.reduce<Record<string, string>>((acc, pathology) => {
      acc[pathology._id] = pathology.groupe || 'Autres';
      return acc;
    }, {});
  }, [pathologies]);

  const availableGroups = useMemo(
    () => Array.from(new Set(pathologies.map((p) => p.groupe || 'Autres'))).sort(),
    [pathologies],
  );

  const filteredQuestions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return questions.filter((question) => {
      const questionGroup = question.pathology ? pathologyGroupById[question.pathology._id] || 'Autres' : 'Autres';
      const matchesSearch = !search || [
        question.questionText,
        question.type,
        question.pathology?.title || '',
        questionGroup,
      ].some((field) => field.toLowerCase().includes(search));
      const matchesGroup = !groupFilter || questionGroup === groupFilter;
      return matchesSearch && matchesGroup;
    });
  }, [questions, searchTerm, groupFilter, pathologyGroupById]);

  const questionsByGroup = useMemo(() => {
    return filteredQuestions.reduce<Record<string, QuestionItem[]>>((acc, question) => {
      const groupName = question.pathology ? pathologyGroupById[question.pathology._id] || 'Autres' : 'Autres';
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(question);
      return acc;
    }, {});
  }, [filteredQuestions, pathologyGroupById]);

  const createOrUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        pathology: questionForm.pathology,
        questionText: questionForm.questionText,
        type: questionForm.type,
        options: questionForm.options,
      };

      if (editingQuestionId) {
        await questionService.updateAdminQuestion(editingQuestionId, payload);
        ok('Question mise à jour.');
      } else {
        await questionService.createAdminQuestion(payload);
        ok('Question créée.');
      }

      setEditingQuestionId(null);
      setShowModal(false);
      setQuestionForm({
        pathology: '',
        questionText: '',
        type: 'QCM',
        options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }],
        isHidden: true,
      });
      await loadData();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Action question impossible.');
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!window.confirm('Supprimer cette question ?')) return;
    try {
      await questionService.deleteAdminQuestion(id);
      ok('Question supprimée.');
      await loadData();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Suppression question impossible.');
    }
  };

  const openEditModal = (question: QuestionItem) => {
    setEditingQuestionId(question._id);
    const isQCM = question.type === 'QCM';
    const defaultOptions = isQCM
      ? [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ]
      : [
          { text: 'Vrai', isCorrect: true },
          { text: 'Faux', isCorrect: false },
        ];

    setQuestionForm({
      pathology: question.pathology?._id || '',
      questionText: question.questionText,
      type: question.type,
      options: question.options && question.options.length > 0 ? question.options : defaultOptions,
      isHidden: question.isHidden || false,
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingQuestionId(null);
    setQuestionForm({
      pathology: '',
      questionText: '',
      type: 'QCM',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      isHidden: true,
    });
    setShowModal(true);
  };

  const updateQuestionType = (newType: 'QCM' | 'QCD') => {
    setQuestionForm((q) => ({
      ...q,
      type: newType,
      options: newType === 'QCM'
        ? [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ]
        : [
            { text: 'Vrai', isCorrect: true },
            { text: 'Faux', isCorrect: false },
          ],
    }));
  };

  const updateOption = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setQuestionForm((q) => ({
      ...q,
      options: q.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  return (
    <main className="adm-shell">
      <div className="adm-content">
        <header className="adm-topbar">
          <div>
            <h1 className="adm-topbar__title">Gestion des Questions</h1>
            <p style={{ margin: '0.2rem 0 0', color: '#475569', fontWeight: 600 }}>Administration des questions d'entraînement</p>
          </div>
        </header>

        {msg && <div className="adm-alert adm-alert--success">{msg}</div>}
        {err && <div className="adm-alert adm-alert--error">{err}</div>}

        <section className="adm-panel">
          <div className="adm-section-toolbar">
            <h3 className="adm-section-title">Questions ({filteredQuestions.length})</h3>
            <button type="button" className="adm-btn adm-btn--ok" onClick={openCreateModal}>
              Ajouter une question
            </button>
          </div>

          <div className="adm-global-filters">
            <label className="adm-global-filters__label">
              Rechercher
              <input
                type="search"
                className="adm-search"
                placeholder="Texte, pathologie, groupe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
            <label className="adm-global-filters__label">
              Groupe
              <select
                className="adm-select"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
              >
                <option value="">Tous</option>
                {availableGroups.map((groupName) => (
                  <option key={groupName} value={groupName}>{groupName}</option>
                ))}
              </select>
            </label>
          </div>

          {Object.entries(questionsByGroup).length === 0 ? (
            <div className="adm-alert adm-alert--warn">Aucune question ne correspond aux filtres.</div>
          ) : (
            Object.entries(questionsByGroup).map(([groupName, groupQuestions]) => (
              <details key={groupName} className="adm-accordion" open style={{ marginBottom: '1rem' }}>
                <summary className="adm-accordion__summary">
                  {groupName} ({groupQuestions.length})
                </summary>
                <div className="adm-accordion__panel">
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Question</th>
                          <th>Pathologie</th>
                          <th>Type</th>
                          <th>Masquée</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupQuestions.map((q) => (
                          <tr key={q._id}>
                            <td>{q.questionText}</td>
                            <td>{q.pathology?.title || '—'}</td>
                            <td>{q.type}</td>
                            <td>{q.isHidden ? 'Oui' : 'Non'}</td>
                            <td>
                              <button
                                type="button"
                                className="adm-btn"
                                onClick={() => openEditModal(q)}
                              >
                                Éditer
                              </button>
                              <button
                                type="button"
                                className="adm-btn adm-btn--danger"
                                style={{ marginLeft: '0.5rem' }}
                                onClick={() => deleteQuestion(q._id)}
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </details>
            ))
          )}
        </section>
      </div>

      {showModal && (
        <div className="adm-modal">
          <div className="adm-modal__content">
            <div className="adm-modal__header">
              <h3>{editingQuestionId ? 'Modifier la Question' : 'Nouvelle Question'}</h3>
              <button
                type="button"
                className="adm-modal__close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={createOrUpdateQuestion} className="adm-modal__body">
              <div className="adm-form-grid adm-form-grid--cols2">
                <label>
                  Pathologie
                  <select
                    value={questionForm.pathology}
                    onChange={(e) => setQuestionForm((q) => ({ ...q, pathology: e.target.value }))}
                    required
                  >
                    <option value="">Sélectionner</option>
                    {pathologies.map((p) => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Type
                  <select
                    value={questionForm.type}
                    onChange={(e) => updateQuestionType(e.target.value as 'QCM' | 'QCD')}
                  >
                    <option value="QCM">QCM</option>
                    <option value="QCD">QCD</option>
                  </select>
                </label>
                <label style={{ gridColumn: '1/-1' }}>
                  Énoncé
                  <input
                    value={questionForm.questionText}
                    onChange={(e) => setQuestionForm((q) => ({ ...q, questionText: e.target.value }))}
                    required
                  />
                </label>
                <label className="adm-checkbox-label" style={{ gridColumn: '1/-1' }}>
                  <input
                    type="checkbox"
                    checked={questionForm.isHidden}
                    onChange={(e) => setQuestionForm((q) => ({ ...q, isHidden: e.target.checked }))}
                  />
                  Masquée
                </label>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <h4>Options ({questionForm.options.length})</h4>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="adm-form-row" style={{ marginBottom: '0.5rem' }}>
                    <input
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      required
                      disabled={questionForm.type === 'QCD' && (index === 0 || index === 1)}
                    />
                    <label className="adm-checkbox-label">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                      />
                      Correcte
                    </label>
                  </div>
                ))}
              </div>

              <div className="adm-modal__footer">
                <button type="submit" className="adm-btn adm-btn--ok">
                  {editingQuestionId ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  className="adm-btn"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
