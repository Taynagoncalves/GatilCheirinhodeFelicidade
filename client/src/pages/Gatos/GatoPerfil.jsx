import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Cat, Syringe, Pill, Plus, Trash2, Weight, X, Scale, GitBranch, User } from 'lucide-react';
import { formatarPeso } from '../../utils/peso';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import { useTour } from '../../contexts/TourContext';
import api from '../../api/client';
import { calcularIdade } from '../../utils/idade';

const TOUR = [
  {
    selector: '[data-tour="perfil-info"]',
    titulo: 'Informações do Gato',
    texto: 'Aqui estão todos os dados cadastrados: cor, sexo, data de nascimento, idade calculada automaticamente, pais e ninhada.',
  },
  {
    selector: '[data-tour="perfil-editar"]',
    titulo: 'Editar Gato',
    texto: 'Toque em "Editar Gato" para alterar qualquer informação do cadastro, incluindo a foto.',
  },
  {
    selector: '[data-tour="perfil-registrar"]',
    titulo: 'Registrar Dose',
    texto: 'Registre uma nova dose de vacina ou medicamento diretamente para este gato. A data de aplicação e a próxima dose são registradas aqui.',
  },
  {
    selector: '[data-tour="perfil-historico"]',
    titulo: 'Histórico de Saúde',
    texto: 'Todas as doses registradas aparecem aqui em ordem cronológica. Use a lixeira para remover um registro incorreto.',
  },
  {
    selector: '[data-tour="perfil-ativos"]',
    titulo: 'Medicamentos Ativos',
    texto: 'Exibe os medicamentos com próxima dose agendada para este gato, facilitando o controle sem precisar procurar no histórico.',
  },
];

