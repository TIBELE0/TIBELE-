import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <main className="simple-page">
      <section className="container quiz-setup">
        <div className="section-shell" style={{ maxWidth: '920px', margin: '1rem auto 0' }}>
          <h1 className="module-main-title">Politique de confidentialite</h1>
          <p className="module-main-subtitle">
            Cette politique explique quelles donnees sont collecte es, pourquoi et comment elles sont protegees.
          </p>

          <div className="section-shell" style={{ marginTop: '0.8rem' }}>
            <h2 style={{ marginTop: 0 }}>1. Donnees traitees</h2>
            <p>
              Les donnees de compte (email, profil academique, historique d entrainement) sont traitees pour fournir les fonctionnalites de la plateforme.
            </p>

            <h2>2. Finalites</h2>
            <p>
              Les traitements permettent l authentification, la personnalisation de l experience, la moderation et l amelioration continue du service.
            </p>

            <h2>3. Conservation</h2>
            <p>
              Les donnees sont conservees pendant la duree necessaire a la fourniture du service et au respect des obligations legales applicables.
            </p>

            <h2>4. Securite</h2>
            <p>
              Des mesures techniques et organisationnelles sont mises en oeuvre pour proteger la confidentialite et l integrite des donnees.
            </p>

            <h2>5. Droits</h2>
            <p>
              L utilisateur peut demander l acces, la rectification ou la suppression de ses donnees en contactant le support.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
