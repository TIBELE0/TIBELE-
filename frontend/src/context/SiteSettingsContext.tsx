import React from 'react';
import { GlobalSiteSettings, siteSettingsService } from '../services/pathologyService';

const DEFAULT_SETTINGS: GlobalSiteSettings = {
  siteName: 'TIBELE',
  supportEmail: 'support@tibele.local',
  primaryColor: '#0b3b5a',
  secondaryColor: '#2e8b57',
  donationUrl: 'https://pay.djamo.com/o5y88',
  donationPopupIntervalMinutes: 5,
  maintenanceMode: false,
  messageMaintenance: 'Maintenance en cours. Merci de revenir plus tard.',
  registrationsOpen: true,
};

interface SiteSettingsContextType {
  settings: GlobalSiteSettings;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = React.createContext<SiteSettingsContextType | undefined>(undefined);

const applyThemeFromSettings = (settings: GlobalSiteSettings) => {
  document.documentElement.style.setProperty('--blue-900', settings.primaryColor);
  document.documentElement.style.setProperty('--green-700', settings.secondaryColor);
  document.documentElement.style.setProperty('--green-600', settings.secondaryColor);
  document.title = settings.siteName || 'TIBELE';
};

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = React.useState<GlobalSiteSettings>(DEFAULT_SETTINGS);

  const refreshSettings = React.useCallback(async () => {
    try {
      const response = await siteSettingsService.getPublicSettings();
      const nextSettings = {
        ...DEFAULT_SETTINGS,
        ...(response.data || {}),
      } as GlobalSiteSettings;
      setSettings(nextSettings);
      applyThemeFromSettings(nextSettings);
    } catch {
      setSettings(DEFAULT_SETTINGS);
      applyThemeFromSettings(DEFAULT_SETTINGS);
    }
  }, []);

  React.useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  const value = React.useMemo(() => ({ settings, refreshSettings }), [settings, refreshSettings]);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
};

export const useSiteSettings = (): SiteSettingsContextType => {
  const context = React.useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }
  return context;
};