export default function GatoPerfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gato, setGato] = useState(null);
  const [confirmando, setConfirmando] = useState(null);
  const [showPesoModal, setShowPesoModal] = useState(false);
  const [pesoValor, setPesoValor] = useState('');
  const [pesoUnidade, setPesoUnidade] = useState('g');
  const toast = useToast();
  const { setSteps } = useTour();

  const carregarGato = () => api.get(`/gatos/${id}`).then((res) => setGato(res.data));

  useEffect(() => { carregarGato(); }, [id]);

  useEffect(() => {
    setSteps(TOUR, 'perfil');
    return () => setSteps([]);
  }, []);

  const salvarPeso = async () => {
    if (!pesoValor) return;
    const pesoG = pesoUnidade === 'kg' ? parseFloat(pesoValor) * 1000 : parseFloat(pesoValor);
    await api.patch(`/gatos/${id}/peso`, { peso: pesoG });
    setShowPesoModal(false);
    setPesoValor('');
    toast('Peso registrado!');
    carregarGato();
  };

  const excluirRegistro = async (regId) => {
    await api.delete(`/aplicacoes/${regId}`);
    setConfirmando(null);
    toast('Registro excluído!');
    carregarGato();
  };

  if (!gato) return null;

  return (
    <Layout title="Perfil do Gato" showBack>
      <div className="card" data-tour="perfil-info">
        {gato.foto_url ? (
          <img src={gato.foto_url} alt={gato.nome} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
        ) : (
          <div style={{ width: '100%', height: 220, borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <Cat size={48} />
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <p className="card-title" style={{ fontSize: '1.2rem' }}>{gato.nome || 'Sem nome'}</p>
          <div style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <StatusBadge status={gato.status} />
            {gato.status === 'vendido' && gato.cliente_nome && (
              <button
                onClick={() => navigate(`/clientes/${gato.cliente_id}`)}
                style={{
                  all: 'unset', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #a78bfa 100%)',
                  borderRadius: 24, padding: '4px 14px 4px 4px',
                  boxShadow: '0 3px 12px rgba(124,58,237,0.4)',
                }}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.62rem', fontWeight: 900, color: '#fff', letterSpacing: 0.3, flexShrink: 0,
                }}>
                  {gato.cliente_nome.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>Vendido para</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{gato.cliente_nome}</span>
                </span>
              </button>
            )}
          </div>
          <p className="card-meta">
            Cor: {gato.cor || 'Não informado'}<br />
            Sexo: {gato.sexo === 'macho' ? 'Macho' : 'Fêmea'}<br />
            Nascimento: {gato.data_nascimento ? gato.data_nascimento.split('-').reverse().join('/') : 'Não informado'}<br />
            Idade: {gato.data_nascimento ? calcularIdade(gato.data_nascimento) : 'Não informado'}<br />
            Peso: {formatarPeso(gato.peso) || 'Não informado'}<br />
            Mãe: {gato.mae_nome || 'Não informado'}<br />
            Pai: {gato.pai_nome || 'Não informado'}<br />
            Ninhada: {gato.ninhada_nome || 'Não informado'}
            {gato.observacoes && <><br />Obs: {gato.observacoes}</>}
          </p>
        </div>
        <button className="btn btn-outline" data-tour="perfil-editar" style={{ marginTop: 12 }} onClick={() => navigate(`/gatos/${id}/editar`)}>
          Editar Gato
        </button>
      </div>

      {/* ── Árvore Genealógica ── */}
      {(gato.pai_nome || gato.mae_nome) && (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #1a4d7c, #2f6690)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GitBranch size={16} color="#fff" />
            </div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#2d3748' }}>Árvore Genealógica</p>
          </div>

          {/* Pais — linha do topo */}
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
            {/* Pai */}
            <div
              onClick={() => gato.pai_id && navigate(`/pais/${gato.pai_id}`)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: gato.pai_id ? 'pointer' : 'default', minWidth: 70 }}
            >
              {gato.pai_foto
                ? <img src={gato.pai_foto} alt={gato.pai_nome} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #1a4d7c', boxShadow: '0 2px 8px rgba(26,77,124,0.25)' }} />
                : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #93c5fd' }}><Cat size={24} color="#1d4ed8" /></div>
              }
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#2d3748', textAlign: 'center', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gato.pai_nome || '—'}</p>
              <span style={{ fontSize: '0.65rem', color: '#718096', fontWeight: 600, background: '#f0f4ff', padding: '2px 8px', borderRadius: 20 }}>Pai</span>
            </div>

            {/* Ícone central decorativo */}
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
              <span style={{ fontSize: '1rem' }}>🐾</span>
            </div>

            {/* Mãe */}
            <div
              onClick={() => gato.mae_id && navigate(`/pais/${gato.mae_id}`)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: gato.mae_id ? 'pointer' : 'default', minWidth: 70 }}
            >
              {gato.mae_foto
                ? <img src={gato.mae_foto} alt={gato.mae_nome} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #7c3aed', boxShadow: '0 2px 8px rgba(124,58,237,0.25)' }} />
                : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #c4b5fd' }}><Cat size={24} color="#7c3aed" /></div>
              }
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#2d3748', textAlign: 'center', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gato.mae_nome || '—'}</p>
              <span style={{ fontSize: '0.65rem', color: '#718096', fontWeight: 600, background: '#f5f0ff', padding: '2px 8px', borderRadius: 20 }}>Mãe</span>
            </div>
          </div>

          {/* Conector em V */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0 28px' }}>
            <div style={{ flex: 1, height: 28, borderBottom: '2px solid #e2e8f0', borderRight: '2px solid #e2e8f0', borderBottomRightRadius: 10 }} />
            <div style={{ flex: 1, height: 28, borderBottom: '2px solid #e2e8f0', borderLeft: '2px solid #e2e8f0', borderBottomLeftRadius: 10 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 2, height: 18, background: '#e2e8f0' }} />
          </div>

          {/* Gato — filho */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {gato.foto_url
                ? <img src={gato.foto_url} alt={gato.nome} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #2f6690', boxShadow: '0 4px 14px rgba(26,77,124,0.3)' }} />
                : <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #1a4d7c, #2f6690)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(26,77,124,0.3)' }}><Cat size={28} color="#fff" /></div>
              }
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#2d3748' }}>{gato.nome || 'Sem nome'}</p>
              <span style={{ fontSize: '0.65rem', color: '#2f6690', fontWeight: 700, background: '#e8f0f8', padding: '2px 10px', borderRadius: 20 }}>Filhote</span>
            </div>
          </div>
        </div>
      )}

      <button className="btn btn-secondary" onClick={() => { setPesoValor(''); setPesoUnidade('g'); setShowPesoModal(true); }}>
        <Weight size={18} /> Registrar Peso
      </button>

      <button className="btn btn-primary" data-tour="perfil-registrar" onClick={() => navigate(`/saude/registrar?gato_id=${id}`)}>
        <Plus size={18} /> Registrar Dose
      </button>

      <section data-tour="perfil-historico">
        <h2 className="section-title">Histórico de Saúde</h2>
        {gato.historico.length === 0 ? (
          <EmptyState icon={Pill} title="Nenhum registro de saúde" description="Os registros de vacinas e medicamentos aparecerão aqui." />
        ) : (
          <div className="card">
            {gato.historico.map((h) => (
              <div key={h.id} className="list-row" style={{ marginBottom: 8, border: 'none', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="card-photo-placeholder" style={{ width: 40, height: 40, flexShrink: 0 }}>
                  {h.tipo === 'vacina' ? <Syringe size={18} /> : <Pill size={18} />}
                </span>
                <div style={{ flex: 1 }}>
                  <p className="card-title" style={{ fontSize: '0.92rem' }}>{h.medicamento_nome}</p>
                  <p className="card-meta">
                    Data aplicada: {h.data_aplicada.split('-').reverse().join('/')}
                    {h.proxima_dose && <><br />Próxima dose: {h.proxima_dose.split('-').reverse().join('/')}</>}
                  </p>
                </div>
                <button
                  className="icon-btn"
                  style={{ color: 'var(--color-danger)', flexShrink: 0 }}
                  onClick={() => setConfirmando(h)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">Histórico de Peso</h2>
        {(!gato.historico_peso || gato.historico_peso.length === 0) ? (
          <EmptyState icon={Scale} title="Nenhum peso registrado" description="Registre o peso para acompanhar o crescimento." />
        ) : (
          <div className="card">
            {gato.historico_peso.map((h) => (
              <div key={h.id} className="list-row" style={{ marginBottom: 8, border: 'none', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="card-photo-placeholder" style={{ width: 40, height: 40, flexShrink: 0 }}>
                  <Scale size={18} />
                </span>
                <div style={{ flex: 1 }}>
                  <p className="card-title" style={{ fontSize: '0.92rem' }}>{formatarPeso(h.peso)}</p>
                  <p className="card-meta">{h.data_registro.split('-').reverse().join('/')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>


      {showPesoModal && (
        <div className="modal-overlay" onClick={() => setShowPesoModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPesoModal(false)}><X size={20} /></button>
            <p className="modal-title">Registrar Peso</p>
            <p className="card-meta" style={{ marginBottom: 16 }}>
              Peso atual: <strong>{formatarPeso(gato.peso) || 'não informado'}</strong>
            </p>
            <div className="field">
              <label>Novo peso</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number" step="0.1" min="0"
                  placeholder={pesoUnidade === 'g' ? 'Ex: 350' : 'Ex: 3.5'}
                  value={pesoValor}
                  onChange={(e) => setPesoValor(e.target.value)}
                  style={{ flex: 1 }}
                  autoFocus
                />
                <select value={pesoUnidade} onChange={(e) => setPesoUnidade(e.target.value)} style={{ width: 64 }}>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={salvarPeso} disabled={!pesoValor}>
              Salvar
            </button>
          </div>
        </div>
      )}

      {confirmando && (
        <ConfirmModal
          message={`Excluir registro de ${confirmando.medicamento_nome}?`}
          onConfirm={() => excluirRegistro(confirmando.id)}
          onCancel={() => setConfirmando(null)}
        />
      )}
    </Layout>
  );
}
