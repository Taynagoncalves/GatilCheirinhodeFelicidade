import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cat, PawPrint, Plus, CalendarClock, X, Users, Wallet, TrendingUp, TrendingDown, CalendarDays, ChevronRight, Heart, ShoppingBag, BarChart3 } from 'lucide-react';
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
          { nome: 'Gatos', sub: 'Cadastrados', value: data?.total_gatos, icon: <Cat size={22} />, cor: '#1d4ed8', iconBg: '#dbeafe', tour: 'home-stat-gatos', route: '/gatos' },
          { nome: 'Ninhadas', sub: 'Registradas', value: data?.total_ninhadas, icon: <PawPrint size={22} />, cor: '#7c3aed', iconBg: '#ede9fe', tour: 'home-stat-ninhadas', route: '/ninhadas' },
          { nome: 'Reservados', sub: '', value: data?.total_reservados, icon: <Heart size={22} />, cor: '#d97706', iconBg: '#fef3c7', tour: 'home-reservados', route: '/gatos?status=reservado' },
          { nome: 'Vendidos', sub: '', value: data?.total_vendidos, icon: <ShoppingBag size={22} />, cor: '#16a34a', iconBg: '#dcfce7', tour: 'home-vendidos', route: '/gatos?status=vendido' },
        ].map((s) => (
          <div key={s.nome} data-tour={s.tour} onClick={() => navigate(s.route)} style={{
            background: '#fff', borderRadius: 16, padding: '14px 12px 12px', cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.cor }}>
              {s.icon}
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '1.9rem', fontWeight: 900, color: s.cor, lineHeight: 1 }}>{s.value ?? '—'}</p>
              <p style={{ margin: '3px 0 0', fontSize: '0.74rem', fontWeight: 700, color: s.cor }}>{s.nome}</p>
              {s.sub && <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 500, color: s.cor, opacity: 0.65 }}>{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Ações rápidas ── */}
      <div data-tour="home-acoes" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div onClick={() => navigate('/gatos/novo')} data-tour="home-btn-cadastrar" style={{
          background: 'linear-gradient(145deg, #1a4d7c, #2f6690)',
          borderRadius: 16, padding: '14px', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(26,77,124,0.28)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.18)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Plus size={24} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.2 }}>Cadastrar Gato</p>
            <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.71rem' }}>Novo filhote</p>
          </div>
        </div>

        <div onClick={() => navigate('/pais')} style={{
          background: 'linear-gradient(145deg, #5b21b6, #7c3aed)',
          borderRadius: 16, padding: '14px', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(124,58,237,0.28)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.18)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={24} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.2 }}>Ver Pais</p>
            <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.71rem' }}>Reprodutores</p>
          </div>
        </div>
      </div>

      {/* ── Painel Financeiro ── */}
      <div data-tour="home-saldo" style={{ borderRadius: 22, overflow: 'hidden', boxShadow: '0 8px 32px rgba(17,60,100,0.22)' }}>

        {/* Hero gradiente */}
        <div style={{ background: 'linear-gradient(145deg, #0f3460 0%, #1a5276 50%, #2980b9 100%)', padding: '20px 18px 0', position: 'relative', overflow: 'hidden' }}>
          {/* Círculos decorativos de fundo */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', top: 20, right: 30, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />

          {/* Header: título + botão */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Wallet size={20} color="#fff" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>Painel Financeiro</p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>Visão geral do mês</p>
              </div>
            </div>
            <button onClick={() => navigate('/financeiro')} style={{
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 20, padding: '6px 14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              color: '#fff', fontSize: '0.72rem', fontWeight: 700,
              backdropFilter: 'blur(8px)',
            }}>
              Abrir <ChevronRight size={13} />
            </button>
          </div>

          {/* Saldo principal */}
          {data && (
            <>
              <div style={{ marginBottom: 18, position: 'relative' }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Saldo do mês</p>
                <p style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: -1 }}>{fmt(data.fin_saldo)}</p>
              </div>

              {/* Cards entradas/saídas — meia lua na base */}
              <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
                <div style={{ flex: 1, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '14px 14px 0 0', padding: '10px 14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={12} color="#4ade80" />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Entradas</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#4ade80' }}>{fmt(data.fin_entradas)}</p>
                </div>
                <div style={{ flex: 1, background: 'rgba(252,165,165,0.12)', border: '1px solid rgba(252,165,165,0.25)', borderRadius: '14px 14px 0 0', padding: '10px 14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(252,165,165,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingDown size={12} color="#fca5a5" />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Saídas</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#fca5a5' }}>{fmt(data.fin_saidas)}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Seção de recursos */}
        <div style={{ background: '#fff' }}>
          <div style={{ padding: '16px 18px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>Recursos disponíveis</span>
            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
          </div>

          <div style={{ padding: '6px 12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { icon: <TrendingUp size={16} color="#16a34a" />, bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '#bbf7d0', titulo: 'Entradas', sub: 'Registrar recebimentos' },
              { icon: <TrendingDown size={16} color="#dc2626" />, bg: 'linear-gradient(135deg,#fff5f5,#fee2e2)', border: '#fecaca', titulo: 'Saídas', sub: 'Ração, vet e mais' },
              { icon: <BarChart3 size={16} color="#1d4ed8" />, bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '#bfdbfe', titulo: 'Relatórios', sub: 'Gráficos por mês' },
              { icon: <Users size={16} color="#7c3aed" />, bg: 'linear-gradient(135deg,#faf5ff,#f3e8ff)', border: '#e9d5ff', titulo: 'Clientes', sub: 'Compradores e reservas' },
            ].map((item) => (
              <div key={item.titulo} onClick={() => navigate('/financeiro')} style={{
                background: item.bg, border: `1px solid ${item.border}`,
                borderRadius: 14, padding: '12px 12px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>{item.titulo}</p>
                  <p style={{ margin: '1px 0 0', fontSize: '0.66rem', color: '#64748b', lineHeight: 1.3 }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
