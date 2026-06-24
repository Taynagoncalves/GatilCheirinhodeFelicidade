import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, ChevronLeft, Bell, Trash2, BellRing, X } from 'lucide-react';
import api from '../api/client';

const STORAGE_KEY = 'notificacoes_limpas';

export default function Header({ title, subtitle, showBack, showNotification }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [doses, setDoses] = useState([]);
  const [cleared, setCleared] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [testando, setTestando] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    api.get('/dashboard').then((res) => setDoses(res.data.proximas_doses || []));
  }, [open]);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const visiveis = doses.filter((d) => !cleared.includes(d.id));
  const temNovos = visiveis.length > 0;

  function limpar() {
    const ids = doses.map((d) => d.id);
    const novoCleared = [...new Set([...cleared, ...ids])];
    setCleared(novoCleared);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novoCleared));
  }

  async function testar() {
    setTestando(true);
    try { await api.post('/push/test'); } catch {}
    setTestando(false);
  }

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
        <div style={{ position: 'relative' }} ref={panelRef}>
          <button
            className="notification-button"
            aria-label="Notificações"
            onClick={() => setOpen((v) => !v)}
          >
            <Bell size={20} />
            {temNovos && <span className="notification-dot" />}
          </button>

          {open && (
            <div className="notif-panel">
              <div className="notif-panel-header">
                <span className="notif-panel-title">Notificações</span>
                <button className="notif-close" onClick={() => setOpen(false)}><X size={16} /></button>
              </div>

              <div className="notif-list">
                {visiveis.length === 0 ? (
                  <div className="notif-empty">
                    <BellRing size={32} style={{ opacity: 0.3 }} />
                    <p>Nenhuma notificação</p>
                  </div>
                ) : (
                  visiveis.map((d) => (
                    <div key={d.id} className="notif-item">
                      <div className="notif-dot-blue" />
                      <div>
                        <p className="notif-item-title">{d.gato_nome}</p>
                        <p className="notif-item-sub">{d.medicamento_nome} · próxima: {d.proxima_dose.split('-').reverse().join('/')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="notif-panel-footer">
                <button className="notif-btn" onClick={limpar} disabled={visiveis.length === 0}>
                  <Trash2 size={14} /> Limpar
                </button>
                <button className="notif-btn notif-btn-primary" onClick={testar} disabled={testando}>
                  <Bell size={14} /> {testando ? 'Enviando...' : 'Testar'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
