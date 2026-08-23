import { Bike, CircleDollarSign, Clock3, ShoppingBag, Store, Users } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import { activeOrders } from '../data/mock';

export default function AdminDashboard() {
  return (
    <DashboardShell active="Resumen">
      <main className="dashboard-content">
        <div className="dashboard-title-row"><div><span className="section-kicker">OPERACIÓN EN VIVO</span><h1>Buenos días, Jefferson</h1><p>Así está funcionando Pacha Eats hoy.</p></div><button className="primary-button">Exportar reporte</button></div>
        <div className="metric-grid four">
          <div className="metric-card"><span className="metric-icon"><CircleDollarSign/></span><div><small>GMV hoy</small><strong>S/ 4,832</strong><em>+18.4%</em></div></div>
          <div className="metric-card"><span className="metric-icon"><ShoppingBag/></span><div><small>Pedidos</small><strong>126</strong><em>92 completados</em></div></div>
          <div className="metric-card"><span className="metric-icon"><Store/></span><div><small>Comercios activos</small><strong>14</strong><em>2 pausados</em></div></div>
          <div className="metric-card"><span className="metric-icon"><Bike/></span><div><small>Riders conectados</small><strong>18</strong><em>7 disponibles</em></div></div>
        </div>
        <div className="dashboard-grid">
          <section className="dashboard-card">
            <div className="card-heading"><div><h2>Pedidos activos</h2><p>Seguimiento de la operación en tiempo real.</p></div><button>Ver todos</button></div>
            <div className="admin-orders">
              {activeOrders.map((order) => <article key={order.id}><div><strong>{order.id}</strong><small>{order.client}</small></div><div><strong>{order.store}</strong><small>{order.total}</small></div><span className="status-chip preparing">{order.status}</span><div className="time"><Clock3 size={15}/>{order.time}</div></article>)}
            </div>
          </section>
          <section className="dashboard-card overview-card">
            <div className="card-heading"><div><h2>Resumen de red</h2><p>Actividad del piloto.</p></div></div>
            <div className="network-row"><span><Users/></span><div><small>Clientes registrados</small><strong>1,248</strong></div><b>+46 esta semana</b></div>
            <div className="network-row"><span><Store/></span><div><small>Comercios</small><strong>16</strong></div><b>87.5% activos</b></div>
            <div className="network-row"><span><Bike/></span><div><small>Repartidores</small><strong>27</strong></div><b>18 conectados</b></div>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}
