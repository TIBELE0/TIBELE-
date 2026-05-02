import React from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const LegalNotice: React.FC = () => {
  const { settings } = useSiteSettings();

  return (
    <main className="simple-page">
      <section className="container quiz-setup">
        <div className="section-shell" style={{ maxWidth: '940px', margin: '1.5rem auto' }}>
          <h1 className="module-main-title">Mentions légales</h1>
          <p className="module-main-subtitle">
            Informations légales sur l’éditeur, l’hébergement et les conditions d’utilisation de la plateforme TIBELE.
          </p>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>Éditeur</h2>
            <p>Nom du service : <strong>{settings.siteName || 'TIBELE'}</strong></p>
            <p>Adresse email : <strong>{settings.supportEmail || 'support@tibele.local'}</strong></p>
            <p>
              TIBELE est une plateforme numérique destinée à l’apprentissage et à la révision des sciences de la santé.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>Hébergement</h2>
            <p>
              La plateforme est hébergée sur une infrastructure cloud sécurisée, choisie pour garantir une disponibilité continue et des performances stables.
            </p>
            <p>
              Le prestataire d’hébergement est responsable de la gestion technique des serveurs, mais l’éditeur reste responsable du contenu diffusé.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>Propriété intellectuelle</h2>
            <p>
              Tous les contenus, marques, logos, illustrations et éléments graphiques présents sur le site sont protégés par le droit de la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation ou diffusion, totale ou partielle, est strictement interdite sans autorisation préalable de l’éditeur.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>Responsabilité</h2>
            <p>
              TIBELE met en œuvre des moyens raisonnables pour assurer la continuité du service, mais n’offre aucune garantie d’exhaustivité ou d’absence d’interruption.
            </p>
            <p>
              Les informations publiées ont un objectif pédagogique et ne remplacent pas un avis médical professionnel.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>Accès et disponibilité</h2>
            <p>
              L’accès au site peut être suspendu temporairement en cas de maintenance, mise à jour ou incident technique.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
