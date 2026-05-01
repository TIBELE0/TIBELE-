import React from 'react';

export const Terms: React.FC = () => {
  return (
    <main className="simple-page">
      <section className="container quiz-setup">
        <div className="section-shell" style={{ maxWidth: '900px', margin: '1rem auto 0' }}>
          <h1 className="module-main-title">CGU</h1>
          <p className="module-main-subtitle">
            Conditions Generales d Utilisation de la plateforme TIBELE.
          </p>

          <div className="section-shell" style={{ marginTop: '0.8rem' }}>
            <h2 style={{ marginTop: 0 }}>1. Objet</h2>
            <p>
              Les presentes CGU encadrent l acces et l utilisation des services proposes par TIBELE.
            </p>

            <h2>2. Compte utilisateur</h2>
            <p>
              L utilisateur est responsable de la confidentialite de ses identifiants et des actions effectuees depuis son compte.
            </p>

            <h2>3. Usage autorise</h2>
            <p>
              L utilisateur s engage a ne pas publier de contenu illicite, diffamatoire, haineux ou trompeur, notamment sur le forum.
            </p>

            <h2>4. Limitation</h2>
            <p>
              Les contenus ont une vocation educative. Ils ne remplacent pas une consultation medicale ni une prise en charge clinique.
            </p>

            <h2>5. Suspension</h2>
            <p>
              TIBELE peut suspendre ou fermer un compte en cas de non-respect des CGU, de tentative d abus ou de comportement nuisible.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
