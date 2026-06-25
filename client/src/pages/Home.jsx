import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cat, PawPrint, Plus, CalendarClock, X, Users, Wallet } from 'lucide-react';
import Layout from '../components/Layout';
import EmptyState from '../components/EmptyState';
import { usePush } from '../hooks/usePush';
import { useTour } from '../contexts/TourContext';
import api from '../api/client';

const TOUR = [
  {
    titulo: 'Bem-vinda ao Início! 🐾',
    texto: 'Esta é a tela principal do seu gatil. Aqui você tem um resumo completo de tudo. Toque em "Próximo" para descobrir cada recurso.',
  },
  {
    selector: '[data-tour="home-stats"]',
    titulo: 'Cards de Resumo',
    texto: 'Todos os cards são clicáveis! Toque em qualquer um para ir direto à tela correspondente — gatos, ninhadas, reservados ou vendidos.',
  },
  {
    selector: '[data-tour="home-stat-gatos"]',
    titulo: 'Gatos Cadastrados',
    texto: 'Toque aqui para ir à lista completa de todos os gatos do gatil.',
  },
  {
    selector: '[data-tour="home-stat-ninhadas"]',
    titulo: 'Ninhadas',
    texto: 'Toque aqui para acessar a lista de ninhadas registradas.',
  },
  {
    selector: '[data-tour="home-reservados"]',
    titulo: 'Gatos Reservados',
    texto: 'Toque para listar apenas os gatos com status "Reservado".',
  },
  {
    selector: '[data-tour="home-vendidos"]',
    titulo: 'Gatos Vendidos',
    texto: 'Toque para ver todos os gatos que já foram vendidos.',
  },
  {
    selector: '[data-tour="home-btn-cadastrar"]',
    titulo: 'Cadastrar Gato',
    texto: 'Use este botão para adicionar um novo filhote ao gatil ou acessar a lista de pais reprodutores.',
  },
  {
    selector: '[data-tour="home-proximas-doses"]',
    titulo: 'Próximas Doses',
    texto: 'Aqui aparecem as doses de gatos e pais reprodutores. Cada item mostra se a dose está no prazo, é para hoje, amanhã ou está atrasada. Toque para ir direto ao perfil.',
  },
];

function statusDose(dataStr) {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const diff = Math.round((new Date(dataStr + 'T00:00:00') - hoje) / 86400000);
  if (diff < 0) return { texto: 'Atrasada', cor: '#d9534f', bg: '#fdecea' };
  if (diff === 0) return { texto: 'Hoje', cor: '#e6900a', bg: '#fef3e2' };
  if (diff === 1) return { texto: 'Amanhã', cor: '#2f6690', bg: '#eaf3fb' };
  return { texto: `Em ${diff} dias`, cor: '#3a9e68', bg: '#edf7f1' };
}

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { setSteps } = useTour();
  usePush();

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data));
  }, []);

  useEffect(() => {
    setSteps(TOUR, 'home');
    return () => setSteps([]);
  }, []);

  return (
    <Layout title="Cheirinho de Felicidade" subtitle="Organização e Controle dos Gatos" showNotification>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => navigate('/financeiro')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--color-text-muted)', padding: '4px 0' }}>
          <Wallet size={14} /> Ir para o Financeiro
        </button>
      </div>

      <div className="stats-grid" data-tour="home-stats">
        <div className="stat-card" data-tour="home-stat-gatos" style={{ cursor: 'pointer' }} onClick={() => navigate('/gatos')}>
          <span className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}><Cat size={18} /></span>
          <span className="stat-value" style={{ color: '#1d4ed8' }}>{data?.total_gatos ?? '—'}</span>
          <span className="stat-label" style={{ color: '#1d4ed8' }}>Gatos cadastrados</span>
        </div>
        <div className="stat-card" data-tour="home-stat-ninhadas" style={{ cursor: 'pointer' }} onClick={() => navigate('/ninhadas')}>
          <span className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><PawPrint size={18} /></span>
          <span className="stat-value" style={{ color: '#7c3aed' }}>{data?.total_ninhadas ?? '—'}</span>
          <span className="stat-label" style={{ color: '#7c3aed' }}>Ninhadas</span>
        </div>
        <div className="stat-card" data-tour="home-reservados" style={{ cursor: 'pointer' }} onClick={() => navigate('/gatos?status=reservado')}>
          <span className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Users size={18} /></span>
          <span className="stat-value" style={{ color: '#d97706' }}>{data?.total_reservados ?? '—'}</span>
          <span className="stat-label" style={{ color: '#d97706' }}>Reservados</span>
        </div>
        <div className="stat-card" data-tour="home-vendidos" style={{ cursor: 'pointer' }} onClick={() => navigate('/gatos?status=vendido')}>
          <span className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><PawPrint size={18} /></span>
          <span className="stat-value" style={{ color: '#16a34a' }}>{data?.total_vendidos ?? '—'}</span>
          <span className="stat-label" style={{ color: '#16a34a' }}>Vendidos</span>
        </div>
      </div>

      <div className="quick-actions">
        <button className="btn btn-primary" data-tour="home-btn-cadastrar" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Cadastrar Gato
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/pais')}>
          <Users size={18} /> Ver Pais
        </button>
      </div>

      <section data-tour="home-proximas-doses">
        <h2 className="section-title">Próximas doses</h2>
        {data && data.proximas_doses.length === 0 && (
          <EmptyState icon={CalendarClock} title="Nenhuma dose agendada" description="As próximas doses cadastradas aparecerão aqui." />
        )}
        {data?.proximas_doses.length > 0 && (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.proximas_doses.map((d) => {
              const { texto, cor, bg } = statusDose(d.proxima_dose);
              return (
                <li key={`${d.gato_id ?? 'p'}-${d.id}`} className="list-row" style={{ cursor: 'pointer' }}
                  onClick={() => d.gato_id ? navigate(`/gatos/${d.gato_id}`) : navigate(`/pais/${d.pai_id}`)}>
                  {d.gato_foto ? (
                    <img src={d.gato_foto} alt={d.gato_nome} className="card-photo" style={{ width: 48, height: 48 }} />
                  ) : (
                    <span className="card-photo-placeholder" style={{ width: 48, height: 48 }}><Cat size={20} /></span>
                  )}
                  <div style={{ flex: 1 }}>
                    <p className="card-title" style={{ fontSize: '0.95rem' }}>{d.gato_nome || 'Sem nome'}</p>
                    <p className="card-meta">{d.medicamento_nome} · {d.proxima_dose.split('-').reverse().join('/')}</p>
                  </div>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700, color: cor,
                    background: bg, borderRadius: 20, padding: '4px 10px',
                    whiteSpace: 'nowrap', border: `1px solid ${cor}44`, flexShrink: 0,
                  }}>{texto}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            <p className="modal-title">O que deseja fazer?</p>
            <button className="btn btn-primary" onClick={() => navigate('/gatos/novo')}>
              <PawPrint size={18} /> Cadastrar Filhote
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/pais')}>
              <Users size={18} /> Ver Pais
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
