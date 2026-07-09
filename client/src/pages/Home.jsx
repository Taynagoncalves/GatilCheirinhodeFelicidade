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
          background: 'linear-gradient(145deg, #1a4d7c, #2f6690)',
          borderRadius: 16, padding: '14px', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(26,77,124,0.28)',
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

      {/* ── Painel Financeiro — só cards ── */}
      <div data-tour="home-saldo" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { icon: <Users size={18} color="#7c3aed" />, dot: '#7c3aed', bg: '#f5f0ff', titulo: 'Clientes', sub: 'Compradores e reservas', tab: 0 },
          { icon: <TrendingUp size={18} color="#16a34a" />, dot: '#16a34a', bg: '#f0fdf4', titulo: 'Entradas', sub: 'Registrar recebimentos', tab: 2 },
          { icon: <TrendingDown size={18} color="#dc2626" />, dot: '#dc2626', bg: '#fff5f5', titulo: 'Saídas', sub: 'Ração, vet e mais', tab: 2 },
          { icon: <BarChart3 size={18} color="#1d4ed8" />, dot: '#1d4ed8', bg: '#eff6ff', titulo: 'Relatórios', sub: 'Gráficos por mês', tab: 1 },
        ].map((item) => (
          <div key={item.titulo} onClick={() => navigate('/financeiro', { state: { tab: item.tab } })} style={{
            background: '#fff', border: `1.5px solid ${item.dot}20`,
            borderRadius: 14, padding: '12px 12px 10px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.83rem', fontWeight: 800, color: '#1e293b' }}>{item.titulo}</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.3 }}>{item.sub}</p>
            </div>
          </div>
        ))}
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
