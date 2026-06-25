import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cat, PawPrint, Plus, CalendarClock, X, Users, Wallet, Syringe, TrendingUp, TrendingDown, CalendarDays } from 'lucide-react';
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
    selector: '[data-tour="home-saudacao"]',
    titulo: 'Saudação do Dia',
    texto: 'Aqui aparece uma saudação personalizada com a data de hoje — para começar o dia com carinho! 🐱',
  },
  {
    selector: '[data-tour="home-stats"]',
    titulo: 'Cards de Resumo',
    texto: 'Todos os cards são clicáveis! Toque em qualquer um para ir direto à tela correspondente — gatos, ninhadas, reservados ou vendidos.',
  },
  {
    selector: '[data-tour="home-acoes"]',
    titulo: 'Ações Rápidas',
    texto: 'Cadastre um novo filhote ou acesse os pais reprodutores com um toque.',
  },
  {
    selector: '[data-tour="home-saldo"]',
    titulo: 'Resumo Financeiro',
    texto: 'Veja o saldo do mês atual rapidamente sem precisar abrir o Financeiro.',
  },
  {
    selector: '[data-tour="home-proximas-doses"]',
    titulo: 'Próximas Doses',
    texto: 'Aqui aparecem as doses de gatos e pais reprodutores. Cada item mostra se a dose está no prazo, é para hoje, amanhã ou está atrasada. Toque para ir direto ao perfil.',
  },
];

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return { texto: 'Bom dia', emoji: '☀️' };
  if (h < 18) return { texto: 'Boa tarde', emoji: '🌤️' };
  return { texto: 'Boa noite', emoji: '🌙' };
}

function dataHoje() {
  const d = new Date();
  const dias = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]}`;
}

function statusDose(dataStr) {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const diff = Math.round((new Date(dataStr + 'T00:00:00') - hoje) / 86400000);
  if (diff < 0) return { texto: 'Atrasada', cor: '#d9534f', bg: '#fdecea' };
  if (diff === 0) return { texto: 'Hoje', cor: '#e6900a', bg: '#fef3e2' };
  if (diff === 1) return { texto: 'Amanhã', cor: '#2f6690', bg: '#eaf3fb' };
  return { texto: `Em ${diff} dias`, cor: '#3a9e68', bg: '#edf7f1' };
}

function fmt(v) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

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

  const { texto: saud, emoji } = saudacao();

  return (
    <Layout title="Cheirinho de Felicidade" subtitle="Organização e Controle dos Gatos" showNotification>

      {/* ── Saudação ── */}
      <div data-tour="home-saudacao" style={{
        background: 'linear-gradient(135deg, #1a4d7c, #2f6690)',
        borderRadius: 16, padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
            {saud}, Lidia! {emoji}
          </p>
          <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)' }}>
            {dataHoje()}
          </p>
        </div>
        <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Cat size={22} color="#fff" />
        </div>
      </div>

      {/* ── Stats ── */}
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

      {/* ── Ações rápidas (cards visuais) ── */}
      <div data-tour="home-acoes" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div onClick={() => setShowModal(true)} data-tour="home-btn-cadastrar" style={{
          background: 'linear-gradient(135deg, #1a4d7c, #2f6690)',
          borderRadius: 14, padding: '16px 12px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 14px rgba(26,77,124,0.25)',
        }}>
          <div style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.18)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={22} color="#fff" />
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem', textAlign: 'center' }}>Cadastrar Gato</span>
        </div>

        <div onClick={() => navigate('/pais')} style={{
          background: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
          borderRadius: 14, padding: '16px 12px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 14px rgba(124,58,237,0.25)',
        }}>
          <div style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.18)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} color="#fff" />
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem', textAlign: 'center' }}>Ver Pais</span>
        </div>
      </div>

      {/* ── Mini card financeiro ── */}
      {data && (
        <div data-tour="home-saldo" onClick={() => navigate('/financeiro')} style={{
          background: 'linear-gradient(135deg, #4c1d95, #6d28d9)',
          borderRadius: 16, padding: '14px 16px', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(109,40,217,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wallet size={16} color="rgba(255,255,255,0.85)" />
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.78rem', fontWeight: 700 }}>Financeiro · este mês</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>Ver mais →</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(255,255,255,0.65)' }}>Saldo</p>
              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{fmt(data.fin_saldo)}</p>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  <TrendingUp size={12} color="#86efac" />
                  <span style={{ fontSize: '0.65rem', color: '#86efac', fontWeight: 700 }}>Entradas</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{fmt(data.fin_entradas)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  <TrendingDown size={12} color="#fca5a5" />
                  <span style={{ fontSize: '0.65rem', color: '#fca5a5', fontWeight: 700 }}>Saídas</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{fmt(data.fin_saidas)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Próximas doses ── */}
      <section data-tour="home-proximas-doses">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Próximas doses</h2>
          <button onClick={() => navigate('/saude')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600, padding: 0,
          }}>
            <CalendarDays size={14} /> Ver calendário
          </button>
        </div>
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
