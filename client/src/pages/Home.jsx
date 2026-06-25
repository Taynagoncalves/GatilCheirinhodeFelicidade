import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cat, PawPrint, Plus, CalendarClock, X, Users, Wallet, Syringe, TrendingUp, TrendingDown, CalendarDays, ChevronRight, Heart } from 'lucide-react';
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
        {[
          { label: 'Gatos', value: data?.total_gatos, icon: <Cat size={20} />, cor: '#1d4ed8', bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', route: '/gatos', tour: 'home-stat-gatos' },
          { label: 'Ninhadas', value: data?.total_ninhadas, icon: <PawPrint size={20} />, cor: '#7c3aed', bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', route: '/ninhadas', tour: 'home-stat-ninhadas' },
          { label: 'Reservados', value: data?.total_reservados, icon: <Heart size={20} />, cor: '#d97706', bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)', route: '/gatos?status=reservado', tour: 'home-reservados' },
          { label: 'Vendidos', value: data?.total_vendidos, icon: <PawPrint size={20} />, cor: '#16a34a', bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', route: '/gatos?status=vendido', tour: 'home-vendidos' },
        ].map((s) => (
          <div key={s.label} data-tour={s.tour} onClick={() => navigate(s.route)} style={{
            background: s.bg, borderRadius: 16, padding: '14px 14px 12px', cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: `1px solid ${s.cor}18`,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `${s.cor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.cor }}>
                {s.icon}
              </div>
              <ChevronRight size={14} color={`${s.cor}88`} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: s.cor, lineHeight: 1 }}>{s.value ?? '—'}</p>
              <p style={{ margin: '3px 0 0', fontSize: '0.74rem', fontWeight: 600, color: s.cor, opacity: 0.8 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Ações rápidas ── */}
      <div data-tour="home-acoes" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div onClick={() => navigate('/gatos/novo')} data-tour="home-btn-cadastrar" style={{
          background: 'linear-gradient(145deg, #1a4d7c, #2f6690)',
          borderRadius: 16, padding: '16px 14px', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(26,77,124,0.28)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.18)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={22} color="#fff" />
            </div>
            <ChevronRight size={16} color="rgba(255,255,255,0.5)" />
          </div>
          <div>
            <p style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>Cadastrar Gato</p>
            <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem' }}>Novo filhote</p>
          </div>
        </div>

        <div onClick={() => navigate('/pais')} style={{
          background: 'linear-gradient(145deg, #5b21b6, #7c3aed)',
          borderRadius: 16, padding: '16px 14px', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(124,58,237,0.28)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.18)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} color="#fff" />
            </div>
            <ChevronRight size={16} color="rgba(255,255,255,0.5)" />
          </div>
          <div>
            <p style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>Ver Pais</p>
            <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem' }}>Reprodutores</p>
          </div>
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
