import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PawPrint, Weight, X, Scale, Syringe, Pill, Plus, Trash2 } from 'lucide-react';
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
    selector: '[data-tour="paiperfil-info"]',
    titulo: 'Informações do Reprodutor',
    texto: 'Todos os dados cadastrados: sexo, raça, cor, data de nascimento, idade calculada automaticamente e peso atual.',
  },
  {
    selector: '[data-tour="paiperfil-acoes"]',
    titulo: 'Editar e Registrar Peso',
    texto: 'Toque em "Editar" para alterar qualquer dado ou foto. Use "Registrar Peso" para salvar o peso atual em gramas ou quilos — o histórico fica salvo automaticamente.',
  },
  {
    selector: '[data-tour="paiperfil-dose"]',
    titulo: 'Registrar Dose',
    texto: 'Registre uma nova dose de vacina ou medicamento diretamente para este reprodutor.',
  },
  {
    selector: '[data-tour="paiperfil-historico-saude"]',
    titulo: 'Histórico de Saúde',
    texto: 'Todas as doses registradas aparecem aqui com data de aplicação e próxima dose agendada. Use a lixeira para remover um registro incorreto.',
  },
  {
    selector: '[data-tour="paiperfil-historico-peso"]',
    titulo: 'Histórico de Peso',
    texto: 'Acompanhe a evolução do peso ao longo do tempo. Cada registro mostra o peso e a data de medição.',
  },
];

export default function PaisPerfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pai, setPai] = useState(null);
  const [showPesoModal, setShowPesoModal] = useState(false);
  const [pesoValor, setPesoValor] = useState('');
  const [pesoUnidade, setPesoUnidade] = useState('kg');
  const [confirmando, setConfirmando] = useState(null);
  const toast = useToast();
  const { setSteps } = useTour();

  useEffect(() => { setSteps(TOUR, 'paiperfil'); return () => setSteps([]); }, []);

  const carregar = () => api.get(`/pais/${id}`).then((res) => setPai(res.data));

  useEffect(() => { carregar(); }, [id]);

  const excluirRegistro = async (regId) => {
    await api.delete(`/aplicacoes/${regId}`);
    setConfirmando(null);
    toast('Registro excluído!');
    carregar();
  };

  const salvarPeso = async () => {
    if (!pesoValor) return;
    const pesoG = pesoUnidade === 'kg' ? parseFloat(pesoValor) * 1000 : parseFloat(pesoValor);
    await api.patch(`/pais/${id}/peso`, { peso: pesoG });
    setShowPesoModal(false);
    setPesoValor('');
    toast('Peso registrado!');
    carregar();
  };

  if (!pai) return null;

  return (
    <Layout title="Perfil do Pai / Mãe" showBack>
      <div className="card" data-tour="paiperfil-info">
        {pai.foto_url ? (
          <img src={pai.foto_url} alt={pai.nome} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
        ) : (
          <div style={{ width: '100%', height: 220, borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <PawPrint size={48} />
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <p className="card-title" style={{ fontSize: '1.2rem' }}>{pai.nome}</p>
          <p className="card-meta" style={{ marginTop: 6 }}>
            Sexo: {pai.sexo === 'macho' ? 'Macho' : 'Fêmea'}<br />
            Raça: {pai.raca || 'Não informado'}<br />
            Cor: {pai.cor || 'Não informado'}<br />
            Nascimento: {pai.data_nascimento ? pai.data_nascimento.split('-').reverse().join('/') : 'Não informado'}<br />
            Idade: {pai.data_nascimento ? calcularIdade(pai.data_nascimento) : 'Não informado'}<br />
            Peso: {formatarPeso(pai.peso) || 'Não informado'}
            {pai.observacoes && <><br />Obs: {pai.observacoes}</>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }} data-tour="paiperfil-acoes">
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate(`/pais/${id}/editar`)}>
            Editar
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setPesoValor(''); setPesoUnidade('kg'); setShowPesoModal(true); }}>
            <Weight size={16} /> Registrar Peso
          </button>
        </div>
      </div>

      <button className="btn btn-primary" data-tour="paiperfil-dose" onClick={() => navigate(`/saude/registrar?pai_id=${id}`)}>
        <Plus size={18} /> Registrar Dose
      </button>

      <section data-tour="paiperfil-historico-saude">
        <h2 className="section-title">Histórico de Saúde</h2>
        {(!pai.historico || pai.historico.length === 0) ? (
          <EmptyState icon={Pill} title="Nenhum registro de saúde" description="Os registros de vacinas e medicamentos aparecerão aqui." />
        ) : (
          <div className="card">
            {pai.historico.map((h) => (
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
                <button className="icon-btn" style={{ color: 'var(--color-danger)', flexShrink: 0 }} onClick={() => setConfirmando(h)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section data-tour="paiperfil-historico-peso">
        <h2 className="section-title">Histórico de Peso</h2>
        {(!pai.historico_peso || pai.historico_peso.length === 0) ? (
          <EmptyState icon={Scale} title="Nenhum peso registrado" description="Registre o peso para acompanhar a evolução." />
        ) : (
          <div className="card">
            {pai.historico_peso.map((h) => (
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

      {confirmando && (
        <ConfirmModal
          message={`Excluir registro de ${confirmando.medicamento_nome}?`}
          onConfirm={() => excluirRegistro(confirmando.id)}
          onCancel={() => setConfirmando(null)}
        />
      )}

      {showPesoModal && (
        <div className="modal-overlay" onClick={() => setShowPesoModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPesoModal(false)}><X size={20} /></button>
            <p className="modal-title">Registrar Peso</p>
            <p className="card-meta" style={{ marginBottom: 16 }}>
              Peso atual: <strong>{formatarPeso(pai.peso) || 'não informado'}</strong>
            </p>
            <div className="field">
              <label>Novo peso</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number" step="0.1" min="0"
                  placeholder={pesoUnidade === 'g' ? 'Ex: 350' : 'Ex: 4.5'}
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
    </Layout>
  );
}
