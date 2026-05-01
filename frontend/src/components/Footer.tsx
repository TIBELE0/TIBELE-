import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const Footer: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>{settings.siteName || 'TIBELE'}</h3>
          <p>Plateforme educative pour les etudiants et professionnels de sante en Cote d Ivoire.</p>
          <p style={{ marginTop: '0.45rem' }}>Support: {settings.supportEmail || 'support@tibele.local'}</p>
        </div>

        <div>
          <h4>Liens rapides</h4>
          <ul>
            <li><Link to="/a-propos">A propos</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/cgu">CGU</Link></li>
            <li><Link to="/mentions-legales">Mentions legales</Link></li>
            <li><Link to="/politique-de-confidentialite">Politique de confidentialite</Link></li>
            {user?.role === 'admin' && <li><Link to="/admin">Espace admin</Link></li>}
          </ul>
        </div>

        <div>
          <h4>Reseaux</h4>
          <div className="socials" aria-label="Reseaux sociaux">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="Instagram">ig</a>
            <a href="#" aria-label="YouTube">yt</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        {settings.siteName || 'TIBELE'} {year} - Tous droits reserves.
      </div>
    </footer>
  );
};
