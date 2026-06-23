import { useNavigate } from 'react-router-dom';
import { PawPrint, ChevronLeft, Bell } from 'lucide-react';

export default function Header({ title, subtitle, showBack, showNotification }) {
  const navigate = useNavigate();

  return (
    <header className="top-header">
      <div className="top-header-left">
        {showBack ? (
          <button className="top-header-back" onClick={() => navigate(-1)} aria-label="Voltar">
            <ChevronLeft size={22} />
          </button>
        ) : (
          <span className="top-header-icon">
            <PawPrint size={20} />
          </span>
        )}
        <div className="top-header-titles">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      {showNotification && (
        <button className="notification-button" aria-label="Notificações">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>
      )}
    </header>
  );
}
