import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pathologyService } from '../services/pathologyService';

interface PathologieItem {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  isFree: boolean;
  groupe: string;
}

export const PathologieGroupe: React.FC = () => {
  const { nom } = useParams<{ nom: string }>();
  const { user } = useAuth();
  const [pathologies, setPathologies] = useState<PathologieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const groupeName = nom ? decodeURIComponent(nom) : '';

  useEffect(() => {
    if (!groupeName) return;
    setLoading(true);
    pathologyService
      .getPathologiesByGroupe(groupeName)
      .then((res) => {
        setPathologies(res.data.pathologies ?? []);
      })
      .catch(() => {
        setError('Impossible de charger les pathologies de ce groupe.');
      })
      .finally(() => setLoading(false));
  }, [groupeName]);

  return (
    <main className="simple-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb container" aria-label="Fil d'Ariane">
        <Link to="/">Accueil</Link>
        <span className="breadcrumb-sep" aria-hidden="true">›</span>
        <Link to="/pathologies">Pathologies</Link>
        <span className="breadcrumb-sep" aria-hidden="true">›</span>
        <span aria-current="page">{groupeName}</span>
      </nav>

      <section className="container">
        <div className="section-shell pathgroup-header">
          <h1 className="module-main-title">Pathologies</h1>
          <p className="pathologies-subtitle module-main-subtitle">
            {loading
              ? 'Chargement…'
              : `${pathologies.length} fiche${pathologies.length !== 1 ? 's' : ''} disponible${pathologies.length !== 1 ? 's' : ''} dans ce groupe.`}
          </p>
        </div>

        {!user && (
          <div className="auth-notice section-shell">
            <p>
              <strong>Connectez-vous ou inscrivez-vous</strong> pour accéder au contenu complet des fiches.
            </p>
            <div className="auth-notice-actions">
              <Link to="/login" className="btn-primary">Se connecter</Link>
              <Link to="/register" className="btn-secondary">S'inscrire gratuitement</Link>
            </div>
          </div>
        )}

        {error && <p className="page-error">{error}</p>}

        {loading ? (
          <div className="page-loader">Chargement…</div>
        ) : pathologies.length === 0 ? (
          <div className="section-shell empty-state">
            <p>Aucune pathologie n'est encore disponible dans ce groupe.</p>
            <Link to="/pathologies" className="btn-secondary">Retour aux groupes</Link>
          </div>
        ) : (
          <ul className="pathology-list" role="list">
            {pathologies.map((p) => (
              <li key={p._id} className="pathology-list-item">
                <Link
                  to={`/pathologies/${p.slug}`}
                  className="pathology-list-link"
                >
                  <div className="pathology-list-info">
                    <span className="pathology-list-title">{p.title}</span>
                    <span className="pathology-list-desc">{p.shortDescription}</span>
                  </div>
                  <div className="pathology-list-meta">
                    {p.isFree ? (
                      <span className="free-badge">GRATUIT</span>
                    ) : (
                      <span className="premium-badge">PREMIUM</span>
                    )}
                    <span className="list-arrow" aria-hidden="true">›</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};
