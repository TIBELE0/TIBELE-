import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <main className="simple-page">
      <section className="container quiz-setup">
        <div className="section-shell" style={{ maxWidth: '940px', margin: '1.5rem auto' }}>
          <h1 className="module-main-title">Politique de confidentialité</h1>
          <p className="module-main-subtitle">
            Cette politique décrit les données collectées, leur utilisation et les droits des utilisateurs sur la plateforme.
          </p>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>1. Données collectées</h2>
            <p>
              Nous collectons les données nécessaires à la création de compte, à l’accès aux contenus et à l’amélioration des services.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.45rem' }}>
              <li>Adresse email et informations de connexion.</li>
              <li>Profil académique et parcours d’apprentissage.</li>
              <li>Historique des quiz, scores et activités sur la plateforme.</li>
              <li>Données techniques liées à l’utilisation du site.</li>
            </ul>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>2. Finalités du traitement</h2>
            <p>
              Les données sont utilisées pour : 
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.45rem' }}>
              <li>Permettre l’authentification et la gestion du compte.</li>
              <li>Offrir une expérience personnalisée et des recommandations adaptées.</li>
              <li>Assurer le bon fonctionnement du service et la sécurité du site.</li>
              <li>Améliorer les contenus pédagogiques et les fonctionnalités.</li>
            </ul>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>3. Conservation des données</h2>
            <p>
              Les données sont conservées pendant la durée nécessaire à la fourniture du service et au respect des obligations légales.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>4. Partage des données</h2>
            <p>
              Aucune donnée personnelle n’est vendue. Les données peuvent être partagées uniquement avec des prestataires techniques ou pour répondre à des obligations légales.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>5. Sécurité</h2>
            <p>
              Des mesures techniques et organisationnelles sont mises en place pour protéger les données contre tout accès non autorisé, altération ou perte.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>6. Droits des utilisateurs</h2>
            <p>
              Vous pouvez exercer vos droits d’accès, de rectification, de suppression ou d’opposition en contactant le support.
            </p>
            <p>
              Pour toute demande, envoyez-nous un message depuis la page Contact ou à l’adresse indiquée sur la plateforme.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
