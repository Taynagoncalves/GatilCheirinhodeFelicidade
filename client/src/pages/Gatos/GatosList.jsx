import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Cat, X, PawPrint, Users, Trash2, Cake, Weight, Layers } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import { useTour } from '../../contexts/TourContext';
import api from '../../api/client';
import { calcularIdade } from '../../utils/idade';
import { formatarPeso } from '../../utils/peso';

const TOUR = [
  {
    selector: '[data-tour="gatos-cadastrar"]',
    titulo: 'Cadastrar Gato',
    texto: 'Toque aqui para adicionar um novo filhote ao gatil ou cadastrar um pai reprodutor.',
  },
  {
    selector: '[data-tour="gatos-filtros"]',
    titulo: 'Filtros',
    texto: 'Filtre por sexo (Machos/Fêmeas) e por status (Disponível, Reservado, Vendido) com scroll horizontal.',
  },
  {
    selector: '[data-tour="gatos-busca"]',
    titulo: 'Busca Rápida',
    texto: 'Digite o nome do gato para encontrá-lo rapidamente entre todos os cadastrados.',
  },
  {
    selector: '[data-tour="gatos-lista"]',
    titulo: 'Cards dos Gatos',
    texto: 'Toque em um card para ver o perfil completo. Os badges coloridos indicam dose urgente: vermelho = atrasada, laranja = hoje, azul = amanhã.',
  },
  {
    titulo: 'Alterar Status Rápido',
    texto: 'Dentro de cada card, toque no badge de status (ex: "Disponível ▾") para alterar rapidamente sem abrir o perfil completo.',
  },
  {
    titulo: 'Excluir Gato',
    texto: 'O ícone de lixeira no lado direito de cada card exclui o gato e todo o seu histórico de saúde permanentemente.',
  },
];

function alerteDose(proxima_dose_min, proxima_medicamento_nome) {
  if (!proxima_dose_min) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dose = new Date(proxima_dose_min + 'T00:00:00');
  const diff = Math.round((dose - hoje) / (1000 * 60 * 60 * 24));
  const med = proxima_medicamento_nome ? ` · ${proxima_medicamento_nome}` : '';
  if (diff < 0) return { label: `Atrasada${med}`, cor: '#c0524a', bg: '#fdecea' };
  if (diff === 0) return { label: `Hoje!${med}`, cor: '#b8863a', bg: '#fef3e2' };
  if (diff === 1) return { label: `Amanhã${med}`, cor: '#2f6690', bg: '#eaf3fb' };
  return { label: `Em dia${med}`, cor: '#3f8c5a', bg: '#edf7f1' };
}

const STATUS_OPTIONS = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'reservado',  label: 'Reservado' },
  { value: 'vendido',    label: 'Vendido' },
  { value: 'mantido',    label: 'Mantido' },
];

const SEXO_OPTS   = [{ v: '', l: 'Todos' }, { v: 'macho', l: '♂ Machos' }, { v: 'femea', l: '♀ Fêmeas' }];
const STATUS_OPTS = [{ v: '', l: 'Todos' }, { v: 'disponivel', l: 'Disponível' }, { v: 'reservado', l: 'Reservado' }, { v: 'vendido', l: 'Vendido' }];

function ChipRow({ label, opts, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, flexShrink: 0, minWidth: 34 }}>{label}</span>
      <div style={{ display: 'flex', gap: 5, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {opts.map((o) => {
          const ativo = value === o.v;
          return (
            <button key={o.v} onClick={() => onChange(o.v)} style={{
              flexShrink: 0, cursor: 'pointer',
              padding: '5px 13px', fontSize: '0.76rem', fontWeight: ativo ? 700 : 500,
              borderRadius: 20, transition: 'all 0.15s',
              border: ativo ? 'none' : '1.5px solid #e2e8f0',
              background: ativo ? 'var(--color-primary)' : '#fff',
              color: ativo ? '#fff' : '#64748b',
              boxShadow: ativo ? '0 2px 8px rgba(26,77,124,0.22)' : 'none',
            }}>{o.l}</button>
          );
        })}
      </div>
    </div>
  );
}

