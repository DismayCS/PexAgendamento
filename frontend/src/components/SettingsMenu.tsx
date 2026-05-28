import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getDictionary } from '@/i18n';
import Modal from '@/components/Modal';

const SettingsMenu = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const { settings, setPrimaryColor, setLanguage } = useSettings();
  const dictionary = getDictionary(settings.language);
  const dict = dictionary.settings;
  const common = dictionary.common;

  return (
    <div className="settings-menu">
      <button type="button" className="btn settings-menu__trigger" onClick={() => setOpen(true)}>
        {dict.menuLabel}
      </button>
      <Modal
        isOpen={open}
        title={dict.menuLabel}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={() => setOpen(false)}>
              {common?.cancel ?? 'Fechar'}
            </button>
            <button type="button" className="btn btn--danger" onClick={() => void logout()}>
              {dict.logout}
            </button>
          </>
        }
      >
        <div className="settings-menu__panel">
          <div className="form-group">
            <label htmlFor="primary-color">{dict.primaryColor}</label>
            <input
              id="primary-color"
              type="color"
              value={settings.primaryColor}
              onChange={(event) => setPrimaryColor(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="language">{dict.language}</label>
            <select
              id="language"
              value={settings.language}
              onChange={(event) => setLanguage(event.target.value as 'en' | 'pt-BR')}
            >
              <option value="en">{dict.languages.en}</option>
              <option value="pt-BR">{dict.languages['pt-BR']}</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsMenu;
