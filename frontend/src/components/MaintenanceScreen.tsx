import React from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const MaintenanceScreen: React.FC = () => {
  const { settings } = useSiteSettings();

  return (
    <main className="simple-page" style={{ display: 'grid', placeItems: 'center', padding: '1.5rem' }}>
      <section style={{ width: 'min(760px, 100%)', background: '#ffffff', borderRadius: 16, padding: '1.2rem', boxShadow: '0 18px 36px rgba(11, 59, 90, 0.14)' }}>
        <p style={{ display: 'inline-block', fontWeight: 700, color: '#b91c1c', background: '#fee2e2', borderRadius: 999, padding: '0.25rem 0.7rem' }}>
          Maintenance
        </p>
        <h1 style={{ marginTop: '0.8rem', marginBottom: '0.5rem' }}>
          {settings.siteName || 'TIBELE'} est temporairement indisponible
        </h1>
        <p style={{ color: '#334155', marginBottom: '0.9rem' }}>
          {settings.messageMaintenance || 'Nous effectuons actuellement une maintenance. Merci de revenir plus tard.'}
        </p>
        <p style={{ color: '#475569' }}>
          Pour toute urgence, contactez le support: <strong>{settings.supportEmail || 'support@tibele.local'}</strong>
        </p>
      </section>
    </main>
  );
};
