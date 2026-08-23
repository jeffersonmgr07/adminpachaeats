import type { ReactNode } from 'react';
import { BarChart3, Bike, Building2, LayoutDashboard, LogOut, Package, Settings, Users } from 'lucide-react';
import Brand from './Brand';
import AppHeader from './AppHeader';

export default function DashboardShell({ children, active = 'Resumen' }: { children: ReactNode; active?: string }) {
  const nav = [
    ['Resumen', LayoutDashboard],
    ['Pedidos', Package],
    ['Comercios', Building2],
    ['Repartidores', Bike],
    ['Usuarios', Users],
    ['Reportes', BarChart3],
    ['Configuración', Settings]
  ] as const;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Brand />
        <div className="sidebar-section-label">PANEL</div>
        <nav>
          {nav.map(([label, Icon]) => <button key={label} className={label === active ? 'active' : ''}><Icon size={19} />{label}</button>)}
        </nav>
        <button className="sidebar-logout"><LogOut size={19} />Cerrar sesión</button>
      </aside>
      <div className="dashboard-main">
        <AppHeader dashboard />
        {children}
      </div>
    </div>
  );
}
