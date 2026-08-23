import { CheckCircle2, Clock3, DollarSign, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';

const orders = [
  ['#PE-1054', 'Ana Torres', '2 productos', 'S/ 38.50', 'Nuevo'],
  ['#PE-1053', 'Carlos Ruiz', '4 productos', 'S/ 64.90', 'Preparando'],
  ['#PE-1052', 'Milagros León', '1 producto', 'S/ 24.00', 'Listo']
];

export default function MerchantDashboard() {
  return (
    <DashboardShell active="Pedidos">
      <main className="dashboard-content">
        <div className="dashboard-title-row"><div><span className="section-kicker">Pacha Burger</span><h1>Panel del comercio</h1><p>Gestiona pedidos, tiempos y ventas desde un solo lugar.</p></div><button className="status-open"><CheckCircle2 size={18}/>Local abierto</button></div>
        <div className="metric-grid four">
          <div className="metric-card"><span className="metric-icon"><DollarSign/></span><div><small>Ventas de hoy</small><strong>S/ 1,284.90</strong><em><TrendingUp size={14}/> +12.8%</em></div></div>
          <div className="metric-card"><span className="metric-icon"><ShoppingBag/></span><div><small>Pedidos</small><strong>32</strong><em>+4 vs. ayer</em></div></div>
          <div className="metric-card"><span className="metric-icon"><Clock3/></span><div><small>Tiempo promedio</small><strong>18 min</strong><em>Objetivo: 20 min</em></div></div>
          <div className="metric-card"><span className="metric-icon"><Package/></span><div><small>Ticket promedio</small><strong>S/ 40.15</strong><em>Comisión 10%</em></div></div>
        </div>
        <section className="dashboard-card">
          <div className="card-heading"><div><h2>Pedidos en curso</h2><p>Actualiza el estado de preparación en tiempo real.</p></div><button className="primary-button">+ Nuevo producto</button></div>
          <div className="order-board">
            {orders.map(([id, client, items, total, status]) => <article className="merchant-order" key={id}><div className="order-id"><span>{id}</span><small>Hace 3 min</small></div><div><strong>{client}</strong><small>{items}</small></div><strong>{total}</strong><span className={`status-chip ${status.toLowerCase()}`}>{status}</span><button>Ver pedido</button></article>)}
          </div>
        </section>
      </main>
    </DashboardShell>
  );
}
