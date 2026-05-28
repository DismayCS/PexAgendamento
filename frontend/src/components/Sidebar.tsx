import { NavLink } from 'react-router-dom';
import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import SettingsMenu from '@/components/SettingsMenu';
import { getDictionary } from '@/i18n';

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { settings } = useSettings();
  const dict = getDictionary(settings.language);

  const links = [
    { to: '/', label: dict.navigation?.appointments ?? 'Appointments' },
    { to: '/clientes', label: dict.navigation?.clients ?? 'Clients' },
    { to: '/servicos', label: dict.navigation?.services ?? 'Services' },
    { to: '/produtos', label: dict.navigation?.products ?? 'Products' },
    { to: '/estoque', label: dict.navigation?.stock ?? 'Stock' },
    { to: '/movimentacoes', label: dict.navigation?.movements ?? 'Movements' }
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <div className="mobile-topbar">
        <button
          type="button"
          className="sidebar__hamburger"
          aria-label="Abrir menu"
          onClick={() => setMobileOpen(true)}
        >
          ☰
        </button>
        <span className="mobile-topbar__brand">Sistema de Agendamentos</span>
      </div>

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand-row">
          <div className="sidebar__brand">Sistema de Agendamentos</div>
          <button className="sidebar__close" type="button" aria-label="Fechar menu" onClick={closeMobile}>
            ×
          </button>
        </div>

        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
              end={link.to === '/'}
              onClick={closeMobile}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {user && <SettingsMenu />}
      </aside>

      {mobileOpen && <button className="sidebar__backdrop" aria-label="Fechar menu" onClick={closeMobile} />}
    </>
  );
};

export default Sidebar;
