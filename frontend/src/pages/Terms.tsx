import React from 'react';

export const Terms: React.FC = () => {
  return (
    <main className="simple-page">
      <section className="container quiz-setup">
        <div className="section-shell" style={{ maxWidth: '940px', margin: '1.5rem auto' }}>
          <h1 className="module-main-title">Conditions Générales d'Utilisation</h1>
          <p className="module-main-subtitle">
            Cadre juridique et règles d’utilisation de la plateforme TIBELE.
          </p>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>1. Objet</h2>
            <p>
              Ces conditions définissent l’accès et l’utilisation des services de TIBELE, destinés à l’apprentissage des sciences de la santé.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>2. Accès et compte utilisateur</h2>
            <p>
              Chaque utilisateur est responsable de la confidentialité de ses identifiants. Toute action réalisée depuis un compte est réputée engagée par son titulaire.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>3. Utilisation autorisée</h2>
            <p>
              L’utilisateur s’engage à utiliser le service dans un cadre légal, respectueux et pédagogique. Les contenus partagés sur le forum doivent être factuels et bienveillants.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>4. Propriété intellectuelle</h2>
            <p>
              Les contenus de TIBELE, notamment textes, logos et documents pédagogiques, sont protégés. Toute reproduction sans autorisation est interdite.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>5. Limitation de responsabilité</h2>
            <p>
              Les informations fournies sont à usage pédagogique uniquement. Elles ne se substituent pas à une consultation médicale professionnelle.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>6. Modération et suspension</h2>
            <p>
              TIBELE se réserve le droit de suspendre ou supprimer tout compte ou contenu qui enfreint ces conditions, sans préavis.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>7. Modification des CGU</h2>
            <p>
              Ces conditions peuvent être mises à jour. Les modifications sont publiées sur le site et s’appliquent dès leur mise en ligne.
            </p>
          </div>

          <div className="section-shell" style={{ marginTop: '1rem' }}>
            <h2>8. Loi applicable</h2>
            <p>
              Les présentes conditions sont régies par la législation ivoirienne applicable.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
