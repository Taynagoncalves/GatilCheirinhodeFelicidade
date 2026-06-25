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
          const statusDot = { disponivel: '#16a34a', reservado: '#d97706', vendido: '#dc2626', mantido: '#2563eb' }[g.status] || '#94a3b8';
          const statusLabel = STATUS_OPTIONS.find((s) => s.value === g.status)?.label || g.status;

          return (
            <div key={g.id} onClick={() => navigate(`/gatos/${g.id}`)} style={{
              background: '#fff', borderRadius: 16, padding: '12px', cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}>
              <div style={{ display: 'flex', gap: 12 }}>

                {/* Foto quadrada arredondada */}
                {g.foto_url
                  ? <img src={g.foto_url} alt={g.nome} style={{ width: 76, height: 76, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 76, height: 76, borderRadius: 12, background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Cat size={30} color="#1d4ed8" />
                    </div>
                }

                <div style={{ flex: 1, minWidth: 0 }}>

                  {/* Nome + status + ⋮ */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.nome || 'Sem nome'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ position: 'relative' }}>
                        <div
                          onClick={() => setStatusOpen(statusOpen === g.id ? null : g.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, padding: '3px 10px 3px 8px' }}
                        >
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusDot, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>{statusLabel}</span>
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
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: { disponivel: '#16a34a', reservado: '#d97706', vendido: '#dc2626', mantido: '#2563eb' }[s.value], flexShrink: 0 }} />
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
                      <button className="icon-btn" style={{ color: '#94a3b8', padding: 2 }}
                        onClick={() => setStatusOpen(statusOpen === g.id ? null : g.id)}>
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Meta: data, idade, peso, ninhada */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', marginTop: 5 }}>
                    {g.data_nascimento && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Calendar size={11} color="#94a3b8" /> {g.data_nascimento.split('-').reverse().join('/')}
                      </span>
                    )}
                    {g.data_nascimento && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Cake size={11} color="#94a3b8" /> {calcularIdade(g.data_nascimento)}
                      </span>
                    )}
                    {g.peso != null && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Weight size={11} color="#94a3b8" /> {formatarPeso(g.peso)}
                      </span>
                    )}
                    {g.ninhada_nome && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Layers size={11} color="#94a3b8" /> {g.ninhada_nome}
                      </span>
                    )}
                  </div>

                  {/* Pais + Dose card */}
                  {(g.mae_nome || g.pai_nome || alerta) && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>

                      {/* Pais com foto */}
                      {(g.mae_nome || g.pai_nome) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {g.mae_nome && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, minWidth: 22 }}>Mãe</span>
                              {g.mae_foto
                                ? <img src={g.mae_foto} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #ede9fe' }} />
                                : <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cat size={10} color="#7c3aed" /></div>
                              }
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed' }}>{g.mae_nome}</span>
                            </div>
                          )}
                          {g.pai_nome && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, minWidth: 22 }}>Pai</span>
                              {g.pai_foto
                                ? <img src={g.pai_foto} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #dbeafe' }} />
                                : <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cat size={10} color="#1d4ed8" /></div>
                              }
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1d4ed8' }}>{g.pai_nome}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mini card de dose */}
                      {alerta && (
                        <div style={{
                          background: alerta.bg, borderRadius: 10, padding: '6px 10px',
                          border: `1px solid ${alerta.cor}22`, flexShrink: 0, maxWidth: 148,
                        }}>
                          <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4 }}>Próx. medicamento</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                            {alerta.label.startsWith('Em dia') || alerta.label.startsWith('Amanhã')
                              ? <CheckCircle2 size={12} color={alerta.cor} />
                              : alerta.label.startsWith('Hoje') ? <Clock size={12} color={alerta.cor} />
                              : <AlertCircle size={12} color={alerta.cor} />
                            }
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: alerta.cor }}>
                              {g.proxima_medicamento_nome || 'Medicamento'}
                            </span>
                          </div>
                          <p style={{ margin: '2px 0 0', fontSize: '0.67rem', color: '#94a3b8' }}>
                            Próxima: {g.proxima_dose_min?.split('-').reverse().join('/')}
                          </p>
                        </div>
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
