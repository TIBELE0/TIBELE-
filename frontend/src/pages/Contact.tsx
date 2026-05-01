import React from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const Contact: React.FC = () => {
  const { settings } = useSiteSettings();

  return (
    <main className="simple-page">
      <section className="container quiz-setup">
        <div className="section-shell" style={{ maxWidth: '860px', margin: '1rem auto 0' }}>
          <h1 className="module-main-title">Contact</h1>
          <p className="module-main-subtitle">
            Pour toute question technique, pedagogique ou administrative, vous pouvez nous contacter.
          </p>

          <div className="section-shell" style={{ marginTop: '0.8rem' }}>
            <h2 style={{ marginTop: 0 }}>Support</h2>
            <p>
              Email de contact: <strong>{settings.supportEmail || 'support@tibele.local'}</strong>
            </p>
            <p>
              Delai de reponse indicatif: 24 a 72 heures ouvrables.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '0.8rem' }}>
            <h2 style={{ marginTop: 0 }}>Objet recommande</h2>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.45rem' }}>
              <li>Compte et connexion</li>
              <li>Probleme d acces aux contenus</li>
              <li>Signalement de bug</li>
              <li>Partenariat academique</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};
