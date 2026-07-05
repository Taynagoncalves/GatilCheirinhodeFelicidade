import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Cat, X, PawPrint, Users, Trash2, Cake, Weight, Layers, Calendar, MoreVertical, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
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

function alerteDose(proxima_dose_min) {
  if (!proxima_dose_min) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dose = new Date(proxima_dose_min + 'T00:00:00');
  const diff = Math.round((dose - hoje) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { status: 'Dose atrasada',      cor: '#c0524a', bg: '#fdecea', icon: 'alert' };
  if (diff === 0) return { status: 'Dose hoje!',         cor: '#b8863a', bg: '#fef3e2', icon: 'clock' };
  if (diff === 1) return { status: 'Dose amanhã',        cor: '#2f6690', bg: '#eaf3fb', icon: 'check' };
  if (diff <= 7)  return { status: `Dose em ${diff} dias`, cor: '#3f8c5a', bg: '#edf7f1', icon: 'check' };
  return { status: `Dose em ${diff} dias`,               cor: '#64748b', bg: '#f8fafc', icon: 'check' };
}

const STATUS_OPTIONS = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'reservado',  label: 'Reservado' },
  { value: 'vendido',    label: 'Vendido' },
  { value: 'mantido',    label: 'Mantido' },
];

const SEXO_OPTS   = [{ v: '', l: 'Todos' }, { v: 'macho', l: 'Machos' }, { v: 'femea', l: 'Fêmeas' }];
const STATUS_OPTS = [{ v: '', l: 'Todos' }, { v: 'disponivel', l: 'Disponível' }, { v: 'reservado', l: 'Reservado' }, { v: 'vendido', l: 'Vendido' }];

