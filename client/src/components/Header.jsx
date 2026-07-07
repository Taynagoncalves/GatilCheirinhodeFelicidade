import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, ChevronLeft, Bell, Trash2, BellRing, X } from 'lucide-react';
import api from '../api/client';
import { useTour } from '../contexts/TourContext';

const STORAGE_LIDAS = 'notificacoes_lidas';

export default function Header({ title, subtitle, showBack, showNotification }) {
  const navigate = useNavigate();
  const { steps, iniciar } = useTour();
  const temTour = steps.length > 0;
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [lidas, setLidas] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_LIDAS) || '[]'); } catch { return []; }
  });
  const [testando, setTestando] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    api.get('/notificacoes').then((res) => setNotifs(res.data));
  }, [open]);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const temNaoLidas = notifs.some((n) => !lidas.includes(n.id));

  function marcarLida(id) {
    const novas = [...new Set([...lidas, id])];
    setLidas(novas);
    localStorage.setItem(STORAGE_LIDAS, JSON.stringify(novas));
  }

  async function limpar() {
    await api.delete('/notificacoes');
    setNotifs([]);
    setLidas([]);
    localStorage.setItem(STORAGE_LIDAS, '[]');
  }

  async function testar() {
    setTestando(true);
    try {
      await api.post('/push/test');
      const res = await api.get('/notificacoes');
      setNotifs(res.data);
    } catch {}
    setTestando(false);
  }

  function formatarData(criado_em) {
    const d = new Date(criado_em);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <header className="top-header">
      <div
        className="top-header-left"
        onClick={!showBack ? () => window.dispatchEvent(new CustomEvent('mostrarMenu')) : undefined}
        style={!showBack ? { cursor: 'pointer' } : undefined}
      >
        {showBack ? (
          <button className="top-header-back" onClick={(e) => { e.stopPropagation(); navigate(-1); }} aria-label="Voltar">
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {temTour && (
          <button className="tour-help-btn" onClick={iniciar} aria-label="Tutorial desta tela" title="Tutorial">
            ?
          </button>
        )}

      {showNotification && (
        <div style={{ position: 'relative' }} ref={panelRef}>
          <button className="notification-button" aria-label="Notificações" onClick={() => setOpen((v) => !v)}>
            <Bell size={20} />
            {temNaoLidas && <span className="notification-dot" />}
          </button>

          {open && (
            <div className="notif-panel">
              <div className="notif-panel-header">
                <span className="notif-panel-title">Notificações</span>
                <button className="notif-close" onClick={() => setOpen(false)}><X size={16} /></button>
              </div>

              <div className="notif-list">
                {notifs.length === 0 ? (
                  <div className="notif-empty">
                    <BellRing size={32} style={{ opacity: 0.3 }} />
                    <p>Nenhuma notificação</p>
                  </div>
                ) : (
                  notifs.map((n) => {
                    const lida = lidas.includes(n.id);
                    return (
                      <div
                        key={n.id}
                        className={`notif-item${lida ? '' : ' notif-item-nova'}`}
                        style={{ cursor: 'default' }}
                        onClick={() => marcarLida(n.id)}
                      >
                        <div className={`notif-dot-blue${lida ? ' notif-dot-lida' : ''}`} />
                        <div style={{ flex: 1 }}>
                          <p className="notif-item-title">{n.titulo}</p>
                          <p className="notif-item-sub">{n.corpo}</p>
                          <p className="notif-item-sub" style={{ marginTop: 2, opacity: 0.6 }}>{formatarData(n.criado_em)}</p>
                        </div>
                        {!lida && <span className="notif-badge-nova">Nova</span>}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="notif-panel-footer">
                <button className="notif-btn" onClick={limpar} disabled={notifs.length === 0}>
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
      </div>
    </header>
  );
}
