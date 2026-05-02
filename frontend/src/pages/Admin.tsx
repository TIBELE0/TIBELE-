import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminService, forumService, pathologyService, questionService } from '../services/pathologyService';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface GroupItem { _id: string; name: string; slug: string; description?: string }
interface PathologyItem { _id: string; title: string; shortDescription: string; groupe: string; isFree: boolean; isHidden?: boolean }
interface QuestionItem {
  _id: string;
  questionText: string;
  type: 'QCM' | 'QCD';
  pathology?: { _id: string; title: string };
  options?: Array<{ text: string; isCorrect: boolean }>;
  isHidden?: boolean;
}
interface TopicItem {
  _id: string;
  title: string;
  content: string;
  isPinned?: boolean;
  replyCount: number;
  author?: { fullName?: string; email?: string };
}
interface UserItem {
  _id: string;
  email: string;
  fullName?: string;
  role: 'user' | 'admin';
  matricule?: string;
  school?: string;
  studyYear?: string;
  major?: string;
  category?: 'student' | 'professional' | 'other';
  profession?: string;
  matriculeValidated?: boolean;
  isBanned?: boolean;
  createdAt: string;
}
interface SiteSettings {
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  registrationsOpen: boolean;
  messageMaintenance: string;
  primaryColor: string;
  secondaryColor: string;
  donationUrl: string;
  donationPopupIntervalMinutes: number;
}
interface AuditLogItem {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  actorEmail?: string;
  createdAt: string;
}

interface DashboardData {
  overview?: {
    totalUsers: number;
    totalClients: number;
    totalPathologies: number;
    totalQuestions: number;
    totalTopics: number;
    totalMessages: number;
    pendingMatricules: number;
    bannedUsers: number;
  };
  recentUsers?: Array<{ _id: string; email: string; role: 'user' | 'admin'; matriculeValidated?: boolean; isBanned?: boolean; createdAt: string }>;
  recentTopics?: Array<{ _id: string; title: string; isPinned?: boolean; createdAt: string; author?: { email?: string; fullName?: string } }>;
}

interface AdvancedAnalytics {
  userRoleDistribution?: Array<{ name: string; value: number }>;
  subscriptionDistribution?: Array<{ name: string; value: number }>;
  paymentMethodDistribution?: Array<{ name: string; value: number }>;
  pathologyGroupDistribution?: Array<{ name: string; value: number }>;
  forumActivity?: Array<{ label: string; topics: number; messages: number }>;
  trainingModeDistribution?: Array<{ name: string; value: number }>;
  trainingOverview?: { totalSessions: number; completedSessions: number; avgScore: number };
}

const EMPTY_SETTINGS: SiteSettings = {
  siteName: 'TIBELE Admin',
  supportEmail: '',
  maintenanceMode: false,
  registrationsOpen: true,
  messageMaintenance: 'Maintenance en cours. Merci de revenir plus tard.',
  primaryColor: '#0b3b5a',
  secondaryColor: '#2e8b57',
  donationUrl: 'https://pay.djamo.com/o5y88',
  donationPopupIntervalMinutes: 5,
};

