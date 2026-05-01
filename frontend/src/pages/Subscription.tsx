import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const Subscription: React.FC = () => {
  const { settings } = useSiteSettings();
  const donationUrl = settings.donationUrl || 'https://pay.djamo.com/o5y88';

  return (
    <main className="simple-page">
      <section className="container quiz-setup">
        <div className="section-shell" style={{ maxWidth: '760px', margin: '1rem auto 0' }}>
          <h1 className="module-main-title">Soutenir TIBELE</h1>
          <p className="module-main-subtitle">
            TIBELE est gratuit pour tous les étudiants en sciences de la sante. Votre soutien permet de maintenir un outil fiable, utile et durable.
          </p>

          <nav className="breadcrumb" aria-label="Fil d'Ariane">
            <Link to="/">Accueil</Link>
            <span className="breadcrumb-sep" aria-hidden="true">›</span>
            <span aria-current="page">Soutenir</span>
          </nav>

          <div className="section-shell" style={{ marginTop: '0.8rem' }}>
            <h2 style={{ marginTop: 0 }}>Pourquoi votre don compte vraiment</h2>
            <p>
              Chaque semaine, des etudiants utilisent TIBELE pour preparer leurs QCM, revoir des pathologies et avancer de maniere plus structuree.
              Nous avons fait le choix d'une plateforme ouverte a tous: pas de blocage payant sur les contenus essentiels, pas de surprise pendant les revisions.
            </p>
            <p>
              Votre don nous aide a payer l'hebergement, la maintenance technique, la moderation du forum et l'amelioration continue des contenus.
              En soutenant TIBELE, vous contribuez a rendre la preparation plus equitable pour les etudiants en medecine, pharmacie, odontostomatologie, maieutique et autres filieres de sante.
            </p>
            <p>
              Meme un petit montant a un impact concret: garder les serveurs stables pendant les periodes de forte affluence, corriger rapidement les bugs,
              ajouter de nouvelles fonctionnalites et maintenir un espace d'entrainement moderne et pedagogique.
            </p>

            <a href={donationUrl} target="_blank" rel="noreferrer" className="btn-primary donate-btn-red" style={{ marginTop: '0.8rem' }}>
              Je fais un don
            </a>

            <div className="section-shell" style={{ marginTop: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>Ce que votre soutien rend possible</h3>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.45rem' }}>
                <li>Un acces gratuit et continue aux entrainements.</li>
                <li>Des corrections et mises a jour plus rapides.</li>
                <li>Une meilleure qualite de service sur mobile et desktop.</li>
                <li>Un espace communautaire plus sain grace a la moderation.</li>
              </ul>
            </div>

            <p style={{ marginTop: '1rem' }}>
              Merci pour votre confiance. Si TIBELE vous aide aujourd'hui, votre don peut aider des centaines d'autres etudiants demain.
              Ensemble, nous pouvons construire une plateforme de reference pour la reussite academique en sciences de la sante.
            </p>

            <a href={donationUrl} target="_blank" rel="noreferrer" className="btn-primary donate-btn-red" style={{ marginTop: '0.4rem' }}>
              Je fais un don
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};
