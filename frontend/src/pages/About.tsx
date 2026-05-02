import React from 'react';

export const About: React.FC = () => {
  return (
    <main className="simple-page">
      <section className="container quiz-setup">
        <div className="section-shell" style={{ maxWidth: '900px', margin: '1.5rem auto' }}>
          <h1 className="module-main-title">A propos de TIBELE</h1>
          <p className="module-main-subtitle">
            TIBELE est la plateforme pédagogique dédiée aux étudiants et professionnels de la santé en Côte d'Ivoire.
          </p>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>Notre vision</h2>
            <p>
              Offrir un espace moderne, fiable et accessible pour apprendre, réviser et se préparer aux examens médicaux.
              TIBELE valorise l'excellence académique en proposant des ressources conçues pour les besoins réels des soignants.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>Notre mission</h2>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.6rem' }}>
              <li>Rendre l'accès aux connaissances médicales clair, structuré et actualisé.</li>
              <li>Accompagner la réussite des étudiants en médecine, pharmacie, maïeutique et autres filières santé.</li>
              <li>Permettre une révision efficace avec des outils adaptés à chaque étape de l'apprentissage.</li>
              <li>Encourager la collaboration et l'entraide grâce à un forum sécurisé et modéré.</li>
            </ul>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>Ce que nous proposons</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <h3 style={{ marginBottom: '0.35rem' }}>Contenus validés</h3>
                <p>
                  Des fiches pathologies structurées, claires et orientées pratique, conçues pour compléter les enseignements académiques.
                </p>
              </div>
              <div>
                <h3 style={{ marginBottom: '0.35rem' }}>Entraînement interactif</h3>
                <p>
                  Des quiz QCM/QCD pour tester vos acquis, suivre votre progression et identifier rapidement les points à renforcer.
                </p>
              </div>
              <div>
                <h3 style={{ marginBottom: '0.35rem' }}>Communauté engagée</h3>
                <p>
                  Un espace d'échange pour poser des questions, partager des conseils cliniques et soutenir les autres apprenants.
                </p>
              </div>
              <div>
                <h3 style={{ marginBottom: '0.35rem' }}>Expérience accessible</h3>
                <p>
                  Une interface optimisée pour ordinateur et mobile, pensée pour accompagner les révisions où que vous soyez.
                </p>
              </div>
            </div>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>Nos engagements</h2>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.6rem' }}>
              <li>Maintenir un service accessible et gratuit sur les éléments essentiels.</li>
              <li>Respecter l’intégrité des contenus et veiller à leur mise à jour régulière.</li>
              <li>Assurer la protection des données personnelles de tous les utilisateurs.</li>
              <li>Favoriser une communauté respectueuse, constructive et bienveillante.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};