const COLORS = ['#0b3b5a', '#1e6091', '#059669', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

export const Admin: React.FC = () => {
  const { refreshSettings } = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [seedingDemo, setSeedingDemo] = useState(false);

  const tab = useMemo(() => {
    const path = location.pathname;
    if (path === '/admin/groupes') return 'gestion';
    if (path === '/admin/pathologies') return 'gestion';
    if (path === '/admin/questions') return 'gestion';
    if (path === '/admin/analytics') return 'analytics';
    if (path === '/admin/forum') return 'forum';
    if (path === '/admin/comptes') return 'comptes';
    if (path === '/admin/parametres') return 'parametres';
    if (path === '/admin/audit') return 'audit';
    return 'accueil';
  }, [location.pathname]);

  const openGestionSection = useMemo(() => {
    const path = location.pathname;
    if (path === '/admin/groupes') return 'groupes';
    if (path === '/admin/pathologies') return 'pathologies';
    if (path === '/admin/questions') return 'questions';
    return 'groupes';
  }, [location.pathname]);

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<7 | 30 | 90>(30);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [advancedAnalytics, setAdvancedAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [pathologies, setPathologies] = useState<PathologyItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const usersByCategoryAndSubgroup = useMemo(() => {
    const grouped: Record<string, Record<string, UserItem[]>> = {};
    users.forEach((user) => {
      const category = user.category || 'other';
      const subgroup = category === 'student'
        ? user.school || 'Non renseigné'
        : category === 'professional'
          ? user.profession || 'Sans spécialité'
          : user.major || 'Autre';

      if (!grouped[category]) {
        grouped[category] = {};
      }
      if (!grouped[category][subgroup]) {
        grouped[category][subgroup] = [];
      }
      grouped[category][subgroup].push(user);
    });
    return grouped;
  }, [users]);
  const [settings, setSettings] = useState<SiteSettings>(EMPTY_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const [newGroup, setNewGroup] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');

  const pathologiesByGroupe = useMemo(() => {
    return pathologies.reduce<Record<string, PathologyItem[]>>((acc, pathology) => {
      const groupName = pathology.groupe || 'Autres';
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(pathology);
      return acc;
    }, {});
  }, [pathologies]);

  const questionsByType = useMemo(() => {
    return questions.reduce<Record<string, QuestionItem[]>>((acc, question) => {
      const key = question.type || 'Autre';
      if (!acc[key]) acc[key] = [];
      acc[key].push(question);
      return acc;
    }, {});
  }, [questions]);

  const [pathologyForm, setPathologyForm] = useState({
    title: '',
    shortDescription: '',
    groupe: 'Autres',
    definition: '',
    examinations: '',
    referentialDiagnosis: '',
    onSiteTreatment: '',
    dischargeOrder: '',
    prevention: '',
    isFree: true,
    isHidden: true,
  });
  const [editingPathologyId, setEditingPathologyId] = useState<string | null>(null);

  const [questionForm, setQuestionForm] = useState({
    pathology: '',
    questionText: '',
    type: 'QCM' as 'QCM' | 'QCD',
    options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }],
    isHidden: true,
  });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const ok = (text: string) => { setErr(null); setMsg(text); };
  const ko = (text: string) => { setMsg(null); setErr(text); };

  const loadAll = async () => {
    try {
      const [d, a, g, p, q, t, u, s, logs] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAdvancedAnalytics(analyticsPeriod),
        adminService.getGroups(),
        pathologyService.getAllPathologies(1, 500, true),
        questionService.getAdminQuestions(1, 200),
        forumService.getTopics(1, 200),
        adminService.getUsers(1, 200),
        adminService.getSiteSettings(),
        adminService.getAuditLogs(1, 100),
      ]);

      setDashboard(d.data as DashboardData);
      setAdvancedAnalytics((a.data ?? null) as AdvancedAnalytics | null);
      setGroups((g.data?.groups ?? []) as GroupItem[]);
      setPathologies((p.data?.pathologies ?? []) as PathologyItem[]);
      setQuestions((q.data?.questions ?? []) as QuestionItem[]);
      setTopics((t.data?.topics ?? []) as TopicItem[]);
      setUsers((u.data?.users ?? []) as UserItem[]);
      setSettings((s.data ?? EMPTY_SETTINGS) as SiteSettings);
      setAuditLogs((logs.data?.logs ?? []) as AuditLogItem[]);
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Erreur de chargement du panel admin.');
    }
  };

  useEffect(() => {
    void loadAll();
  }, [analyticsPeriod]);

  const groupsSorted = useMemo(() => [...groups].sort((a, b) => a.name.localeCompare(b.name)), [groups]);

  const overviewChartData = useMemo(() => {
    const o = dashboard?.overview;
    if (!o) {
      return [];
    }
    return [
      { label: 'Utilisateurs', value: o.totalUsers ?? 0 },
      { label: 'Pathologies', value: o.totalPathologies ?? 0 },
      { label: 'Questions', value: o.totalQuestions ?? 0 },
      { label: 'Sujets', value: o.totalTopics ?? 0 },
    ];
  }, [dashboard]);

  const createOrUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroupId) {
        await adminService.updateGroup(editingGroupId, { name: editingGroupName });
        ok('Groupe mis à jour.');
      } else {
        await adminService.createGroup({ name: newGroup });
        ok('Groupe créé.');
      }
      setNewGroup('');
      setEditingGroupId(null);
      setEditingGroupName('');
      await loadAll();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Action groupe impossible.');
    }
  };

  const deleteGroup = async (id: string) => {
    if (!window.confirm('Supprimer ce groupe ?')) return;
    try {
      await adminService.deleteGroup(id);
      ok('Groupe supprimé.');
      await loadAll();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Suppression groupe impossible.');
    }
  };

  const createOrUpdatePathology = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPathologyId) {
        await pathologyService.updatePathology(editingPathologyId, pathologyForm);
        ok('Pathologie mise à jour.');
      } else {
        await pathologyService.createPathology(pathologyForm);
        ok('Pathologie créée.');
      }
      setEditingPathologyId(null);
      setPathologyForm({
        title: '', shortDescription: '', groupe: 'Autres', definition: '', examinations: '',
        referentialDiagnosis: '', onSiteTreatment: '', dischargeOrder: '', prevention: '', isFree: true,
        isHidden: true,
      });
      await loadAll();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Action pathologie impossible.');
    }
  };

  const deletePathology = async (id: string) => {
    if (!window.confirm('Supprimer cette pathologie ?')) return;
    try {
      await pathologyService.deletePathology(id);
      ok('Pathologie supprimée.');
      await loadAll();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Suppression pathologie impossible.');
    }
  };

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
      setQuestionForm({
        pathology: '',
        questionText: '',
        type: 'QCM',
        options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }],
        isHidden: true,
      });
      await loadAll();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Action question impossible.');
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!window.confirm('Supprimer cette question ?')) return;
    try {
      await questionService.deleteAdminQuestion(id);
      ok('Question supprimée.');
      await loadAll();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Suppression question impossible.');
    }
  };

  const togglePinTopic = async (id: string, isPinned: boolean) => {
    try {
      await adminService.pinTopic(id, !isPinned);
      ok(isPinned ? 'Sujet désépinglé.' : 'Sujet épinglé.');
      await loadAll();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Mise à jour épinglage impossible.');
    }
  };

  const deleteTopic = async (id: string) => {
    if (!window.confirm('Supprimer ce sujet ?')) return;
    try {
      await forumService.deleteTopic(id);
      ok('Sujet supprimé.');
      await loadAll();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Suppression sujet impossible.');
    }
  };

  const setBan = async (id: string, banned: boolean) => {
    try {
      await adminService.setUserBanStatus(id, banned);
      ok('Statut bannissement mis à jour.');
      await loadAll();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Action bannissement impossible.');
    }
  };

  const setValidation = async (id: string, validated: boolean) => {
    try {
      await adminService.setUserMatriculeValidation(id, validated);
      ok('Validation matricule mise à jour.');
      await loadAll();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Action validation impossible.');
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.updateSiteSettings(settings);
      await refreshSettings();
      ok('Paramètres sauvegardés.');
      await loadAll();
    } catch (e: any) {
      ko(e?.response?.data?.message || 'Sauvegarde paramètres impossible.');
    }
  };

  return (
    <main className="adm-shell">
      <div className="adm-content">
        <header className="adm-topbar">
          <div>
            <h1 className="adm-topbar__title">Console Admin</h1>
            <p style={{ margin: '0.2rem 0 0', color: '#475569', fontWeight: 600 }}>Tableau de bord complet avec gestion, moderation et analytics</p>
          </div>
        </header>

        {msg && <div className="adm-alert adm-alert--success">{msg}</div>}
        {err && <div className="adm-alert adm-alert--error">{err}</div>}

        <section className="adm-panel">
          {tab === 'accueil' && (
            <div className="adm-dashboard">
              <div className="adm-kpi-row">
                <article className="adm-kpi"><span className="adm-kpi__label">Utilisateurs</span><strong className="adm-kpi__value">{dashboard?.overview?.totalUsers ?? 0}</strong></article>
                <article className="adm-kpi"><span className="adm-kpi__label">Pathologies</span><strong className="adm-kpi__value">{dashboard?.overview?.totalPathologies ?? 0}</strong></article>
                <article className="adm-kpi"><span className="adm-kpi__label">Questions</span><strong className="adm-kpi__value">{dashboard?.overview?.totalQuestions ?? 0}</strong></article>
                <article className="adm-kpi"><span className="adm-kpi__label">Sujets Forum</span><strong className="adm-kpi__value">{dashboard?.overview?.totalTopics ?? 0}</strong></article>
                <article className="adm-kpi"><span className="adm-kpi__label">Matricules en attente</span><strong className="adm-kpi__value">{dashboard?.overview?.pendingMatricules ?? 0}</strong></article>
                <article className="adm-kpi"><span className="adm-kpi__label">Comptes bannis</span><strong className="adm-kpi__value">{dashboard?.overview?.bannedUsers ?? 0}</strong></article>
              </div>

              <article className="adm-chart-card">
                <h3 className="adm-chart-card__title">Vue rapide de la plateforme</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={overviewChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0b3b5a" />
                  </BarChart>
                </ResponsiveContainer>
              </article>

              <div className="adm-tables-row">
                <section className="adm-table-section">
                  <h3 className="adm-section-title">Derniers comptes créés</h3>
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead><tr><th>Email</th><th>Rôle</th><th>Validation</th><th>Date</th></tr></thead>
                      <tbody>
                        {(dashboard?.recentUsers ?? []).map((u) => (
                          <tr key={u._id}>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>{u.role === 'admin' ? 'N/A' : (u.matriculeValidated ? 'Validé' : 'En attente')}</td>
                            <td>{new Date(u.createdAt).toLocaleString('fr-FR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="adm-table-section">
                  <h3 className="adm-section-title">Derniers sujets forum</h3>
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead><tr><th>Titre</th><th>Auteur</th><th>État</th><th>Date</th></tr></thead>
                      <tbody>
                        {(dashboard?.recentTopics ?? []).map((t) => (
                          <tr key={t._id}>
                            <td>{t.title}</td>
                            <td>{t.author?.fullName || t.author?.email || '—'}</td>
                            <td>{t.isPinned ? 'Épinglé' : 'Normal'}</td>
                            <td>{new Date(t.createdAt).toLocaleString('fr-FR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          )}

          {tab === 'analytics' && (
            <>
              <div className="adm-gestion-subnav" style={{ marginBottom: '0.8rem' }}>
                <button type="button" className={`adm-btn ${analyticsPeriod === 7 ? 'adm-btn--ok' : ''}`} onClick={() => setAnalyticsPeriod(7)}>7 jours</button>
                <button type="button" className={`adm-btn ${analyticsPeriod === 30 ? 'adm-btn--ok' : ''}`} onClick={() => setAnalyticsPeriod(30)}>30 jours</button>
                <button type="button" className={`adm-btn ${analyticsPeriod === 90 ? 'adm-btn--ok' : ''}`} onClick={() => setAnalyticsPeriod(90)}>90 jours</button>
              </div>

              <div className="adm-kpi-row adm-kpi-row--small">
                <article className="adm-kpi"><span className="adm-kpi__label">Sessions entraînement</span><strong className="adm-kpi__value">{advancedAnalytics?.trainingOverview?.totalSessions ?? 0}</strong></article>
                <article className="adm-kpi"><span className="adm-kpi__label">Sessions terminées</span><strong className="adm-kpi__value">{advancedAnalytics?.trainingOverview?.completedSessions ?? 0}</strong></article>
                <article className="adm-kpi"><span className="adm-kpi__label">Score moyen</span><strong className="adm-kpi__value">{(advancedAnalytics?.trainingOverview?.avgScore ?? 0).toFixed(1)}%</strong></article>
              </div>

              <div className="adm-charts-row">
              <article className="adm-chart-card">
                <h3 className="adm-chart-card__title">Activité forum</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={advancedAnalytics?.forumActivity ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="topics" stroke="#0b3b5a" strokeWidth={2} />
                    <Line type="monotone" dataKey="messages" stroke="#059669" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </article>

              <article className="adm-chart-card">
                <h3 className="adm-chart-card__title">Pathologies par groupe</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={advancedAnalytics?.pathologyGroupDistribution ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1e6091" />
                  </BarChart>
                </ResponsiveContainer>
              </article>

              <article className="adm-chart-card">
                <h3 className="adm-chart-card__title">Répartition des comptes</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={advancedAnalytics?.userRoleDistribution ?? []} dataKey="value" nameKey="name" outerRadius={90}>
                      {(advancedAnalytics?.userRoleDistribution ?? []).map((_, idx) => (
                        <Cell key={`cell-role-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </article>

              <article className="adm-chart-card">
                <h3 className="adm-chart-card__title">Validation / modération comptes</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={advancedAnalytics?.subscriptionDistribution ?? []} dataKey="value" nameKey="name" outerRadius={90}>
                      {(advancedAnalytics?.subscriptionDistribution ?? []).map((_, idx) => (
                        <Cell key={`cell-sub-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </article>

              <article className="adm-chart-card">
                <h3 className="adm-chart-card__title">Répartition des sessions</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={advancedAnalytics?.trainingModeDistribution ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#059669" />
                  </BarChart>
                </ResponsiveContainer>
              </article>
            </div>
            </>
          )}

          {tab === 'gestion' && (
            <div className="adm-accordion">
              <div className="adm-accordion__item">
                <button type="button" className={`adm-accordion__header ${openGestionSection === 'groupes' ? 'adm-accordion__header--open' : ''}`} onClick={() => navigate('/admin/groupes')}>
                  <span>Groupe</span>
                  <span>{openGestionSection === 'groupes' ? '−' : '+'}</span>
                </button>
                {openGestionSection === 'groupes' && (
                  <div className="adm-accordion__panel">
                    <div className="adm-section-toolbar">
                      <h3 className="adm-section-title">Groupes</h3>
                      <button type="button" className="adm-btn adm-btn--ok" onClick={() => navigate('/admin/pathologies')}>Voir Pathologies</button>
                    </div>
                    <form onSubmit={createOrUpdateGroup} className="adm-form-row">
                      <label>
                        Nom du groupe
                        <input value={editingGroupId ? editingGroupName : newGroup} onChange={(e) => editingGroupId ? setEditingGroupName(e.target.value) : setNewGroup(e.target.value)} required />
                      </label>
                      <button type="submit" className="adm-btn adm-btn--ok">{editingGroupId ? 'Mettre à jour' : 'Ajouter'}</button>
                    </form>

                    <div className="adm-table-wrap" style={{ marginTop: '1rem' }}>
                      <table className="adm-table">
                        <thead><tr><th>Nom</th><th>Slug</th><th>Actions</th></tr></thead>
                        <tbody>
                          {groupsSorted.map((g) => (
                            <tr key={g._id}>
                              <td>{g.name}</td>
                              <td>{g.slug}</td>
                              <td>
                                <button type="button" className="adm-btn" onClick={() => { setEditingGroupId(g._id); setEditingGroupName(g.name); }}>Éditer</button>
                                <button type="button" className="adm-btn adm-btn--danger" onClick={() => deleteGroup(g._id)} style={{ marginLeft: '0.5rem' }}>Supprimer</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="adm-accordion__item">
                <button type="button" className={`adm-accordion__header ${openGestionSection === 'pathologies' ? 'adm-accordion__header--open' : ''}`} onClick={() => navigate('/admin/pathologies')}>
                  <span>Pathologies</span>
                  <span>{openGestionSection === 'pathologies' ? '−' : '+'}</span>
                </button>
                {openGestionSection === 'pathologies' && (
                  <div className="adm-accordion__panel">
                    <div className="adm-section-toolbar">
                      <h3 className="adm-section-title">Pathologies</h3>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button type="button" className="adm-btn adm-btn--ok" onClick={() => navigate('/admin/questions')}>Voir Questions</button>
                        <button type="button" className="adm-btn adm-btn--warn" onClick={async () => {
                          try {
                            setSeedingDemo(true);
                            await adminService.seedDemoData();
                            ok('300 pathologies et 100 exercices ajoutés.');
                            await loadAll();
                          } catch (e: any) {
                            ko(e?.response?.data?.message || 'Échec de la génération des données.');
                          } finally {
                            setSeedingDemo(false);
                          }
                        }} disabled={seedingDemo}>{seedingDemo ? 'Génération en cours…' : 'Générer 300 pathologies et 100 exercices'}</button>
                      </div>
                    </div>
                    <form onSubmit={createOrUpdatePathology} className="adm-form-grid adm-form-grid--cols2">
                      <label>Titre<input value={pathologyForm.title} onChange={(e) => setPathologyForm((p) => ({ ...p, title: e.target.value }))} required /></label>
                      <label>Résumé<input value={pathologyForm.shortDescription} onChange={(e) => setPathologyForm((p) => ({ ...p, shortDescription: e.target.value }))} required /></label>
                      <label>Groupe
                        <select value={pathologyForm.groupe} onChange={(e) => setPathologyForm((p) => ({ ...p, groupe: e.target.value }))}>
                          {groupsSorted.map((g) => <option key={g._id} value={g.name}>{g.name}</option>)}
                          <option value="Autres">Autres</option>
                        </select>
                      </label>
                      <label className="adm-checkbox-label"><input type="checkbox" checked={pathologyForm.isFree} onChange={(e) => setPathologyForm((p) => ({ ...p, isFree: e.target.checked }))} /> Gratuit</label>
                      <label className="adm-checkbox-label"><input type="checkbox" checked={pathologyForm.isHidden} onChange={(e) => setPathologyForm((p) => ({ ...p, isHidden: e.target.checked }))} /> Masquée</label>
                      <label>Définition<textarea value={pathologyForm.definition} onChange={(e) => setPathologyForm((p) => ({ ...p, definition: e.target.value }))} required /></label>
                      <label>Examens<textarea value={pathologyForm.examinations} onChange={(e) => setPathologyForm((p) => ({ ...p, examinations: e.target.value }))} required /></label>
                      <label>Diagnostic<textarea value={pathologyForm.referentialDiagnosis} onChange={(e) => setPathologyForm((p) => ({ ...p, referentialDiagnosis: e.target.value }))} required /></label>
                      <label>Traitement<textarea value={pathologyForm.onSiteTreatment} onChange={(e) => setPathologyForm((p) => ({ ...p, onSiteTreatment: e.target.value }))} required /></label>
                      <label>Ordonnance<textarea value={pathologyForm.dischargeOrder} onChange={(e) => setPathologyForm((p) => ({ ...p, dischargeOrder: e.target.value }))} required /></label>
                      <label>Prévention<textarea value={pathologyForm.prevention} onChange={(e) => setPathologyForm((p) => ({ ...p, prevention: e.target.value }))} required /></label>
                      <div className="adm-form-actions">
                        <button type="submit" className="adm-btn adm-btn--ok">{editingPathologyId ? 'Mettre à jour' : 'Créer'}</button>
                        {editingPathologyId && <button type="button" className="adm-btn" onClick={() => { setEditingPathologyId(null); setPathologyForm({ title: '', shortDescription: '', groupe: 'Autres', definition: '', examinations: '', referentialDiagnosis: '', onSiteTreatment: '', dischargeOrder: '', prevention: '', isFree: true, isHidden: true }); }}>Annuler</button>}
                      </div>
                    </form>

                    <div className="adm-table-wrap" style={{ marginTop: '1rem' }}>
                      {Object.entries(pathologiesByGroupe).map(([groupName, groupPathologies]) => (
                        <div key={groupName} style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ margin: '0 0 0.75rem' }}>{groupName}</h4>
                          <table className="adm-table">
                            <thead><tr><th>Titre</th><th>Type</th><th>Masquée</th><th>Actions</th></tr></thead>
                            <tbody>
                              {groupPathologies.map((p) => (
                                <tr key={p._id}>
                                  <td>{p.title}</td>
                                  <td><span className={`adm-badge ${p.isFree ? 'adm-badge--green' : 'adm-badge--yellow'}`}>{p.isFree ? 'Libre' : 'Premium'}</span></td>
                                  <td>{p.isHidden ? 'Oui' : 'Non'}</td>
                                  <td>
                                    <button type="button" className="adm-btn" onClick={() => { setEditingPathologyId(p._id); setPathologyForm((prev) => ({ ...prev, title: p.title, shortDescription: p.shortDescription, groupe: p.groupe, isFree: p.isFree, isHidden: !!p.isHidden })); }}>Éditer</button>
                                    <button type="button" className="adm-btn adm-btn--danger" style={{ marginLeft: '0.5rem' }} onClick={() => deletePathology(p._id)}>Supprimer</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="adm-accordion__item">
                <button type="button" className={`adm-accordion__header ${openGestionSection === 'questions' ? 'adm-accordion__header--open' : ''}`} onClick={() => navigate('/admin/questions')}>
                  <span>Questions</span>
                  <span>{openGestionSection === 'questions' ? '−' : '+'}</span>
                </button>
                {openGestionSection === 'questions' && (
                  <div className="adm-accordion__panel">
                    <div className="adm-section-toolbar">
                      <h3 className="adm-section-title">Questions</h3>
                      <button type="button" className="adm-btn adm-btn--ok" onClick={() => navigate('/admin/groupes')}>Voir Groupes</button>
                    </div>
                    <form onSubmit={createOrUpdateQuestion} className="adm-form-grid adm-form-grid--cols2">
                      <label>Pathologie
                        <select value={questionForm.pathology} onChange={(e) => setQuestionForm((q) => ({ ...q, pathology: e.target.value }))} required>
                          <option value="">Sélectionner</option>
                          {pathologies.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                        </select>
                      </label>
                      <label>Type
                        <select value={questionForm.type} onChange={(e) => setQuestionForm((q) => ({ ...q, type: e.target.value as 'QCM' | 'QCD' }))}>
                          <option value="QCM">QCM</option>
                          <option value="QCD">QCD</option>
                        </select>
                      </label>
                      <label>Énoncé<input value={questionForm.questionText} onChange={(e) => setQuestionForm((q) => ({ ...q, questionText: e.target.value }))} required /></label>
                      <label>Option A<input value={questionForm.options[0].text} onChange={(e) => setQuestionForm((q) => ({ ...q, options: [{ ...q.options[0], text: e.target.value }, q.options[1]] }))} required /></label>
                      <label>Option B<input value={questionForm.options[1].text} onChange={(e) => setQuestionForm((q) => ({ ...q, options: [q.options[0], { ...q.options[1], text: e.target.value }] }))} required /></label>
                      <label className="adm-checkbox-label"><input type="checkbox" checked={questionForm.isHidden} onChange={(e) => setQuestionForm((q) => ({ ...q, isHidden: e.target.checked }))} /> Masquée</label>
                      <div className="adm-form-actions">
                        <button type="button" className="adm-btn" onClick={() => setQuestionForm((q) => ({ ...q, options: [{ ...q.options[0], isCorrect: true }, { ...q.options[1], isCorrect: false }] }))}>Option A correcte</button>
                        <button type="button" className="adm-btn" onClick={() => setQuestionForm((q) => ({ ...q, options: [{ ...q.options[0], isCorrect: false }, { ...q.options[1], isCorrect: true }] }))}>Option B correcte</button>
                        <button type="submit" className="adm-btn adm-btn--ok">{editingQuestionId ? 'Mettre à jour' : 'Créer'}</button>
                      </div>
                    </form>

                    {Object.entries(questionsByType).map(([type, typeQuestions]) => (
                      <div key={type} style={{ marginTop: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 0.75rem' }}>{type}</h4>
                        <div className="adm-table-wrap">
                          <table className="adm-table">
                            <thead><tr><th>Question</th><th>Pathologie</th><th>Masquée</th><th>Actions</th></tr></thead>
                            <tbody>
                              {typeQuestions.map((q) => (
                                <tr key={q._id}>
                                  <td>{q.questionText}</td>
                                  <td>{q.pathology?.title || '—'}</td>
                                  <td>{q.isHidden ? 'Oui' : 'Non'}</td>
                                  <td>
                                    <button type="button" className="adm-btn" onClick={() => {
                                      setEditingQuestionId(q._id);
                                      setQuestionForm({
                                        pathology: q.pathology?._id || '',
                                        questionText: q.questionText,
                                        type: q.type,
                                        options: q.options?.length === 2 ? q.options : [{ text: '', isCorrect: true }, { text: '', isCorrect: false }],
                                        isHidden: !!q.isHidden,
                                      });
                                    }}>Éditer</button>
                                    <button type="button" className="adm-btn adm-btn--danger" style={{ marginLeft: '0.5rem' }} onClick={() => deleteQuestion(q._id)}>Supprimer</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'forum' && (
            <div className="adm-tables-row">
              <section className="adm-table-section">
                <h3 className="adm-section-title">Modération Forum</h3>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead><tr><th>Sujet</th><th>Auteur</th><th>Réponses</th><th>État</th><th>Actions</th></tr></thead>
                    <tbody>
                      {topics.map((t) => (
                        <tr key={t._id}>
                          <td>{t.title}</td>
                          <td>{t.author?.fullName || t.author?.email || '—'}</td>
                          <td>{t.replyCount}</td>
                          <td>{t.isPinned ? '📌 Épinglé' : 'Normal'}</td>
                          <td>
                            <button type="button" className="adm-btn" onClick={() => togglePinTopic(t._id, Boolean(t.isPinned))}>{t.isPinned ? 'Désépingler' : 'Épingler'}</button>
                            <button type="button" className="adm-btn adm-btn--danger" style={{ marginLeft: '0.5rem' }} onClick={() => deleteTopic(t._id)}>Supprimer</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {tab === 'comptes' && (
            <div className="adm-tables-row">
              <section className="adm-table-section">
                <h3 className="adm-section-title">Gestion des utilisateurs</h3>
                <div className="adm-table-wrap">
                  {Object.entries(usersByCategoryAndSubgroup).map(([category, subgroups]) => (
                    <div key={category} style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ margin: '0 0 0.75rem' }}>{category === 'student' ? 'Étudiants' : category === 'professional' ? 'Travailleurs de santé' : 'Autres utilisateurs'}</h4>
                      {Object.entries(subgroups).map(([subgroup, subgroupUsers]) => (
                        <div key={subgroup} style={{ marginBottom: '1rem' }}>
                          <h5 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#334155' }}>{subgroup}</h5>
                          <table className="adm-table">
                            <thead>
                              <tr>
                                <th>Email</th><th>Matricule</th><th>Profession / Filière</th><th>Établissement</th><th>Validation</th><th>Bannissement</th><th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subgroupUsers.map((u) => (
                                <tr key={u._id}>
                                  <td>{u.email}</td>
                                  <td>{u.matricule || '—'}</td>
                                  <td>{u.profession || u.major || '—'}</td>
                                  <td>{u.school || '—'}</td>
                                  <td>{u.matriculeValidated ? 'Validé' : 'En attente'}</td>
                                  <td>{u.isBanned ? 'Banni' : 'Actif'}</td>
                                  <td>
                                    {u.role !== 'admin' && (
                                      <>
                                        <button type="button" className="adm-btn" onClick={() => setValidation(u._id, !Boolean(u.matriculeValidated))}>{u.matriculeValidated ? 'Invalider' : 'Valider'} matricule</button>
                                        <button type="button" className={`adm-btn ${u.isBanned ? 'adm-btn--ok' : 'adm-btn--warn'}`} onClick={() => setBan(u._id, !Boolean(u.isBanned))} style={{ marginLeft: '0.5rem' }}>{u.isBanned ? 'Débannir' : 'Bannir'}</button>
                                        <button type="button" className="adm-btn adm-btn--danger" style={{ marginLeft: '0.5rem' }} onClick={() => adminService.deleteUser(u._id).then(() => loadAll()).catch((e: any) => ko(e?.response?.data?.message || 'Suppression impossible.'))}>Supprimer</button>
                                      </>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {tab === 'parametres' && (
            <form onSubmit={saveSettings} className="adm-settings-form">
              <section className="adm-settings-section">
                <div className="adm-form-grid adm-form-grid--cols2">
                  <label>Nom du site<input value={settings.siteName} onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))} /></label>
                  <label>Email support<input value={settings.supportEmail} onChange={(e) => setSettings((s) => ({ ...s, supportEmail: e.target.value }))} /></label>
                  <label>Couleur principale<input type="color" value={settings.primaryColor} onChange={(e) => setSettings((s) => ({ ...s, primaryColor: e.target.value }))} /></label>
                  <label>Couleur secondaire<input type="color" value={settings.secondaryColor} onChange={(e) => setSettings((s) => ({ ...s, secondaryColor: e.target.value }))} /></label>
                  <label>Lien de don (Soutenir)<input value={settings.donationUrl} onChange={(e) => setSettings((s) => ({ ...s, donationUrl: e.target.value }))} /></label>
                  <label>Intervalle popup don (minutes)<input type="number" min={1} max={120} value={settings.donationPopupIntervalMinutes} onChange={(e) => setSettings((s) => ({ ...s, donationPopupIntervalMinutes: Number(e.target.value) || 5 }))} /></label>
                  <label style={{ gridColumn: '1/-1' }}>Message maintenance<textarea value={settings.messageMaintenance} onChange={(e) => setSettings((s) => ({ ...s, messageMaintenance: e.target.value }))} /></label>
                  <label className="adm-checkbox-label"><input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings((s) => ({ ...s, maintenanceMode: e.target.checked }))} /> Mode maintenance</label>
                  <label className="adm-checkbox-label"><input type="checkbox" checked={settings.registrationsOpen} onChange={(e) => setSettings((s) => ({ ...s, registrationsOpen: e.target.checked }))} /> Inscriptions ouvertes</label>
                </div>

                <div className="adm-chart-card" style={{ marginTop: '1rem' }}>
                  <h3 className="adm-chart-card__title">Aperçu en temps réel</h3>
                  <p style={{ marginBottom: '0.6rem' }}>Nom affiché: <strong>{settings.siteName}</strong></p>
                  <p style={{ marginBottom: '0.6rem' }}>Support: <strong>{settings.supportEmail || 'N/A'}</strong></p>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, background: settings.primaryColor, border: '1px solid #cbd5e1' }} />
                    <span style={{ width: 20, height: 20, borderRadius: 6, background: settings.secondaryColor, border: '1px solid #cbd5e1' }} />
                    <span>Popup don: toutes les {settings.donationPopupIntervalMinutes} min</span>
                  </div>
                </div>

                <div className="adm-form-actions">
                  <button type="submit" className="adm-btn adm-btn--ok adm-btn--lg">Sauvegarder</button>
                </div>
              </section>
            </form>
          )}

          {tab === 'audit' && (
            <div className="adm-tables-row">
              <section className="adm-table-section">
                <h3 className="adm-section-title">Journal d’audit administrateur</h3>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead><tr><th>Date</th><th>Action</th><th>Ressource</th><th>Acteur</th></tr></thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log._id}>
                          <td>{new Date(log.createdAt).toLocaleString('fr-FR')}</td>
                          <td>{log.action}</td>
                          <td>{log.resource}{log.resourceId ? ` (${log.resourceId})` : ''}</td>
                          <td>{log.actorEmail || 'admin'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