function ChipRow({ opts, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {opts.map((o) => {
        const ativo = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            flexShrink: 0, cursor: 'pointer',
            padding: '7px 16px', fontSize: '0.82rem', fontWeight: ativo ? 700 : 500,
            borderRadius: 20, transition: 'all 0.15s',
            border: ativo ? 'none' : '1.5px solid #e2e8f0',
            background: ativo ? 'var(--color-primary)' : '#fff',
            color: ativo ? '#fff' : '#64748b',
            boxShadow: ativo ? '0 2px 8px rgba(26,77,124,0.22)' : 'none',
          }}>{o.l}</button>
        );
      })}
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
        <ChipRow opts={SEXO_OPTS}   value={sexo}         onChange={setSexo} />
        <div style={{ height: 1, background: '#f1f5f9' }} />
        <ChipRow opts={STATUS_OPTS} value={statusFiltro} onChange={setStatusFiltro} />
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
          const alerta = alerteDose(g.proxima_dose_min);
          const statusDot = { disponivel: '#16a34a', reservado: '#d97706', vendido: '#dc2626', mantido: '#2563eb' }[g.status] || '#94a3b8';
          const statusLabel = STATUS_OPTIONS.find((s) => s.value === g.status)?.label || g.status;

          const statusColors = { disponivel: '#16a34a', reservado: '#d97706', vendido: '#dc2626', mantido: '#2563eb' };
          const statusBgs   = { disponivel: '#dcfce7', reservado: '#fef3c7', vendido: '#fee2e2', mantido: '#dbeafe' };

          return (
            <div key={g.id} onClick={() => navigate(`/gatos/${g.id}`)} style={{
              background: '#fff', borderRadius: 18, cursor: 'pointer',
              boxShadow: '0 2px 16px rgba(0,0,0,0.09)',
              overflow: 'hidden',
              borderLeft: `4px solid ${statusColors[g.status] || '#94a3b8'}`,
            }}>
              <div style={{ display: 'flex', gap: 12, padding: '14px 14px 0' }}>

                {/* Foto */}
                {g.foto_url
                  ? <img src={g.foto_url} alt={g.nome} style={{ width: 80, height: 80, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 80, height: 80, borderRadius: 14, background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Cat size={32} color="#1d4ed8" />
                    </div>
                }

                <div style={{ flex: 1, minWidth: 0 }}>

                  {/* Nome + menu status */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.nome || 'Sem nome'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ position: 'relative' }}>
                        <div
                          onClick={() => setStatusOpen(statusOpen === g.id ? null : g.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                            background: statusBgs[g.status] || '#f1f5f9',
                            border: `1.5px solid ${statusColors[g.status] || '#94a3b8'}44`,
                            borderRadius: 20, padding: '4px 8px 4px 8px',
                          }}
                        >
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusColors[g.status] || '#94a3b8', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.73rem', fontWeight: 700, color: statusColors[g.status] || '#475569' }}>{statusLabel}</span>
                          <ChevronRight size={12} color={statusColors[g.status] || '#94a3b8'} style={{ transform: 'rotate(90deg)', flexShrink: 0 }} />
                        </div>
                        {statusOpen === g.id && (
                          <div style={{
                            position: 'absolute', top: '110%', right: 0, zIndex: 30,
                            background: '#fff', border: '1px solid #e2e8f0',
                            borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                            minWidth: 152, overflow: 'hidden',
                          }}>
                            {STATUS_OPTIONS.map((s) => (
                              <div key={s.value} onClick={() => changeStatus(g.id, s.value)} style={{
                                padding: '10px 14px', cursor: 'pointer', fontSize: '0.88rem',
                                display: 'flex', alignItems: 'center', gap: 8,
                                fontWeight: g.status === s.value ? 700 : 400,
                                background: g.status === s.value ? '#f0f4ff' : 'transparent',
                              }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[s.value], flexShrink: 0 }} />
                                {s.label}
                              </div>
                            ))}
                            <div style={{ borderTop: '1px solid #f1f5f9' }}>
                              <div onClick={() => { setStatusOpen(null); setConfirmando(g); }} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '0.88rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Trash2 size={14} /> Excluir
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Meta: chips de data, idade, peso, ninhada */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                    {g.data_nascimento && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, padding: '3px 9px', fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                        <Calendar size={12} color="#94a3b8" /> {g.data_nascimento.split('-').reverse().join('/')}
                      </span>
                    )}
                    {g.data_nascimento && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, padding: '3px 9px', fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                        <Cake size={12} color="#94a3b8" /> {calcularIdade(g.data_nascimento)}
                      </span>
                    )}
                    {g.peso != null && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, padding: '3px 9px', fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                        <Weight size={12} color="#94a3b8" /> {formatarPeso(g.peso)}
                      </span>
                    )}
                    {g.ninhada_nome && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f5f0ff', border: '1px solid #ede9fe', borderRadius: 20, padding: '3px 9px', fontSize: '0.8rem', color: '#7c3aed', fontWeight: 600 }}>
                        <Layers size={12} color="#7c3aed" /> {g.ninhada_nome}
                      </span>
                    )}
                  </div>

                </div>
              </div>

              {/* Pais + Dose — rodapé do card */}
              {(g.mae_nome || g.pai_nome || alerta) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, margin: '10px 14px 14px' }}>

                  {/* Pais com foto */}
                  {(g.mae_nome || g.pai_nome) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {g.mae_nome && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, minWidth: 22 }}>Mãe</span>
                          {g.mae_foto
                            ? <img src={g.mae_foto} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #ede9fe' }} />
                            : <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cat size={11} color="#7c3aed" /></div>
                          }
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed' }}>{g.mae_nome}</span>
                        </div>
                      )}
                      {g.pai_nome && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, minWidth: 22 }}>Pai</span>
                          {g.pai_foto
                            ? <img src={g.pai_foto} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #dbeafe' }} />
                            : <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cat size={11} color="#1d4ed8" /></div>
                          }
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8' }}>{g.pai_nome}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mini card de dose */}
                  {alerta && (
                    <div style={{
                      background: alerta.bg, borderRadius: 12, padding: '7px 12px',
                      border: `1px solid ${alerta.cor}33`, flexShrink: 0,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                        {alerta.icon === 'alert' ? <AlertCircle size={14} color={alerta.cor} />
                          : alerta.icon === 'clock' ? <Clock size={14} color={alerta.cor} />
                          : <CheckCircle2 size={14} color={alerta.cor} />}
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: alerta.cor }}>{alerta.status}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                        {g.proxima_medicamento_nome || 'Medicamento'}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: '#94a3b8' }}>
                        {g.proxima_dose_min?.split('-').reverse().join('/')}
                      </p>
                    </div>
                  )}
                </div>
              )}
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
