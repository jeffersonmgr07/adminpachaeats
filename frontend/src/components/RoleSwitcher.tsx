import { ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const roles = [
  { path: '/', label: 'Cliente' },
  { path: '/merchant', label: 'Comercio' },
  { path: '/driver', label: 'Repartidor' },
  { path: '/admin', label: 'Superadmin' }
];

export default function RoleSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const current = roles.find((role) => role.path === location.pathname)?.path ?? '/';

  return (
    <label className="role-switcher">
      <span>Vista demo</span>
      <div className="role-select-wrap">
        <select value={current} onChange={(event) => navigate(event.target.value)} aria-label="Cambiar vista demo">
          {roles.map((role) => <option key={role.path} value={role.path}>{role.label}</option>)}
        </select>
        <ChevronDown size={16} />
      </div>
    </label>
  );
}
