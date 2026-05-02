import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const Subscription: React.FC = () => {
  const { settings } = useSiteSettings();
  const donationUrl = settings.donationUrl || 'https://pay.djamo.com/o5y88';

  return (
    <main className="simple-page">
      <section className="container quiz-setup">
        <div className="section-shell" style={{ maxWidth: '920px', margin: '1.5rem auto' }}>
          <h1 className="module-main-title">Soutenir TIBELE</h1>
          <p className="module-main-subtitle">
            TIBELE reste gratuit pour les étudiants en santé. Votre soutien est essentiel pour maintenir la qualité, la continuité et l’innovation du service.
          </p>

          <nav className="breadcrumb" aria-label="Fil d'Ariane">
            <Link to="/">Accueil</Link>
            <span className="breadcrumb-sep" aria-hidden="true">›</span>
            <span aria-current="page">Soutenir</span>
          </nav>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>Pourquoi donner à TIBELE ?</h2>
            <p>
              TIBELE a été conçu pour offrir une plateforme pédagogique adaptée aux étudiants et professionnels de la santé.
              Grâce à votre soutien, nous pouvons financer l’hébergement, les mises à jour de contenu et la stabilité du service.
            </p>
            <p>
              Votre don contribue directement à ce que les ressources restent accessibles, fiables et modernisées pour tous.
              Il aide aussi à préserver un environnement sécurisé et modéré pour les échanges entre pairs.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>Votre contribution en pratique</h2>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.6rem' }}>
              <li>Maintenir les serveurs performants pendant les pics de trafic.</li>
              <li>Assurer la maintenance technique et la sécurité du site.</li>
              <li>Aider à enrichir les contenus pédagogiques et les quiz.</li>
              <li>Renforcer la modération pour un forum de qualité.</li>
            </ul>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>Notre promesse</h2>
            <p>
              Même un petit montant fait la différence. Il permet de garder TIBELE accessible, de réduire les interruptions et d’améliorer l’expérience pour tous.
            </p>
            <p>
              Nous nous engageons à utiliser votre soutien pour développer une plateforme durable, utile et respectueuse des besoins des étudiants en santé.
            </p>
          </div>

          <a href={donationUrl} target="_blank" rel="noreferrer" className="btn-primary donate-btn-red" style={{ marginTop: '1rem' }}>
            Je fais un don
          </a>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>Impact de votre soutien</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.6rem' }}>
              <li>Conserver des contenus gratuits pour les étudiants.</li>
              <li>Accélérer la correction et l’ajout de nouvelles ressources.</li>
              <li>Améliorer le service mobile et la disponibilité globale.</li>
              <li>Permettre des actions pédagogiques et communautaires durables.</li>
            </ul>
          </div>

          <a href={donationUrl} target="_blank" rel="noreferrer" className="btn-primary donate-btn-red" style={{ marginTop: '0.8rem' }}>
            Soutenir maintenant
          </a>
        </div>
      </section>
    </main>
  );
};
