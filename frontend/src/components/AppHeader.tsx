import { Bell, MapPin } from 'lucide-react';
import Brand from './Brand';
import RoleSwitcher from './RoleSwitcher';

export default function AppHeader({ dashboard = false }: { dashboard?: boolean }) {
  return (
    <header className={dashboard ? 'topbar dashboard-topbar' : 'topbar'}>
      <div className="container topbar-inner">
        <Brand />
        {!dashboard && (
          <button className="location-pill" type="button">
            <MapPin size={17} />
            <span><small>Entregar en</small><strong>Pachacámac, Lima</strong></span>
          </button>
        )}
        <div className="topbar-actions">
          <RoleSwitcher />
          <button className="icon-button" type="button" aria-label="Notificaciones"><Bell size={20} /></button>
          <div className="avatar">JG</div>
        </div>
      </div>
    </header>
  );
}
