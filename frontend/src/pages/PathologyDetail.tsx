import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pathologyService } from '../services/pathologyService';

interface Pathology {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  definition: string;
  examinations: string | null;
  referentialDiagnosis: string | null;
  onSiteTreatment: string | null;
  dischargeOrder: string | null;
  prevention: string | null;
  references?: string | null;
  isFree: boolean;
  groupe?: string;
  isLocked?: boolean;
}

const toBulletItems = (content: string): string[] => {
  const rawLines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (rawLines.length === 0) {
    return [];
  }

  const lineBased = rawLines.flatMap((line) => {
    const withoutDash = line.replace(/^-\s*/, '').trim();
    return withoutDash ? [withoutDash] : [];
  });

  if (lineBased.length > 1) {
    return lineBased;
  }

  const semicolonBased = content
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);

  if (semicolonBased.length > 1) {
    return semicolonBased;
  }

  return lineBased;
};

const Section: React.FC<{ title: string; content: string | null; defaultOpen?: boolean }> = ({
  title,
  content,
  defaultOpen = false,
}) => {
  if (!content) return null;

  const items = toBulletItems(content);

  return (
    <section className="detail-section detail-accordion-wrap">
      <details className="detail-accordion" open={defaultOpen}>
        <summary className="detail-section-title">{title}</summary>
        <div className="detail-accordion-content">
          {items.length > 0 ? (
            <ul className="detail-bullet-list">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>{content}</p>
          )}
        </div>
      </details>
    </section>
  );
};

export const PathologyDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pathology, setPathology] = useState<Pathology | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    pathologyService
      .getPathologyBySlug(slug)
      .then((res) => setPathology(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="simple-page">
        <div className="container"><div className="page-loader">Chargement…</div></div>
      </main>
    );
  }

  if (notFound || !pathology) {
    return (
      <main className="simple-page">
        <div className="container section-shell">
          <p>Pathologie introuvable.</p>
          <Link to="/pathologies" className="btn-secondary">Retour aux pathologies</Link>
        </div>
      </main>
    );
  }

  const groupe = pathology.groupe ?? 'Autres';

  return (
    <main className="simple-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb container" aria-label="Fil d'Ariane">
        <Link to="/">Accueil</Link>
        <span className="breadcrumb-sep" aria-hidden="true">›</span>
        <Link to="/pathologies">Pathologies</Link>
        <span className="breadcrumb-sep" aria-hidden="true">›</span>
        <Link to={`/pathologies/groupe/${encodeURIComponent(groupe)}`}>{groupe}</Link>
        <span className="breadcrumb-sep" aria-hidden="true">›</span>
        <span aria-current="page">{pathology.title}</span>
      </nav>

      <article className="container detail-article">
        <header className="detail-header section-shell">
          <div className="detail-header-top">
            <span className="detail-groupe-tag">{groupe}</span>
            {pathology.isFree ? (
              <span className="free-badge">GRATUIT</span>
            ) : (
              <span className="premium-badge">PREMIUM</span>
            )}
          </div>
          <h1 className="detail-title module-main-title">Pathologies</h1>
          <p className="detail-short module-main-subtitle">{pathology.shortDescription.toLowerCase()}</p>
        </header>

        <div className="detail-body">
          <Section title="Définition" content={pathology.definition} defaultOpen />
          <>
            <Section title="Examens complémentaires" content={pathology.examinations} />
            <Section title="Traitement sur place" content={pathology.onSiteTreatment} />
            <Section title="Ordonnance de sortie" content={pathology.dischargeOrder} />
            <Section title="Prévention" content={pathology.prevention} />
          </>
        </div>
      </article>
    </main>
  );
};
