import React from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const LegalNotice: React.FC = () => {
  const { settings } = useSiteSettings();

  return (
    <main className="simple-page">
      <section className="container quiz-setup">
        <div className="section-shell" style={{ maxWidth: '900px', margin: '1rem auto 0' }}>
          <h1 className="module-main-title">Mentions legales</h1>
          <p className="module-main-subtitle">
            Informations legales relatives a l editeur de la plateforme et aux services proposes.
          </p>

          <div className="section-shell" style={{ marginTop: '0.8rem' }}>
            <h2 style={{ marginTop: 0 }}>Editeur</h2>
            <p>Nom du service: {settings.siteName || 'TIBELE'}</p>
            <p>Contact: {settings.supportEmail || 'support@tibele.local'}</p>

            <h2>Hebergement</h2>
            <p>
              L hebergement est assure par une infrastructure cloud choisie par l equipe exploitante.
            </p>

            <h2>Propriete intellectuelle</h2>
            <p>
              Les contenus, marques, logos et elements graphiques de la plateforme sont proteges par les regles applicables.
            </p>

            <h2>Responsabilite</h2>
            <p>
              L editeur met en oeuvre des moyens raisonnables pour assurer la disponibilite du service, sans garantie d absence totale d interruption.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
