import React from 'react';

export const About: React.FC = () => {
  return (
    <main className="simple-page">
      <section className="container quiz-setup">
        <div className="section-shell" style={{ maxWidth: '860px', margin: '1rem auto 0' }}>
          <h1 className="module-main-title">A propos</h1>
          <p className="module-main-subtitle">
            TIBELE est une plateforme educative concue pour accompagner les etudiants et professionnels de sante en Cote d Ivoire.
          </p>

          <div className="section-shell" style={{ marginTop: '0.8rem' }}>
            <h2 style={{ marginTop: 0 }}>Notre mission</h2>
            <p>
              Faciliter l acces a des contenus pedagogiques fiables: fiches pathologies, entrainements QCM/QCD et espace communautaire.
            </p>
            <p>
              TIBELE est un support d apprentissage. Les informations diffusees ne remplacent pas un avis medical ni un protocole clinique local.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '0.8rem' }}>
            <h2 style={{ marginTop: 0 }}>Ce que propose TIBELE</h2>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.45rem' }}>
              <li>Des fiches synthetiques sur les pathologies frequentes.</li>
              <li>Des quiz d auto-evaluation pour consolider les acquis.</li>
              <li>Un forum pour l entraide entre etudiants et encadrants.</li>
              <li>Une experience multiplateforme (desktop et mobile).</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};
