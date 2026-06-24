import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Cat, Syringe, Pill, Plus, Trash2, Weight, X } from 'lucide-react';
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

  const medicamentosAtivos = gato.historico.filter((h) => h.proxima_dose);

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
          <div style={{ margin: '6px 0' }}><StatusBadge status={gato.status} /></div>
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
                  <p className="card-meta">{h.data_aplicada.split('-').reverse().join('/')}</p>
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

      <section data-tour="perfil-ativos">
        <h2 className="section-title">Medicamentos Ativos</h2>
        {medicamentosAtivos.length === 0 ? (
          <EmptyState icon={Syringe} title="Nenhuma dose futura agendada" />
        ) : (
          <div className="card">
            {medicamentosAtivos.map((m) => (
              <div key={m.id} className="list-row" style={{ marginBottom: 8, border: 'none', background: 'var(--color-bg)' }}>
                <div style={{ flex: 1 }}>
                  <p className="card-title" style={{ fontSize: '0.92rem' }}>{m.medicamento_nome}</p>
                  <p className="card-meta">Próxima dose: {m.proxima_dose.split('-').reverse().join('/')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {gato.ninhada_nome && (
        <section>
          <h2 className="section-title">Dados da Ninhada</h2>
          <div className="card">
            <p className="card-title" style={{ fontSize: '0.95rem' }}>{gato.ninhada_nome}</p>
            <div className="card-row" style={{ marginTop: 10 }}>
              {gato.mae_foto ? <img src={gato.mae_foto} className="card-photo" alt="Mãe" /> : <span className="card-photo-placeholder"><Cat size={22} /></span>}
              {gato.pai_foto ? <img src={gato.pai_foto} className="card-photo" alt="Pai" /> : <span className="card-photo-placeholder"><Cat size={22} /></span>}
            </div>
          </div>
        </section>
      )}

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
