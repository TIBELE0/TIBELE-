import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Pathologies } from './pages/Pathologies';
import { PathologyDetail } from './pages/PathologyDetail';
import { PathologieGroupe } from './pages/PathologieGroupe';
import { Forum } from './pages/Forum';
import { Entrainement } from './pages/Entrainement';
import { TrainingHistory } from './pages/TrainingHistory';
import { Subscription } from './pages/Subscription';
import { Profile } from './pages/Profile';
import { QCMPage } from './pages/QCMPage';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Terms } from './pages/Terms';
import { LegalNotice } from './pages/LegalNotice';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext';
import './styles/App.css';

const RoleHomeRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Home />;
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const { settings } = useSiteSettings();
  const [showDonatePopup, setShowDonatePopup] = React.useState(false);
  const isMaintenanceModeForVisitor = settings.maintenanceMode && user?.role !== 'admin';

  const donationPopupIntervalMs = React.useMemo(
    () => Math.max(1, Number(settings.donationPopupIntervalMinutes || 5)) * 60 * 1000,
    [settings.donationPopupIntervalMinutes]
  );

  const maybeShowDonatePopup = React.useCallback(() => {
    if (user?.role === 'admin') {
      return;
    }

    const now = Date.now();
    const lastPopupAt = Number(localStorage.getItem('tibele_last_donate_popup_at') || '0');
    if (now - lastPopupAt < donationPopupIntervalMs) {
      return;
    }

    localStorage.setItem('tibele_last_donate_popup_at', String(now));
    setShowDonatePopup(true);
  }, [donationPopupIntervalMs, user?.role]);

  React.useEffect(() => {
    const views = Number(sessionStorage.getItem('tibele_page_views') || '0') + 1;
    sessionStorage.setItem('tibele_page_views', String(views));
    if (views > 0 && views % 5 === 0) {
      maybeShowDonatePopup();
    }
  }, [location.pathname, maybeShowDonatePopup]);

  React.useEffect(() => {
    if (isLoading || !user || user.role === 'admin') {
      return;
    }

    const timer = setInterval(() => {
      maybeShowDonatePopup();
    }, donationPopupIntervalMs);

    return () => clearInterval(timer);
  }, [isLoading, user, maybeShowDonatePopup, donationPopupIntervalMs]);

  return (
    <>
      <Header />
      {showDonatePopup && user?.role !== 'admin' && !isMaintenanceModeForVisitor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.45)', zIndex: 60, display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div style={{ width: 'min(520px, 100%)', background: '#fff', borderRadius: 14, padding: '1.1rem' }}>
            <h3 style={{ margin: 0 }}>TIBELE est gratuit grâce à vos dons</h3>
            <p style={{ marginTop: '0.6rem' }}>Soutenez-nous si la plateforme vous aide dans votre apprentissage.</p>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.9rem' }}>
              <button
                type="button"
                className="btn-primary donate-btn-red"
                onClick={() => {
                  setShowDonatePopup(false);
                  window.location.href = '/soutenir';
                }}
              >
                Je fais un don
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowDonatePopup(false)}>Plus tard</button>
            </div>
          </div>
        </div>
      )}
      {isMaintenanceModeForVisitor ? (
        <MaintenanceScreen />
      ) : (
      <Routes>
        <Route path="/" element={<ProtectedRoute><RoleHomeRedirect /></ProtectedRoute>} />

        <Route path="/pathologies" element={<ProtectedRoute requiredRole="user"><Pathologies /></ProtectedRoute>} />
        <Route path="/pathologies/groupe/:nom" element={<ProtectedRoute requiredRole="user"><PathologieGroupe /></ProtectedRoute>} />
        <Route path="/pathologies/:slug" element={<ProtectedRoute requiredRole="user"><PathologyDetail /></ProtectedRoute>} />
        <Route path="/forum" element={<ProtectedRoute requiredRole="user"><Forum /></ProtectedRoute>} />
        <Route path="/entrainement" element={<ProtectedRoute requiredRole="user"><Entrainement /></ProtectedRoute>} />
        <Route path="/entrainement/historique" element={<ProtectedRoute requiredRole="user"><TrainingHistory /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute requiredRole="user"><Subscription /></ProtectedRoute>} />
        <Route path="/soutenir" element={<ProtectedRoute requiredRole="user"><Subscription /></ProtectedRoute>} />
        <Route path="/subscription/payment" element={<Navigate to="/soutenir" replace />} />
        <Route path="/profile" element={<ProtectedRoute requiredRole="user"><Profile /></ProtectedRoute>} />
        <Route path="/qcm/:pathologyId" element={<ProtectedRoute requiredRole="user"><QCMPage /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/a-propos" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cgu" element={<Terms />} />
        <Route path="/mentions-legales" element={<LegalNotice />} />
        <Route path="/politique-de-confidentialite" element={<PrivacyPolicy />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      )}
      <Footer />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <SiteSettingsProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </SiteSettingsProvider>
    </AuthProvider>
  </React.StrictMode>,
);
