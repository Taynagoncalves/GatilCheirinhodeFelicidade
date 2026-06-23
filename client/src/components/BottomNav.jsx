import { NavLink } from 'react-router-dom';
import { Home, Cat, Pill, PawPrint } from 'lucide-react';

const items = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/gatos', label: 'Gatos', icon: Cat },
  { to: '/saude', label: 'Saúde', icon: Pill },
  { to: '/ninhadas', label: 'Ninhadas', icon: PawPrint },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          <Icon size={22} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
