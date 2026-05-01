import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pathologyService } from '../services/pathologyService';

const GROUPES_ICONES: Record<string, string> = {
  'Maladies infectieuses': '🦠',
  'Cardiologie': '🫀',
  'Pédiatrie': '👶',
  'Gastroentérologie': '🫄',
  'Neurologie': '🧠',
  'Pneumologie': '🫁',
  'Endocrinologie': '🔬',
  'Rhumatologie': '🦴',
  'Dermatologie': '🩺',
  'Néphrologie': '🫘',
  'Gynécologie-Obstétrique': '🧬',
  'Psychiatrie': '💭',
  'Urgences et réanimation': '🚨',
  'Autres': '📋',
};

const GROUPES_ORDRE = [
  'Maladies infectieuses',
  'Cardiologie',
  'Pédiatrie',
  'Gastroentérologie',
  'Neurologie',
  'Pneumologie',
  'Endocrinologie',
  'Rhumatologie',
  'Dermatologie',
  'Néphrologie',
  'Gynécologie-Obstétrique',
  'Psychiatrie',
  'Urgences et réanimation',
  'Autres',
];

interface GroupeItem {
  nom: string;
  count: number;
}

export const Pathologies: React.FC = () => {
  const [groupes, setGroupes] = useState<GroupeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    pathologyService
      .getGroupes()
      .then((res) => {
        const data: GroupeItem[] = res.data.groupes ?? [];
        // Merge with master list to show empty groups too
        const merged: GroupeItem[] = GROUPES_ORDRE.map((nom) => {
          const found = data.find((g) => g.nom === nom);
          return { nom, count: found?.count ?? 0 };
        });
        // Append any unknown groups returned by API
        data.forEach((g) => {
          if (!GROUPES_ORDRE.includes(g.nom)) {
            merged.push(g);
          }
        });
        setGroupes(merged);
      })
      .catch(() => {
        // API not yet populated — show the full catalogue anyway
        setGroupes(GROUPES_ORDRE.map((nom) => ({ nom, count: 0 })));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = groupes.filter((g) =>
    g.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="simple-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb container" aria-label="Fil d'Ariane">
        <Link to="/">Accueil</Link>
        <span className="breadcrumb-sep" aria-hidden="true">›</span>
        <span aria-current="page">Pathologies</span>
      </nav>

      <section className="container">
        <div className="pathologies-header section-shell">
          <h1 className="module-main-title">Pathologies</h1>
          <p className="pathologies-subtitle module-main-subtitle">
            Choisissez un groupe médical pour accéder aux fiches pédagogiques correspondantes.
          </p>
          <div className="search-wrap">
            <input
              type="search"
              className="search-input"
              placeholder="Rechercher un groupe…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher un groupe médical"
            />
          </div>
          <Link to="/soutenir" className="btn-primary donate-btn-red" style={{ marginTop: '0.8rem', display: 'inline-flex' }}>
            Je fais un don
          </Link>
        </div>

        {loading ? (
          <div className="page-loader">Chargement…</div>
        ) : (
          <div className="groupes-grid">
            {filtered.map((g) => (
              <Link
                key={g.nom}
                to={`/pathologies/groupe/${encodeURIComponent(g.nom)}`}
                className="groupe-card"
              >
                <span className="groupe-icon" aria-hidden="true">
                  {GROUPES_ICONES[g.nom] ?? '📋'}
                </span>
                <span className="groupe-nom">{g.nom}</span>
                {g.count > 0 && (
                  <span className="groupe-count">{g.count} fiche{g.count > 1 ? 's' : ''}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
