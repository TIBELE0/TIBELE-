import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminGestion: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="adm-shell">
      <div className="adm-content">
        <header className="adm-topbar">
          <div>
            <h1 className="adm-topbar__title">Gestion du Contenu</h1>
            <p style={{ margin: '0.2rem 0 0', color: '#475569', fontWeight: 600 }}>Administration des pathologies et exercices d'entraînement</p>
          </div>
        </header>

        <section className="adm-panel">
          <div className="adm-gestion-overview">
            <div className="adm-gestion-cards">
              <div className="adm-gestion-card">
                <h3 className="adm-gestion-card__title">Groupes</h3>
                <p className="adm-gestion-card__description">Gérer les groupes de pathologies médicales</p>
                <button
                  type="button"
                  className="adm-btn adm-btn--ok adm-btn--lg"
                  onClick={() => navigate('/admin/groupes')}
                >
                  Accéder aux Groupes
                </button>
              </div>

              <div className="adm-gestion-card">
                <h3 className="adm-gestion-card__title">Pathologies</h3>
                <p className="adm-gestion-card__description">Gérer la liste complète des pathologies</p>
                <button
                  type="button"
                  className="adm-btn adm-btn--ok adm-btn--lg"
                  onClick={() => navigate('/admin/pathologies/list')}
                >
                  Accéder aux Pathologies
                </button>
              </div>

              <div className="adm-gestion-card">
                <h3 className="adm-gestion-card__title">Questions</h3>
                <p className="adm-gestion-card__description">Gérer les exercices d'entraînement</p>
                <button
                  type="button"
                  className="adm-btn adm-btn--ok adm-btn--lg"
                  onClick={() => navigate('/admin/questions/list')}
                >
                  Accéder aux Questions
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};