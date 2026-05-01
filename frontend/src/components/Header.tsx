import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const Header: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const { settings } = useSiteSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Navigation principale">
        <Link to={user?.role === 'admin' ? '/admin' : '/'} className="site-logo" onClick={closeMenu}>{settings.siteName || 'TIBELE'}</Link>

        <button
          className="menu-toggle"
          aria-expanded={isMenuOpen}
          aria-controls="site-menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span className="sr-only">Ouvrir le menu</span>
          <span className="menu-line" />
          <span className="menu-line" />
          <span className="menu-line" />
        </button>

        <div id="site-menu" className={`menu-shell ${isMenuOpen ? 'open' : ''}`}>
          <ul className="menu-links">
            {user?.role === 'admin' && (
              <li><Link to="/admin" onClick={closeMenu}>Dashboard admin</Link></li>
            )}

            {(!user || user.role === 'user') && (
              <>
                <li><Link to="/" onClick={closeMenu}>Accueil</Link></li>
                <li><Link to="/pathologies" onClick={closeMenu}>Pathologies</Link></li>
                <li><Link to="/forum" onClick={closeMenu}>Forum</Link></li>
                <li><Link to="/entrainement" onClick={closeMenu}>Entraînement</Link></li>
                <li><Link to="/entrainement/historique" onClick={closeMenu}>Historique</Link></li>
                <li><Link to="/soutenir" onClick={closeMenu}>Soutenir</Link></li>
              </>
            )}

            {!isLoading && !user && <li><Link to="/login" onClick={closeMenu}>Connexion</Link></li>}
          </ul>

          <div className="menu-actions">
            {user ? (
              <button className="logout-btn" onClick={handleLogout}>Deconnexion</button>
            ) : (
              <Link to="/register" className="member-btn" onClick={closeMenu}>Inscription</Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
