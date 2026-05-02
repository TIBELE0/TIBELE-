import React from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const Contact: React.FC = () => {
  const { settings } = useSiteSettings();

  return (
    <main className="simple-page">
      <section className="container quiz-setup">
        <div className="section-shell" style={{ maxWidth: '920px', margin: '1.5rem auto' }}>
          <h1 className="module-main-title">Nous contacter</h1>
          <p className="module-main-subtitle">
            Une question, une suggestion ou un partenariat ? Notre équipe répond rapidement aux demandes sérieuses.
          </p>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>Support client</h2>
            <p>
              Email de contact principal : <strong>{settings.supportEmail || 'support@tibele.local'}</strong>
            </p>
            <p>
              Téléphone : <strong>+225 07 07161684</strong> | <strong>+225 05 05430720</strong>
            </p>
            <p>
              Notre équipe traite les messages dans un délai moyen de 24 à 48 heures ouvrables.
            </p>
            <p>
              Pour une réponse plus rapide, précisez votre catégorie : étudiant, professionnel de santé ou partenaire.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>Forme de contact recommandée</h2>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.6rem' }}>
              <li><strong>Compte et accès</strong> : problème de connexion, mot de passe, activation.</li>
              <li><strong>Contenu et pédagogie</strong> : corrections, actualisation des fiches ou suggestions de cas cliniques.</li>
              <li><strong>Bugs et performances</strong> : bugs techniques, lenteurs ou problèmes d’affichage.</li>
              <li><strong>Partenariats</strong> : collaboration académique, institutionnelle ou projets de formation.</li>
            </ul>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>Engagement qualité</h2>
            <p>
              Nous mettons un point d’honneur à assurer une communication claire, professionnelle et respectueuse.
              Chaque message est traité avec confidentialité et une attention particulière.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>Vous souhaitez collaborer ?</h2>
            <p>
              Si vous êtes une institution, une organisation étudiante ou un établissement de santé, indiquez-le dans votre message afin que nous puissions vous orienter vers le bon interlocuteur.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