export default function GatosList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [busca, setBusca] = useState('');
  const [sexo, setSexo] = useState('');
  const [statusFiltro, setStatusFiltro] = useState(searchParams.get('status') || '');
  const [gatos, setGatos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [statusOpen, setStatusOpen] = useState(null);
  const [confirmando, setConfirmando] = useState(null);
  const toast = useToast();
  const { setSteps } = useTour();

  useEffect(() => {
    setSteps(TOUR, 'gatos');
    return () => setSteps([]);
  }, []);

  const excluir = async (id) => {
    await api.delete(`/gatos/${id}`);
    setGatos((prev) => prev.filter((g) => g.id !== id));
    setConfirmando(null);
    toast('Gato excluído com sucesso!');
  };

  const load = () => {
    api.get('/gatos', { params: { busca: busca || undefined, sexo: sexo || undefined, status: statusFiltro || undefined } })
      .then((res) => setGatos(res.data));
  };

  useEffect(() => { load(); }, [busca, sexo, statusFiltro]);

  const changeStatus = async (id, status) => {
    await api.patch(`/gatos/${id}/status`, { status });
    setGatos((prev) => prev.map((g) => g.id === id ? { ...g, status } : g));
    setStatusOpen(null);
    toast('Status atualizado!');
  };

  return (
    <Layout title="Gatos" showBack>
      <button className="btn btn-primary" data-tour="gatos-cadastrar" onClick={() => setShowModal(true)}>
        <Plus size={18} /> Cadastrar Gato
      </button>

      {/* Filtros */}
      <div data-tour="gatos-filtros" style={{
        background: '#fff', borderRadius: 14, padding: '10px 12px',
        display: 'flex', flexDirection: 'column', gap: 10,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        <ChipRow label="Sexo"   opts={SEXO_OPTS}   value={sexo}         onChange={setSexo} />
        <div style={{ height: 1, background: '#f1f5f9' }} />
        <ChipRow label="Status" opts={STATUS_OPTS} value={statusFiltro} onChange={setStatusFiltro} />
      </div>

      <div className="search-input" data-tour="gatos-busca">
        <Search size={18} />
        <input placeholder="Buscar gato..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {gatos.length === 0 && (
        <EmptyState icon={Cat} title="Nenhum gato cadastrado" description="Cadastre o primeiro gato do gatil." />
      )}

      <div data-tour="gatos-lista" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {gatos.map((g) => {
          const alerta = alerteDose(g.proxima_dose_min, g.proxima_medicamento_nome);
          return (
            <div key={g.id} onClick={() => navigate(`/gatos/${g.id}`)} style={{
              background: '#fff', borderRadius: 16, padding: '12px 14px', cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
              borderLeft: alerta ? `4px solid ${alerta.cor}` : '4px solid transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>

                {/* Foto circular */}
                {g.foto_url
                  ? <img src={g.foto_url} alt={g.nome} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2.5px solid #e8f0f8' }} />
                  : <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid #bfdbfe' }}>
                      <Cat size={26} color="#1d4ed8" />
                    </div>
                }

                <div style={{ flex: 1, minWidth: 0 }}>

                  {/* Nome + status + lixeira */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.nome || 'Sem nome'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ position: 'relative' }}>
                        <span
                          className={`status-badge status-${g.status}`}
                          style={{ cursor: 'pointer', fontSize: '0.7rem' }}
                          onClick={() => setStatusOpen(statusOpen === g.id ? null : g.id)}
                        >
                          {STATUS_OPTIONS.find((s) => s.value === g.status)?.label || g.status} ▾
                        </span>
                        {statusOpen === g.id && (
                          <div style={{
                            position: 'absolute', top: '110%', right: 0, zIndex: 30,
                            background: '#fff', border: '1px solid var(--color-border)',
                            borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                            minWidth: 148, overflow: 'hidden',
                          }}>
                            {STATUS_OPTIONS.map((s) => (
                              <div key={s.value} onClick={() => changeStatus(g.id, s.value)} style={{
                                padding: '10px 14px', cursor: 'pointer', fontSize: '0.88rem',
                                fontWeight: g.status === s.value ? 700 : 400,
                                background: g.status === s.value ? '#f0f4ff' : 'transparent',
                              }}>
                                {s.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button className="icon-btn" style={{ color: 'var(--color-danger)' }}
                        onClick={() => setConfirmando(g)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Badge de dose */}
                  {alerta && (
                    <span style={{
                      display: 'inline-block', marginTop: 3,
                      fontSize: '0.7rem', fontWeight: 700, color: alerta.cor,
                      background: alerta.bg, borderRadius: 20, padding: '2px 8px',
                      border: `1px solid ${alerta.cor}33`,
                    }}>{alerta.label}</span>
                  )}

                  {/* Info compacta numa linha só */}
                  {(g.data_nascimento || g.peso != null || g.ninhada_nome) && (
                    <p style={{ margin: '5px 0 0', fontSize: '0.76rem', color: '#94a3b8', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3px 6px' }}>
                      {g.data_nascimento && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Cake size={11} />{calcularIdade(g.data_nascimento)}</span>}
                      {g.data_nascimento && (g.peso != null || g.ninhada_nome) && <span style={{ color: '#cbd5e1' }}>·</span>}
                      {g.peso != null && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Weight size={11} />{formatarPeso(g.peso)}</span>}
                      {g.peso != null && g.ninhada_nome && <span style={{ color: '#cbd5e1' }}>·</span>}
                      {g.ninhada_nome && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Layers size={11} />{g.ninhada_nome}</span>}
                    </p>
                  )}

                  {/* Pai / Mãe como chips */}
                  {(g.mae_nome || g.pai_nome) && (
                    <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                      {g.mae_nome && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#7c3aed', background: '#f5f0ff', borderRadius: 20, padding: '2px 8px', border: '1px solid #ede9fe' }}>
                          ♀ {g.mae_nome}
                        </span>
                      )}
                      {g.pai_nome && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#1d4ed8', background: '#eff6ff', borderRadius: 20, padding: '2px 8px', border: '1px solid #dbeafe' }}>
                          ♂ {g.pai_nome}
                        </span>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {confirmando && (
        <ConfirmModal
          message={`Excluir ${confirmando.nome || 'este gato'}? Todo o histórico de saúde será removido.`}
          onConfirm={() => excluir(confirmando.id)}
          onCancel={() => setConfirmando(null)}
        />
      )}

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
